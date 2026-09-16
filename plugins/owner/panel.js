import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { reloadBrand, brand, SYMBOL } from '../../lib/ui.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '../../config.json')
const rootDir = path.join(__dirname, '../..')

const readConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))
const writeConfig = (config) => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    reloadBrand()
    return config
}

let handler = async (m, { args, command, text, conn, plugins, notifReply }) => {
    const config = readConfig()

    switch (command) {
        case 'setname': {
            if (!text) return notifReply(`Nama bot sekarang: *${config.botName}*\n\nFormat:\n.setname <nama baru>`, 'Set Nama')
            writeConfig({ ...config, botName: text.slice(0, 40) })
            return notifReply(`Nama bot diubah menjadi *${text.slice(0, 40)}*.\nBanner, menu, dan credit langsung ikut berubah.`, 'Set Nama')
        }

        case 'setowner': {
            if (!text) return notifReply(`Owner sekarang: *${config.ownerName}*\n\nFormat:\n.setowner <nama baru>`, 'Set Owner')
            writeConfig({ ...config, ownerName: text.slice(0, 40) })
            return notifReply(`Nama owner diubah menjadi *${text.slice(0, 40)}*.`, 'Set Owner')
        }

        case 'settagline': {
            if (!text) return notifReply(`Tagline sekarang: *${config.tagline}*\n\nFormat:\n.settagline <tagline baru>`, 'Set Tagline')
            writeConfig({ ...config, tagline: text.slice(0, 60) })
            return notifReply(`Tagline diubah menjadi *${text.slice(0, 60)}*.`, 'Set Tagline')
        }

        case 'setprefix': {
            const requested = (text || '').replace(/\s+/g, '')
            if (!requested) {
                return notifReply(`Prefix sekarang: ${(config.prefix || []).join('  ')}\n\nFormat:\n.setprefix .#!  (tanpa spasi)`, 'Set Prefix')
            }
            const prefixes = [...new Set([...requested])]
            writeConfig({ ...config, prefix: prefixes })
            return notifReply(`Prefix diubah menjadi: ${prefixes.join('  ')}`, 'Set Prefix')
        }

        case 'setpairing': {
            const code = (text || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
            if (!code) {
                return notifReply(`Pairing code sekarang: *${config.pairingCode}*\n\nFormat:\n.setpairing KODE (huruf/angka, maks 8 karakter)`, 'Set Pairing')
            }
            const value = code.slice(0, 8)
            writeConfig({ ...config, pairingCode: value })
            return notifReply(`Pairing code diubah menjadi *${value}*.\nDipakai saat login berikutnya (atau setelah hapus folder session).`, 'Set Pairing')
        }

        case 'setconfig': {
            const [key, ...rest] = args
            const value = rest.join(' ')
            if (!key || !value) {
                const keys = Object.keys(config).filter(k => k !== 'accessDenied')
                return notifReply([
                    'Format:\n.setconfig <key> <value>',
                    '',
                    'Key yang tersedia:',
                    keys.join(', '),
                    '',
                    'Catatan: .setconfig hanya boleh mengubah key yang sudah ada,',
                    'key sensitif (creator/accessDenied) tidak bisa diubah lewat sini.'
                ].join('\n'), 'Set Config')
            }
            const blocked = ['creator', 'accessDenied']
            if (blocked.includes(key)) {
                return notifReply(`Key *${key}* dilindungi dan tidak bisa diubah lewat command ini.`, 'Ditolak')
            }
            if (!(key in config)) {
                return notifReply(`Key *${key}* tidak ada di config.json.\nGunakan .setconfig tanpa argumen untuk melihat daftar key.`, 'Key Tidak Ditemukan')
            }
            let parsed = value
            if (value === 'true') parsed = true
            else if (value === 'false') parsed = false
            else if (value !== '' && !Number.isNaN(Number(value))) parsed = Number(value)

            writeConfig({ ...config, [key]: parsed })
            return notifReply(`${key} = ${JSON.stringify(parsed)}`, 'Set Config')
        }

        case 'config':
        case 'getconfig': {
            const safe = { ...config }
            const rows = Object.entries(safe).map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            return notifReply(rows.join('\n'), 'Config Aktif')
        }

        case 'reload':
        case 'reloadplugin': {
            const { initPlugins } = await import('../../handler.js')
            await initPlugins()
            return notifReply(`Plugin dimuat ulang. Total command aktif: ${new Set([...plugins.keys()].filter(k => typeof k === 'string')).size}`, 'Reload Plugin')
        }

        case 'restart':
        case 'reboot': {
            await notifReply('Bot akan restart sekarang.\n\nJika dijalankan lewat PM2/systemd, bot akan menyala otomatis. Kalau manual, jalankan `npm start` lagi.', 'Restart')
            setTimeout(() => process.exit(0), 1500)
            return
        }

        case 'broadcast':
        case 'bc': {
            if (!text) return notifReply('Format:\n.broadcast <pesan>\n\nPesan dikirim ke semua grup yang diikuti bot, dengan jeda agar tidak diblokir.', 'Broadcast')

            const groups = await conn.groupFetchAllParticipating().catch(() => ({}))
            const ids = Object.keys(groups || {})
            if (!ids.length) return notifReply('Bot tidak sedang berada di grup mana pun.', 'Broadcast')

            await notifReply(`Mengirim broadcast ke ${ids.length} grup...`, 'Broadcast')
            let sent = 0
            for (const id of ids) {
                try {
                    await conn.sendMessage(id, { text: `${SYMBOL.mark} ${text}` })
                    sent++
                    await new Promise(resolve => setTimeout(resolve, 1200))
                } catch {
                    // grup mungkin sudah keluar / tidak bisa dikirim
                }
            }
            return notifReply(`Broadcast selesai: ${sent}/${ids.length} grup berhasil.`, 'Broadcast')
        }

        case 'cleandb':
        case 'resetdb': {
            const dbDir = path.join(rootDir, 'database')
            const targets = ['owner.json', 'premium.json']
            const backups = []
            for (const file of targets) {
                const full = path.join(dbDir, file)
                if (!fs.existsSync(full)) continue
                const backup = `${full}.bak-${Date.now()}`
                fs.copyFileSync(full, backup)
                fs.writeFileSync(full, '[]')
                backups.push(path.basename(backup))
            }
            return notifReply([
                'Database owner & premium dikosongkan.',
                '',
                'Backup dibuat:',
                ...backups.map(b => `• ${b}`)
            ].join('\n'), 'Reset Database')
        }

        case 'session': {
            const sessionDir = path.join(rootDir, 'session')
            const files = fs.existsSync(sessionDir) ? fs.readdirSync(sessionDir).length : 0
            const size = files
                ? formatSum(sessionDir)
                : '0 B'
            return notifReply([
                `Folder session : ${sessionDir}`,
                `Jumlah file    : ${files}`,
                `Total ukuran   : ${size}`,
                '',
                files ? 'Hapus folder session untuk logout (bot minta login lagi).' : 'Belum ada sesi — bot belum pernah login.'
            ].join('\n'), 'Info Session')
        }

        default:
            return
    }
}

function formatSum(dir) {
    let total = 0
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        try {
            total += entry.isDirectory() ? 0 : fs.statSync(full).size
        } catch {
            // file sudah hilang, abaikan
        }
    }
    return total < 1024 ? `${total} B` : `${(total / 1024).toFixed(1)} KB`
}

handler.command = ['setname', 'setowner', 'settagline', 'setprefix', 'setpairing', 'setconfig',
    'config', 'getconfig', 'reload', 'reloadplugin', 'restart', 'reboot',
    'broadcast', 'bc', 'cleandb', 'resetdb', 'session']
handler.category = 'Owner'
handler.description = 'Panel owner: ubah identitas & config bot (.setname = nama bot)'
handler.owner = true

export default handler
