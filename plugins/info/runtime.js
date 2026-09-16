// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/runtime.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: runtime→runtime2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .runtime2

import os from 'os'
import fs from 'fs'

let handler = async (m, { conn }) => {
try {
let uptime = process.uptime()
let hours = Math.floor(uptime / 3600)
let minutes = Math.floor((uptime % 3600) / 60)
let seconds = Math.floor(uptime % 60)

await conn.sendMessage(m.chat, {
  orderText: `🌷 Runtime Bot

❏ Runtime : ${hours} Jam ${minutes} Menit ${seconds} Detik

❏ System : ${os.platform()}
❏ Arch : ${os.arch()}
❏ RAM : ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB

✨ Christy MD`,
thumbnail: fs.readFileSync('./media/thumbnail.jpg')
}, {
quoted: m
})

} catch (e) {
m.reply('🌷 Terjadi kesalahan saat mengambil data runtime.')
}
}

handler.command = ['runtime2']

export default handler
handler.category = 'Main'
handler.description = 'Runtime'

