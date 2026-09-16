import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { card } from './lib/ui.js'
import { installCompatGlobals, installCompatPrototypes, exposePlugins, isAdmin, isBotAdmin, groupMeta } from './lib/compat.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginDir = path.join(__dirname, 'plugins')
const configPath = path.join(__dirname, 'config.json')
const ownerPath = path.join(__dirname, 'database/owner.json')
const premiumPath = path.join(__dirname, 'database/premium.json')

export const plugins = new Map()

const pluginCache = new Map()
const watchers = new Map()
const pendingReloads = new Map()

const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'))

function getPluginFiles(dir) {
    let files = []
    if (!fs.existsSync(dir)) return files
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name)
        if (item.isDirectory()) files.push(...getPluginFiles(full))
        else if (item.isFile() && item.name.endsWith('.js')) files.push(full)
    }
    return files
}

async function loadPlugin(file) {
    try {
        const module = await import(`${pathToFileURL(file).href}?update=${Date.now()}`)
        const handler = module.default
        if (!handler) return
        // simpan asal file (dipakai untuk dokumentasi & alat bantu)
        if (!handler.__file) handler.__file = file

        if (pluginCache.has(file)) {
            for (const key of pluginCache.get(file)) plugins.delete(key)
        }

        const keys = []
        if (handler.command && !(handler.command instanceof RegExp)) {
            const commands = Array.isArray(handler.command) ? handler.command : [handler.command]
            for (const cmd of commands) {
                const key = String(cmd).toLowerCase()
                plugins.set(key, handler)
                keys.push(key)
            }
        }

        if (handler.customPrefix) {
            const key = Symbol(file)
            plugins.set(key, handler)
            keys.push(key)
        }

        pluginCache.set(file, keys)
    } catch (e) {
        reportPluginError(file, e)
    }
}

// Pesan error plugin dibuat jelas & bisa ditindaklanjuti. Penyebab paling umum:
// file di folder lib/ belum ikut ter-update setelah project diperbarui.
function reportPluginError(file, error) {
    const name = path.relative(pluginDir, file)
    const message = String(error?.message || error)

    const hints = []
    if (/does not provide an export named/.test(message)) {
        const spec = message.match(/module '([^']+)'/)?.[1] || ''
        if (spec.startsWith('./') || spec.startsWith('../')) {
            hints.push('File dependency internal (folder lib/) masih versi lama.')
            hints.push('Upload ulang SELURUH isi project, jangan hanya file yang baru diubah.')
            hints.push('Cara cek cepat: npm run check')
        } else if (spec) {
            hints.push(`Paket "${spec}" versinya tidak cocok dengan cara import di plugin ini.`)
            hints.push('Jalankan: npm install — kalau masih error, laporkan nama pluginnya.')
        }
    } else if (/Cannot find module/.test(message)) {
        hints.push('Ada file yang belum ter-upload atau path-nya salah.')
        hints.push('Jalankan: npm run check')
    } else if (error?.name === 'SyntaxError') {
        hints.push('Ada kesalahan penulisan di file plugin tersebut.')
        hints.push('Cek baris yang ditunjuk pada pesan di atas.')
    }

    console.error(`\n✘ Plugin gagal dimuat: ${name}`)
    console.error(`  ${error?.name || 'Error'}: ${message.split('\n')[0]}`)
    for (const hint of hints) console.error(`  → ${hint}`)
    console.error('')
}

async function unloadPlugin(file) {
    if (!pluginCache.has(file)) return
    for (const key of pluginCache.get(file)) plugins.delete(key)
    pluginCache.delete(file)
}

export async function initPlugins() {
    for (const file of getPluginFiles(pluginDir)) {
        await loadPlugin(file)
    }
    watch(pluginDir)
    exposePlugins(plugins)
}

function watch(dir) {
    if (watchers.has(dir)) return
    watchers.set(dir, fs.watch(dir, (_, filename) => {
        if (!filename || !filename.endsWith('.js')) return
        const file = path.join(dir, filename)
        if (pendingReloads.has(file)) clearTimeout(pendingReloads.get(file))
        pendingReloads.set(file, setTimeout(async () => {
            pendingReloads.delete(file)
            if (fs.existsSync(file)) await loadPlugin(file)
            else await unloadPlugin(file)
        }, 200))
    }))
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (item.isDirectory()) watch(path.join(dir, item.name))
    }
}

function extractCommandFromMessage(m) {
    let body = ''
    let isButtonResponse = false
    try {
        if (m.message) {
            if (m.message.conversation) body = m.message.conversation
            else if (m.message.extendedTextMessage?.text) body = m.message.extendedTextMessage.text
            else if (m.message.imageMessage?.caption) body = m.message.imageMessage.caption
            else if (m.message.videoMessage?.caption) body = m.message.videoMessage.caption
            else if (m.message.documentMessage?.caption) body = m.message.documentMessage.caption
            else if (m.message.interactiveResponseMessage) {
                const inter = m.message.interactiveResponseMessage
                if (inter.nativeFlowResponseMessage) {
                    const flow = inter.nativeFlowResponseMessage
                    if (flow.paramsJson) {
                        try {
                            const params = JSON.parse(flow.paramsJson)
                            body = params.id || params.buttonId || params.rowId || params.index || ''
                        } catch { body = flow.name || '' }
                    } else body = flow.name || ''
                    isButtonResponse = true
                } else if (inter.buttonReply) {
                    body = inter.buttonReply.selectedButtonId || ''
                    isButtonResponse = true
                } else if (inter.singleSelectReply) {
                    body = inter.singleSelectReply.selectedRowId || ''
                    isButtonResponse = true
                }
            } else if (m.message.templateButtonReplyMessage) {
                body = m.message.templateButtonReplyMessage.selectedId || ''
                isButtonResponse = true
            } else if (m.message.buttonsResponseMessage) {
                body = m.message.buttonsResponseMessage.selectedButtonId || ''
                isButtonResponse = true
            }
        }
    } catch (error) {
        console.error('Error parsing message:', error)
    }
    return { body, isButtonResponse }
}

export default async function handleMessage(conn, m) {
    try {
        const { body, isButtonResponse } = extractCommandFromMessage(m)
        if (!body) return
        m.text = body
        m.isButtonResponse = isButtonResponse

        const config = readJSON(configPath)
        const owner = readJSON(ownerPath)
        const premium = readJSON(premiumPath)

        const number = m.sender.split('@')[0]
        const botNumber = conn.decodeJid(conn.user.id).split('@')[0]

        const creatorList = [botNumber, ...(config.creator || [])]
            .map(v => String(v).replace(/[^0-9]/g, ''))

        m.isCreator = creatorList.includes(number)
        m.isOwner = m.isCreator || owner.map(v => v.split('@')[0]).includes(number)
        m.isPremium = m.isOwner || premium.map(v => v.split('@')[0]).includes(number)

        if (config.botMode === 'self' && !m.isOwner && !m.fromMe) return

        // Semua balasan plugin memakai satu format kartu agar tampilan konsisten
        const notifReply = async (text, title = 'Information') => {
            await conn.sendMessage(m.chat, {
                text: card(title, text)
            }, { quoted: m })
        }

        // Info grup dibaca sekali per pesan (cached 10 detik di lib/compat.js)
        const groupInfo = m.isGroup ? await groupMeta(conn, m.chat) : null
        const adminFlag = m.isGroup ? await isAdmin(conn, m) : false
        const botAdminFlag = m.isGroup ? await isBotAdmin(conn, m) : false

        // Satu bentuk konteks untuk semua plugin. Key di bawah ini disediakan
        // supaya plugin hasil adaptasi dari base lain tetap jalan apa adanya.
        const context = (extra = {}) => {
            const pfx = extra.prefix ?? ''
            return {
                conn,
                sock: conn,
                plugins,
                notifReply,
                participants: groupInfo?.participants || [],
                groupMetadata: groupInfo,
                isOwner: m.isOwner,
                isCreator: m.isCreator,
                isPremium: m.isPremium,
                isPrems: m.isPremium,
                isAdmin: adminFlag,
                isBotAdmin: botAdminFlag,
                quoted: m.quoted,
                q: m.quoted?.text || '',
                usedPrefix: pfx,
                ...extra
            }
        }

        const checkAccess = async handler => {
            const permissions = [
                ['owner', m.isOwner, config.accessDenied.owner],
                ['creator', m.isCreator, config.accessDenied.creator],
                ['premium', m.isPremium, config.accessDenied.premium]
            ]
            for (const [key, allowed, message] of permissions) {
                if (handler[key] && !allowed) {
                    await notifReply(message, 'Access Denied')
                    return true
                }
            }

            // Flag tambahan yang dipakai plugin adaptasi dari base lain
            if (handler.group && !m.isGroup) {
                await notifReply('Perintah ini hanya bisa dipakai di dalam grup.', 'Khusus Grup')
                return true
            }
            if (handler.private && m.isGroup) {
                await notifReply('Perintah ini hanya bisa dipakai di chat pribadi.', 'Khusus Chat Pribadi')
                return true
            }
            if (handler.admin && !(await isAdmin(conn, m))) {
                await notifReply('Perintah ini hanya untuk admin grup.', 'Access Denied')
                return true
            }
            if (handler.botAdmin && m.isGroup && !(await isBotAdmin(conn, m))) {
                await notifReply('Jadikan bot admin grup dulu supaya perintah ini bisa dipakai.', 'Bot Bukan Admin')
                return true
            }

            return false
        }

        if (isButtonResponse) {
            let bodyText = body
            const prefixes = config.prefix || ['.']
            for (const p of prefixes) {
                if (bodyText.startsWith(p)) {
                    bodyText = bodyText.slice(p.length)
                    break
                }
            }
            const args = bodyText.trim().split(/\s+/)
            const command = args.shift().toLowerCase()
            const handler = plugins.get(command)
            if (!handler) return
            if (await checkAccess(handler)) return
            return await handler(m, context({
                args, text: args.join(' '),
                command, prefix: ''
            }))
        }

        const hasConfigPrefix = (config.prefix || ['.']).some(p => m.text.startsWith(p))

        if (!hasConfigPrefix) {
            let matchedHandler = null
            for (const handler of plugins.values()) {
                if (!handler.customPrefix) continue
                if (!handler.customPrefix.source.startsWith('^')) continue
                if (!handler.customPrefix.test(m.text)) continue
                matchedHandler = handler
                break
            }

            if (!matchedHandler) {
                for (const handler of plugins.values()) {
                    if (!handler.customPrefix) continue
                    if (handler.customPrefix.source.startsWith('^')) continue
                    if (!handler.customPrefix.test(m.text)) continue
                    matchedHandler = handler
                    break
                }
            }

            if (matchedHandler) {
                if (await checkAccess(matchedHandler)) return
                return await matchedHandler(m, context({
                    args: [],
                    text: m.text,
                    command: '',
                    prefix: ''
                }))
            }
        }

        let prefix = ''
        let command = ''
        let args = []

        if (hasConfigPrefix) {
            prefix = (config.prefix || ['.']).find(p => m.text.startsWith(p))
            const body2 = m.text.slice(prefix.length).trim()
            if (!body2) return
            const parts = body2.split(/\s+/)
            command = parts.shift().toLowerCase()
            args = parts
        } else {
            const trimmed = m.text.trim()
            if (/\s/.test(trimmed)) return
            command = trimmed.toLowerCase()
            args = []
        }

        const handler = plugins.get(command)
        if (!handler) return
        if (await checkAccess(handler)) return

        await handler(m, context({
            args,
            text: args.join(' '),
            command, prefix
        }))
    } catch (e) {
        // Plugin hasil adaptasi sering memakai `throw 'teks'` untuk pesan ke pengguna.
        // Teks seperti itu ditampilkan sebagai pesan biasa, bukan dianggap crash.
        if (typeof e === 'string' && e.trim()) {
            try {
                const config = readJSON(configPath)
                await conn.sendMessage(m.chat, { text: card(config.botName, e.trim()) }, { quoted: m })
            } catch (inner) {
                console.error(inner)
            }
            return
        }
        console.error(e)
    }
}

// Variabel global yang dipakai plugin hasil adaptasi (global.owner, global.namebot, dst.)
try {
    const config = readJSON(configPath)
    const module = await import('./lib/ui.js')
    installCompatGlobals({ config, identity: module.brand() })
    installCompatPrototypes()
} catch (e) {
    console.error('Gagal menyiapkan kompatibilitas plugin:', e?.message || e)
}