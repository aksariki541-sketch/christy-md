import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { brand } from '../../lib/ui.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '../../config.json')
const templatePath = path.join(__dirname, '../../lib/ping.html')

const pct = (value) => `${Math.min(100, Math.max(0, value)).toFixed(1)}`

// CPU load rata-rata per core (loadavg tersedia di Linux/macOS)
function cpuLoad() {
    const cores = os.cpus().length || 1
    const load = os.loadavg()[0]
    if (!load) return 0
    return pct((load / cores) * 100)
}

// RAM terpakai
function ramLoad() {
    const total = os.totalmem()
    if (!total) return 0
    return pct(((total - os.freemem()) / total) * 100)
}

// Disk terpakai pada partisi tempat bot berjalan
function diskLoad() {
    try {
        if (typeof fs.statfsSync !== 'function') return null
        const root = path.parse(process.cwd()).root || '/'
        const st = fs.statfsSync(root)
        const total = st.blocks * st.bsize
        const free = st.bavail * st.bsize
        if (!total) return null
        return pct(((total - free) / total) * 100)
    } catch {
        return null
    }
}

// Swap (Linux) — dibaca dari /proc/meminfo, di platform lain tampil sebagai '—'
function swapInfo() {
    try {
        const meminfo = fs.readFileSync('/proc/meminfo', 'utf8')
        const read = (key) => Number((meminfo.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm')) || [])[1] || 0)
        const totalKb = read('SwapTotal')
        const freeKb = read('SwapFree')
        if (!totalKb) return '—'
        const usedGb = ((totalKb - freeKb) / 1024 / 1024).toFixed(2)
        const totalGb = (totalKb / 1024 / 1024).toFixed(2)
        return `${usedGb} / ${totalGb} GB`
    } catch {
        return '—'
    }
}

// Alamat IPv4 lokal non-loopback
function primaryIP() {
    try {
        for (const list of Object.values(os.networkInterfaces())) {
            for (const net of list || []) {
                if (net.family === 'IPv4' && !net.internal) return net.address
            }
        }
    } catch {
        // diabaikan, pakai fallback
    }
    return '—'
}

let handler = async (m, { conn, notifReply }) => {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        const identity = brand()
        const template = fs.readFileSync(templatePath, 'utf8')

        const latency = Date.now() - (Number(m.messageTimestamp) * 1000)
        const heapUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        const rssMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)

        const html = template
            .replace(/%LATENCY%/g, latency)
            .replace(/%PLATFORM%/g, os.platform())
            .replace(/%OS_INFO%/g, `${os.type()} ${os.release()}`)
            .replace(/%ARCH_INFO%/g, os.arch())
            .replace(/%CPU_CORES%/g, os.cpus().length || 1)
            .replace(/%HEAP_USED%/g, heapUsed)
            .replace(/%RSS_MEM%/g, rssMem)
            .replace(/%NODE_INFO%/g, `Node ${process.version}`)
            .replace(/%BOTUPTIME%/g, process.uptime())
            .replace(/%SYSTEMUPTIME%/g, os.uptime())
            .replace(/%CPU_LOAD%/g, cpuLoad())
            .replace(/%RAM_LOAD%/g, ramLoad())
            .replace(/%DISK_LOAD%/g, diskLoad() ?? '0.0')
            .replace(/%DISK_STATE%/g, diskLoad() === null ? 'unavailable' : 'ok')
            .replace(/%SWAP_INFO%/g, swapInfo())
            .replace(/%IP_ADDR%/g, primaryIP())
            .replace(/%HOSTNAME%/g, os.hostname())
            .replace(/%TOTAL_RAM%/g, (os.totalmem() / 1024 / 1024 / 1024).toFixed(1))
            .replace(/%BOTNAME%/g, config.botName)
            .replace(/%OWNERNAME%/g, config.ownerName)
            .replace(/%TAGLINE%/g, identity.tagline)
            .replace(/%VERSION%/g, identity.version)
            .replace(/%YEAR%/g, new Date().getFullYear())

        const responseId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
        const responseData = {
            response_id: responseId,
            sections: [{
                view_model: {
                    primitive: {
                        __typename: 'GenAIaeacdsnwHtmlPrimitive',
                        payload: html,
                        trusted_sources: []
                    },
                    __typename: 'GenAISingleLayoutViewModel'
                }
            }]
        }

        const dataBase64 = Buffer.from(JSON.stringify(responseData)).toString('base64')

        await conn.relayMessage(m.chat, {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: { messageDisclaimerText: '', botResponseId: responseId }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [{ messageType: 2, messageText: `${config.botName} · Server Monitor` }],
                        unifiedResponse: { data: dataBase64 },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        }, { messageId: responseId })
    } catch (e) {
        await notifReply(`❌ ${e.message}`, 'Ping Error')
    }
}

handler.command = ['ping', 'pinglive', 'serverinfo', 'monitor']
handler.category = 'System'
handler.description = 'Monitor server secara realtime'

export default handler
