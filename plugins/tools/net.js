import dns from 'dns/promises'
import net from 'net'
import os from 'os'
import axios from 'axios'
import { formatBytes } from '../../lib/media.js'
import { SYMBOL } from '../../lib/ui.js'

function primaryIPs() {
    const rows = []
    for (const [name, list] of Object.entries(os.networkInterfaces())) {
        for (const addr of list || []) {
            if (addr.internal) continue
            rows.push(`${addr.family === 'IPv4' ? 'IPv4' : 'IPv6'}  ${name.padEnd(12)} ${addr.address}`)
        }
    }
    return rows
}

const tcpCheck = (host, port, timeout = 5000) => new Promise((resolve) => {
    const started = Date.now()
    const socket = new net.Socket()
    const finish = (ok, note) => {
        socket.destroy()
        resolve({ ok, note, ms: Date.now() - started })
    }
    socket.setTimeout(timeout)
    socket.once('connect', () => finish(true, 'terbuka'))
    socket.once('timeout', () => finish(false, 'timeout'))
    socket.once('error', (err) => finish(false, err.code || err.message))
    socket.connect(port, host)
})

let handler = async (m, { args, command, text, notifReply }) => {
    switch (command) {
        case 'dns': {
            const host = (args[0] || '').trim()
            if (!host) return notifReply('Format:\n.dns <domain>\n\nContoh:\n.dns google.com', 'DNS Lookup')

            const results = await Promise.allSettled([
                dns.resolve4(host),
                dns.resolve6(host),
                dns.resolveMx(host),
                dns.resolveTxt(host),
                dns.resolveNs(host)
            ])
            const [a, aaaa, mx, txt, ns] = results.map(r => (r.status === 'fulfilled' ? r.value : []))

            if (!a.length && !aaaa.length && !mx.length && !ns.length) {
                return notifReply(`Tidak ada record DNS yang ditemukan untuk ${host}.`, 'DNS Lookup')
            }

            const lines = [`${SYMBOL.mark} ${host}`, '']
            if (a.length) lines.push(`A     : ${a.join(', ')}`)
            if (aaaa.length) lines.push(`AAAA  : ${aaaa.slice(0, 3).join(', ')}`)
            if (mx.length) lines.push(`MX    : ${mx.slice(0, 5).map(r => `${r.exchange} (${r.priority})`).join(', ')}`)
            if (ns.length) lines.push(`NS    : ${ns.slice(0, 5).join(', ')}`)
            if (txt.length) lines.push(`TXT   : ${txt.slice(0, 3).map(t => t.join(' ').slice(0, 80)).join(' | ')}`)

            return notifReply(lines.join('\n'), 'DNS Lookup')
        }

        case 'pinghost':
        case 'portcheck': {
            const host = (args[0] || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
            const port = Number(args[1]) || 443
            if (!host) {
                return notifReply('Format:\n.pinghost <host> [port]\n\nContoh:\n.pinghost google.com 443\n.pinghost 8.8.8.8 53', 'Cek Koneksi')
            }
            if (port < 1 || port > 65535) return notifReply('Port harus antara 1-65535.', 'Cek Koneksi')

            const tcp = await tcpCheck(host, port)
            const lines = [
                `Host   : ${host}`,
                `Port   : ${port}`,
                `Status : ${tcp.ok ? '✅ ' + tcp.note : '❌ ' + tcp.note}`,
                `Waktu  : ${tcp.ms} ms`
            ]

            try {
                const resolved = await dns.lookup(host)
                lines.splice(2, 0, `IP     : ${resolved.address}`)
            } catch {
                // host mungkin tidak bisa di-resolve, tetap tampilkan hasil TCP
            }

            return notifReply(lines.join('\n'), 'Cek Koneksi')
        }

        case 'ip':
        case 'myip': {
            const rows = primaryIPs()
            return notifReply([
                ...(rows.length ? rows : ['Tidak ada alamat IP non-loopback.']),
                '',
                `Hostname: ${os.hostname()}`
            ].join('\n'), 'IP Lokal')
        }

        case 'pubip':
        case 'publicip': {
            try {
                const { data } = await axios.get('https://api.ipify.org?format=json', { timeout: 10000 })
                return notifReply(`IP publik server: *${data.ip}*`, 'IP Publik')
            } catch (e) {
                return notifReply(`Gagal mengambil IP publik.\n${e.message}`, 'IP Publik')
            }
        }

        case 'fetch':
        case 'geturl': {
            const url = (text || '').trim()
            if (!/^https?:\/\//i.test(url)) {
                return notifReply('Format:\n.fetch <url>\n\nContoh:\n.fetch https://example.com', 'Fetch URL')
            }
            try {
                const { data, status, headers } = await axios.get(url, {
                    timeout: 15000,
                    responseType: 'text',
                    maxRedirects: 5,
                    headers: { 'User-Agent': `${(await import('../../lib/ui.js')).brand().name}/1.0` }
                })
                const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
                const contentType = String(headers?.['content-type'] || '-').split(';')[0]

                return notifReply([
                    `Status   : ${status}`,
                    `Tipe     : ${contentType}`,
                    `Ukuran   : ${formatBytes(Buffer.byteLength(body))}`,
                    '',
                    body.slice(0, 1500) + (body.length > 1500 ? '\n\n... (dipotong)' : '')
                ].join('\n'), 'Hasil Fetch')
            } catch (e) {
                const status = e.response?.status
                return notifReply(`Gagal mengambil URL.\n${status ? `HTTP ${status}` : e.message}`, 'Fetch URL')
            }
        }

        case 'httpstatus':
        case 'statuscode': {
            const url = (text || '').trim()
            if (!/^https?:\/\//i.test(url)) return notifReply('Format:\n.httpstatus <url>', 'Cek HTTP')
            try {
                const response = await axios.head(url, { timeout: 10000, validateStatus: () => true })
                return notifReply([
                    `URL    : ${url}`,
                    `Status : ${response.status} ${response.statusText || ''}`,
                    `Server : ${response.headers?.server || '-'}`
                ].join('\n'), 'Cek HTTP')
            } catch (e) {
                return notifReply(`Gagal mengecek.\n${e.message}`, 'Cek HTTP')
            }
        }

        case 'resolvemx': {
            const domain = (args[0] || '').trim()
            if (!domain) return notifReply('Format:\n.resolvemx <domain>', 'MX Lookup')
            const records = await dns.resolveMx(domain).catch(() => [])
            if (!records.length) return notifReply(`Tidak ada MX record untuk ${domain}.`, 'MX Lookup')
            return notifReply(
                records.sort((a, b) => a.priority - b.priority).map(r => `${r.priority}  ${r.exchange}`).join('\n'),
                `MX ${domain}`
            )
        }

        case 'revdns':
        case 'reversedns': {
            const ip = (args[0] || '').trim()
            if (!ip) return notifReply('Format:\n.revdns <ip>\n\nContoh:\n.revdns 8.8.8.8', 'Reverse DNS')
            const hosts = await dns.reverse(ip).catch(() => [])
            return notifReply(hosts.length ? hosts.join('\n') : `Tidak ada PTR record untuk ${ip}.`, 'Reverse DNS')
        }

        default:
            return
    }
}

handler.command = ['dns', 'pinghost', 'portcheck', 'ip', 'myip', 'pubip', 'publicip', 'fetch', 'geturl',
    'httpstatus', 'statuscode', 'resolvemx', 'revdns', 'reversedns']
handler.category = 'Tools'
handler.description = 'Jaringan: DNS, cek koneksi, fetch URL, IP'

export default handler
