// ---------------------------------------------------------------------------
// Lapisan kompatibilitas untuk plugin hasil adaptasi
//
// Banyak plugin (termasuk plugin bawaan project sebelumnya) memakai API yang
// umum di base lain: conn.sendFile, conn.reply, global.owner, m.reply, dsb.
// Di project ini API tersebut tidak ada, jadi disediakan di sini — supaya
// plugin yang diadaptasi tetap bisa jalan tanpa mengubah inti handler.
// ---------------------------------------------------------------------------

import path from 'path'

const IMAGE = /\.(jpe?g|png|webp|gif|bmp)$/i
const VIDEO = /\.(mp4|mkv|mov|avi|webm)$/i
const AUDIO = /\.(mp3|m4a|aac|ogg|opus|wav|flac)$/i
const DOC = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|txt|csv|apk|js|json|html?)$/i

const guessType = (name = '') => {
    if (IMAGE.test(name)) return 'image'
    if (VIDEO.test(name)) return 'video'
    if (AUDIO.test(name)) return 'audio'
    return 'document'
}

// conn.sendFile(chat, file, filename, caption, quoted) — signature umum di base lain
export async function sendFile(conn, chat, file, filename = 'file', caption = '', quoted = null, options = {}) {
    const source = Buffer.isBuffer(file) ? file : { url: String(file) }
    const kind = guessType(filename)

    if (kind === 'image') {
        return conn.sendMessage(chat, { image: source, caption, ...options }, { quoted })
    }
    if (kind === 'video') {
        return conn.sendMessage(chat, { video: source, caption, ...options }, { quoted })
    }
    if (kind === 'audio') {
        return conn.sendMessage(chat, {
            audio: source,
            mimetype: options.mimetype || 'audio/mpeg',
            ptt: options.ptt ?? false
        }, { quoted })
    }
    return conn.sendMessage(chat, {
        document: source,
        fileName: path.basename(filename),
        caption,
        mimetype: options.mimetype || 'application/octet-stream'
    }, { quoted })
}

// conn.reply(chat, text, quoted)
export async function replyText(conn, chat, text, quoted = null) {
    return conn.sendMessage(chat, { text: String(text) }, { quoted })
}

// Data grup (admin & metadata) untuk plugin yang butuh, dengan cache pendek.
const metaCache = new Map()
export async function groupMeta(conn, chat, ttl = 10000) {
    const hit = metaCache.get(chat)
    if (hit && Date.now() - hit.at < ttl) return hit.meta
    const meta = await conn.groupMetadata(chat).catch(() => null)
    metaCache.set(chat, { at: Date.now(), meta })
    return meta
}

export async function isAdmin(conn, m) {
    if (m.isCreator) return true
    if (!m.isGroup) return false
    const meta = await groupMeta(conn, m.chat)
    const admins = (meta?.participants || []).filter(p => p.admin).map(p => p.id)
    return admins.includes(m.sender)
}

export async function isBotAdmin(conn, m) {
    if (!m.isGroup) return false
    const meta = await groupMeta(conn, m.chat)
    const me = conn.decodeJid?.(conn.user?.id) || conn.user?.id
    const admins = (meta?.participants || []).filter(p => p.admin).map(p => p.id)
    return admins.includes(me)
}

export async function getGroupName(conn, chat) {
    const meta = await groupMeta(conn, chat)
    return meta?.subject || 'Grup ini'
}

// ---------------------------------------------------------------------------
// Helper prototipe yang di base lain ditambahkan lewat lib/simple.js.
// Hanya yang benar-benar dipakai plugin hasil adaptasi, implementasi sederhana.
// ---------------------------------------------------------------------------
export function installCompatPrototypes() {
    if (Array.prototype.getRandom) return

    Array.prototype.getRandom = function () {
        return this[Math.floor(Math.random() * this.length)]
    }
    String.prototype.getRandom = function (ext = '') {
        return `${Math.floor(Math.random() * 10000)}${ext}`
    }
    Number.prototype.getRandom = String.prototype.getRandom
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1)
    }
    Number.prototype.toTimeString = function () {
        const total = Math.abs(Math.floor(this / 1000))
        const h = Math.floor(total / 3600)
        const m = Math.floor((total % 3600) / 60)
        const s = total % 60
        return [h && `${h} jam`, m && `${m} menit`, s && `${s} detik`].filter(Boolean).join(' ') || '0 detik'
    }
}

// ---------------------------------------------------------------------------
// Shim variabel global yang dipakai sebagian plugin hasil adaptasi.
// Hanya diisi kalau belum ada, jadi aman dipanggil berulang.
// ---------------------------------------------------------------------------
export function installCompatGlobals({ config, identity } = {}) {
    if (!config) return

    global.owner ??= (config.creator || []).map(v => [String(v).replace(/[^0-9]/g, ''), 'Owner', true])
    global.namebot ??= identity?.name || config.botName
    global.botname ??= global.namebot
    global.prefix ??= config.prefix || ['.']
    global.opts ??= {}
    global.sleepTimer ??= 0
    global.sleepMode ??= false
    global.autotyping ??= false
    global.version ??= identity?.version || config.botVersion
    global.wm5 ??= identity?.name || config.botName

    // Sebagian plugin memakai nama ini sebagai identifier langsung (tanpa global.),
    // jadi harus ada di globalThis. Kalau tidak, plugin error "x is not defined".
    globalThis.wm ??= identity?.name || config.botName
    globalThis.author ??= `${identity?.name || config.botName} · ${config.ownerName}`
    globalThis.packname ??= identity?.name || config.botName
    globalThis.stickauthor ??= config.ownerName
    globalThis.namebot ??= identity?.name || config.botName
    globalThis.botname ??= identity?.name || config.botName
    globalThis.prefix ??= config.prefix || ['.']
    globalThis.config ??= config
}

// Peta plugin project ini, supaya plugin adaptasi bisa membaca daftar command
export function exposePlugins(map) {
    globalThis.plugins ??= map
}
