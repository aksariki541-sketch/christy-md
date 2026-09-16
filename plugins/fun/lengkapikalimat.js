// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/game/lengkapikalimat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .lengkapikalimat
// Catatan    : handler.before/all -> handler.onMessage

import fs from 'fs'
import similarity from 'similarity'

let timeout = 120000
let poin = 4999
const threshold = 0.72

let handler = async (m, { conn, usedPrefix }) => {
  conn.lengkapikalimat = conn.lengkapikalimat ? conn.lengkapikalimat : {}

  let id = m.chat
  if (id in conn.lengkapikalimat)
    return m.reply('Masih ada soal yang belum terjawab di chat ini!')

  let src = JSON.parse(fs.readFileSync('./json/lengkapikalimat.json'))
  let json = src[Math.floor(Math.random() * src.length)]

  let soal = json.soal || '-'
  let jawaban = (json.jawaban || '').toLowerCase().trim()

  let caption = `
*LENGKAPI KALIMAT*

${soal}

⏱️ Timeout ${(timeout / 1000)} detik
💎 Bonus ${poin} XP

Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await m.reply(caption)

  conn.lengkapikalimat[id] = [
    msg,
    { soal, jawaban },
    poin,
    setTimeout(() => {
      if (conn.lengkapikalimat[id]) {
        m.reply(`⏰ Waktu habis!\nJawaban: *${jawaban}*`)
        delete conn.lengkapikalimat[id]
      }
    }, timeout)
  ]
}

handler.command = ['lengkapikalimat']

export default handler

handler.onMessage = async function (m, { conn }) {
  if (m.fromMe || m.isBaileys) return
  conn.lengkapikalimat = conn.lengkapikalimat ? conn.lengkapikalimat : {}

  let id = m.chat
  if (!(id in conn.lengkapikalimat)) return

  let [msg, data, poin, time] = conn.lengkapikalimat[id]
  if (!m.text) return

  let teks = m.text.toLowerCase().replace(/\s+/g, ' ').trim()
  let jawaban = data.jawaban

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    delete conn.lengkapikalimat[id]
    m.reply(`🏳️ *Menyerah!*\nJawaban: *${jawaban}*`)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(time)
    delete conn.lengkapikalimat[id]
    global.db.data.users[m.sender].exp += poin
    m.reply(`✅ *Benar!*\nJawaban: *${jawaban}*\n+${poin} XP`)
    return true
  }

  if (similarity(teks, jawaban) >= threshold) {
    m.reply('🤏 Dikit lagi!')
    return true
  }

  return true
}
handler.category = 'Fun'
handler.description = 'Lengkapikalimat'

