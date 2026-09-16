// Command : .afk, .away, .unafk, .back
// Fungsi  : status "Away From Keyboard". Saat orang menandai (mention) atau membalas
//           pesan user yang sedang AFK, bot memberi tahu alasan + sudah berapa lama.
//           Status otomatis dicabut begitu user itu mengirim pesan lagi.
//
// Catatan mekanisme: handler project ini tidak punya hook "setiap pesan", jadi plugin ini
// memakai dua jalur sekaligus:
//   1. handler.onMessage -> dipanggil handler.js untuk SETIAP pesan (lihat hookOpsional di handler.js)
//   2. handler.command   -> untuk .afk / .away / .unafk / .back

import fs from 'fs'
import { dbPath, read, write } from '../../lib/store.js'

const FILE = 'afk'
const MAX_REASON = 120
const MAX_NOTIF = 3 // maksimal berapa user AFK yang diberitahukan per pesan

// ---- baca/tulis dengan cache -------------------------------------------------
// Hook onMessage jalan di SETIAP pesan, jadi file database tidak dibaca ulang
// kalau belum berubah (dicek lewat mtime).
let cache = null
let cacheMtime = 0

function load() {
    try {
        const mtime = fs.statSync(dbPath(FILE)).mtimeMs
        if (mtime !== cacheMtime) {
            cache = read(FILE, {})
            cacheMtime = mtime
        }
    } catch {
        cache = cache || {}
    }
    return cache
}

function save(data) {
    write(FILE, data)
    cache = data
    try {
        cacheMtime = fs.statSync(dbPath(FILE)).mtimeMs
    } catch {
        cacheMtime = 0
    }
}

// ---- util -----------------------------------------------------------------
const jidNum = (jid) => String(jid || '').split('@')[0].split(':')[0]

function durasi(ms) {
    const detik = Math.max(1, Math.floor(ms / 1000))
    if (detik < 60) return `${detik} detik`
    const menit = Math.floor(detik / 60)
    if (menit < 60) return `${menit} menit`
    const jam = Math.floor(menit / 60)
    const sisaMenit = menit % 60
    if (jam < 24) return sisaMenit ? `${jam} jam ${sisaMenit} menit` : `${jam} jam`
    const hari = Math.floor(jam / 24)
    const sisaJam = jam % 24
    return sisaJam ? `${hari} hari ${sisaJam} jam` : `${hari} hari`
}

const waktu = (ts) =>
    new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
        .format(new Date(ts)).replace('.', ':')

// mulai dari pesan: JID yang disebut (mention) + pesan yang dibalas
function sasaran(m) {
    const daftar = new Set()

    const mention = m?.msg?.contextInfo?.mentionedJid || m?.mentionedJid || []
    for (const jid of mention) daftar.add(jid)

    if (m?.quoted?.sender) daftar.add(m.quoted.sender)

    // balasan tanpa sender (dokumen/lokasi) -> pakai participant
    const part = m?.msg?.contextInfo?.participant
    if (part && m?.quoted) daftar.add(part)

    return [...daftar].filter(Boolean)
}

// ---- hook: setiap pesan ----------------------------------------------------
async function onMessage(m, { conn }) {
    if (!m || m.fromMe) return

    const data = load()
    const sender = m.sender
    const catatan = data[sender]

    // 1. user yang sedang AFK mengirim pesan -> cabut status
    if (catatan) {
        delete data[sender]
        save(data)

        const teks = String(m.text || '').trim()
        const sapaan = teks.match(/^(hai+|hi+|hey+|hello+|halo+|hallo+|pagi|siang|sore|malam|assalamualaikum|permisi|oi+)\b/i)
        const nama = catatan.name || jidNum(sender)

        // balasan disesuaikan: sapaan pendek dibalas sapaan juga, teks panjang dirangkum
        const perintah = /^[.#!/]/.test(teks)   // jangan echo command mentah (.ping, .menu, ...)
        const pembuka = sapaan
            ? `👋 ${sapaan[0]} juga, *${nama}*!`
            : teks && !perintah && teks.length <= 40
                ? `👋 *${teks}* — siap, *${nama}* sudah aktif lagi!`
                : `👋 Selamat datang kembali, *${nama}*!`

        await conn.sendMessage(m.chat, {
            text: pembuka + '\n\n' +
                `Status AFK dicabut.\n` +
                `Alasan tadi : ${catatan.reason}\n` +
                `Durasi AFK  : ${durasi(Date.now() - catatan.since)}`
        }, { quoted: m })
        return
    }

    // 2. ada orang menyebut / membalas user yang AFK
    const daftar = sasaran(m).filter(jid => data[jid])
    if (!daftar.length) return

    const pesan = []
    for (const jid of daftar.slice(0, MAX_NOTIF)) {
        const info = data[jid]
        pesan.push(
            `💤 *${info.name || jidNum(jid)}* sedang AFK\n` +
            `   Alasan  : ${info.reason}\n` +
            `   Sejak   : ${waktu(info.since)} (${durasi(Date.now() - info.since)} lalu)`
        )
    }
    if (daftar.length > MAX_NOTIF) pesan.push(`… dan ${daftar.length - MAX_NOTIF} lainnya`)

    await conn.sendMessage(m.chat, { text: pesan.join('\n\n') }, { quoted: m })
}

// ---- command ---------------------------------------------------------------
let handler = async (m, { args, command, text, notifReply }) => {
    const data = load()
    const sender = m.sender

    if (command === 'unafk' || command === 'back') {
        if (!data[sender]) return notifReply('Kamu tidak sedang AFK.', 'Status AFK')
        const info = data[sender]
        delete data[sender]
        save(data)
        return notifReply(
            `Status AFK dicabut.\n\nAlasan tadi : ${info.reason}\nDurasi AFK  : ${durasi(Date.now() - info.since)}`,
            'Kembali Aktif'
        )
    }

    // .afk <alasan>  (tanpa alasan -> "Sedang AFK")
    const reason = (text || '').trim().slice(0, MAX_REASON) || 'Sedang AFK'
    const name = m.pushName || jidNum(sender)
    const sudah = data[sender]

    data[sender] = { name, reason, since: sudah?.since || Date.now(), updated: Date.now() }
    save(data)

    await notifReply(
        [
            `Status AFK aktif${sudah ? ' (diperbarui)' : ''}.`,
            '',
            `Nama   : ${name}`,
            `Alasan : ${reason}`,
            `Sejak  : ${waktu(data[sender].since)}`,
            '',
            `Orang yang menandai kamu akan diberi tahu otomatis.`,
            `Status dicabut sendiri begitu kamu mengirim pesan apa pun.`
        ].join('\n'),
        'AFK Aktif'
    )
}

handler.help = ['afk', 'away', 'unafk', 'back']
handler.tags = ['tools']
handler.command = ['afk', 'away', 'unafk', 'back']
handler.description = 'Status AFK — diberi tahu otomatis saat ditandai'
handler.category = 'Tools'
handler.onMessage = onMessage

export default handler
