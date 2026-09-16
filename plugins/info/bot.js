import os from 'os'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { runtime } from '../../lib/myfunc.js'
import { brand, card, header, section, SYMBOL } from '../../lib/ui.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '../../config.json')

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2)

let handler = async (m, { conn, command, plugins, notifReply }) => {
    const identity = brand()
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

    switch (command) {
        case 'info':
        case 'botinfo': {
            const totalCommands = new Set([...plugins.keys()].filter(k => typeof k === 'string')).size
            return notifReply([
                `${SYMBOL.mark} *${identity.name}*`,
                `Versi     : v${identity.version}`,
                `Tagline   : ${identity.tagline}`,
                `Creator   : ${identity.owner}`,
                `Library   : Node.js ESM + Baileys`,
                `Mode      : ${config.botMode}`,
                `Prefix    : ${(config.prefix || ['.']).join('  ')}`,
                `Command   : ${totalCommands} terdaftar`,
                `Runtime   : ${runtime(process.uptime())}`
            ].join('\n'), 'Bot Info')
        }

        case 'runtime':
        case 'uptime': {
            return notifReply([
                `Bot aktif   : ${runtime(process.uptime())}`,
                `Sistem aktif: ${runtime(os.uptime())}`,
                `Node        : ${process.version}`
            ].join('\n'), 'Runtime')
        }

        case 'sysinfo': {
            const cpus = os.cpus()
            const total = os.totalmem()
            const free = os.freemem()
            return notifReply([
                `Platform  : ${os.platform()} ${os.release()}`,
                `Arsitektur: ${os.arch()}`,
                `Hostname  : ${os.hostname()}`,
                `CPU       : ${cpus[0]?.model || 'tidak diketahui'}`,
                `Core      : ${cpus.length}`,
                `RAM       : ${mb(total - free)} / ${mb(total)} MB terpakai`
            ].join('\n'), 'System Info')
        }

        case 'stats': {
            const categories = new Map()
            for (const plugin of new Set(plugins.values())) {
                const category = plugin?.category || 'Other'
                categories.set(category, (categories.get(category) || 0) + 1)
            }
            const rows = [...categories.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => `${SYMBOL.bullet} ${category}: ${count} plugin`)

            return notifReply([
                `Total plugin : ${new Set(plugins.values()).size}`,
                `Total command: ${new Set([...plugins.keys()].filter(k => typeof k === 'string')).size}`,
                '',
                ...rows
            ].join('\n'), 'Statistik')
        }

        case 'plugins':
        case 'pluginlist': {
            const groups = new Map()
            for (const plugin of new Set(plugins.values())) {
                const category = plugin?.category || 'Other'
                const list = groups.get(category) || []
                if (plugin.command) {
                    const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
                    list.push(commands[0])
                } else if (plugin.label) list.push(plugin.label)
                groups.set(category, list)
            }
            const body = [...groups.entries()]
                .map(([category, list]) => `${SYMBOL.mark} *${category}* (${list.length})\n${list.join(', ')}`)
                .join('\n\n')

            return notifReply(body, 'Daftar Plugin')
        }

        case 'id':
        case 'whoami': {
            return notifReply([
                `Nama    : ${m.pushName || 'No Name'}`,
                `Nomor   : ${String(m.sender).split('@')[0]}`,
                `Chat    : ${m.chat}`,
                `Tipe    : ${m.isGroup ? 'Grup' : 'Pribadi'}`,
                `Status  : ${m.isCreator ? 'Creator' : m.isOwner ? 'Owner' : m.isPremium ? 'Premium' : 'User'}`
            ].join('\n'), 'Identitas')
        }

        case 'groupid':
        case 'chatid': {
            return notifReply(`ID chat ini:\n${m.chat}\n\nSalin ID di atas untuk keperluan konfigurasi.`, 'Chat ID')
        }

        case 'speed':
        case 'latency': {
            const start = Date.now()
            const latency = start - (Number(m.messageTimestamp) * 1000)
            return notifReply([
                `Latensi pesan : ${latency} ms`,
                `Heap dipakai  : ${mb(process.memoryUsage().heapUsed)} MB`,
                `RSS           : ${mb(process.memoryUsage().rss)} MB`,
                `Proses aktif  : ${runtime(process.uptime())}`
            ].join('\n'), 'Speed')
        }

        case 'source':
        case 'credit': {
            return notifReply([
                `${SYMBOL.mark} *${identity.name}* v${identity.version}`,
                `${identity.tagline}`,
                '',
                `Creator : ${identity.owner}`,
                `Stack   : Node.js ESM + Baileys`,
                '',
                `Kartu credit ini dibuat otomatis dari config.json,`,
                `jadi selalu ikut kalau nama bot/creator diubah.`
            ].join('\n'), 'Credit')
        }

        default:
            return
    }
}

handler.command = ['info', 'botinfo', 'runtime', 'uptime', 'sysinfo', 'stats', 'plugins', 'pluginlist',
    'id', 'whoami', 'groupid', 'chatid', 'speed', 'latency', 'source', 'credit']
handler.category = 'Main'
handler.description = 'Informasi bot, sistem, dan statistik'

export default handler
