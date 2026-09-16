// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/game/tebakgame.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tebakgame

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

let timeout = 120000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
 conn.game = conn.game ? conn.game : {}
 let id = 'tebakgame-' + m.chat
 if (id in conn.game) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.game[id][0])
 let src = JSON.parse(fs.readFileSync(ROOT + '/json/tebakgame.json', 'utf-8'))
 let json = src[Math.floor(Math.random() * src.length)]
 let caption = `
Logo apakah ini?

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hgame untuk bantuan
Bonus: ${poin} XP
`.trim()
 conn.game[id] = [
 await conn.sendFile(m.chat, json.img, 'tebakgame.jpg', caption, m),
 json, poin,
 setTimeout(() => {
 if (conn.game[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.game[id][0])
 delete conn.game[id]
 }, timeout)
 ]
}
handler.command = ['tebakgame']

handler.category = 'Fun'
handler.description = 'Tebakgame'

export default handler