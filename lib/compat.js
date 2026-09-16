// ---------------------------------------------------------------------------
// Lapisan kompatibilitas untuk plugin hasil adaptasi
//
// Banyak plugin (termasuk plugin bawaan project sebelumnya) memakai API yang
// umum di base lain: conn.sendFile, conn.reply, global.owner, m.reply, dsb.
// Di project ini API tersebut tidak ada, jadi disediakan di sini — supaya
// plugin yang diadaptasi tetap bisa jalan tanpa mengubah inti handler.
// ---------------------------------------------------------------------------

import path from 'path'
import { read as storeRead, write as storeWrite } from './store.js'

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

    // -------------------------------------------------------------------
    // Variabel global khas base Nakano-Miku-MD
    // Dipakai ratusan plugin hasil penggabungan: state game, API key, dsb.
    // Semua diisi dengan ??= supaya tidak menimpa konfigurasi pemakaian.
    // -------------------------------------------------------------------
    installLegacyDatabase()

    global.APIs ??= {}
    global.APIKeys ??= {}
    global.apikey ??= ''
    global.API ??= (name, ...paths) => [global.APIs[name] || name, ...paths].join('/')
    global.multiplier ??= 1
    global.domain ??= ''
    global.rpg ??= {}
    global.dfail ??= () => {}
    global.getStickerSession ??= () => null
    global.sendAdminLog ??= () => {}
    global.nameCache ??= {}

    // Pesan "quoted" palsu khas base lama (fkontak / fstatus / fmeta)
    const fakeContact = {
        key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
        message: {
            contactMessage: {
                displayName: identity?.name || config.botName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${identity?.name || config.botName}\nEND:VCARD`
            }
        }
    }
    globalThis.fkontak ??= fakeContact
    globalThis.fstatus ??= fakeContact
    globalThis.fmeta ??= fakeContact

    // Metadata stiker
    globalThis.stickpack ??= identity?.name || config.botName
    globalThis.stickauth ??= config.ownerName
    globalThis.packname2 ??= config.ownerName

    // State game/sesi per chat — di base lama dibuat di main.js
    const stateBags = [
        'tebakbendera', 'tebakjkt', 'tebakkartun', 'tebakkimia', 'tebaklagu',
        'tebaksurah', 'tebakwarna', 'tebakgambar', 'tebakgame', 'tebakkata',
        'tebaklogo', 'tebakanime', 'caklontong', 'family100', 'kuismath',
        'maths', 'math', 'suit', 'games', 'tebaktebakan', 'tekateki',
        'akinator', 'beritaInterval', 'groupSchedules', 'akiraaSesi'
    ]
    for (const name of stateBags) {
        if (!(name in globalThis)) globalThis[name] = {}
    }
    globalThis.akinatorSessions ??= new Map()
    globalThis.aiSessions ??= new Map()
    globalThis.autocorrect ??= false
}

// global.db versi ringan dengan struktur gaya base Nakano (global.db.data.users,
// .chats, .settings, dst.). Disimpan sebagai JSON di database/nakano-db.json,
// ditulis berkala tiap 60 detik dan saat proses berhenti.
function installLegacyDatabase() {
    if (global.db) return
    const defaults = {
        users: {}, chats: {}, settings: {}, msgs: {},
        sticker: {}, stats: {}, others: {}, bots: {}
    }
    global.db = { data: { ...defaults, ...(storeRead('nakano-db', {}) || {}) } }

    const persist = () => {
        try {
            storeWrite('nakano-db', global.db.data)
        } catch (e) {
            console.error('global.db gagal disimpan:', e?.message || e)
        }
    }
    const timer = setInterval(persist, 60000)
    timer.unref?.()
    process.once('exit', () => {
        clearInterval(timer)
        persist()
    })
}

// Peta plugin project ini, supaya plugin adaptasi bisa membaca daftar command
export function exposePlugins(map) {
    globalThis.plugins ??= map
}
