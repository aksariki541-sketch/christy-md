// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/fun-pilih.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .fakepilih

import axios from "axios"

let handler = async (m, { conn, text }) => {
 if (!text) {
 return m.reply(
 "Contoh:\n.fakepilih Messi,Ronaldo"
 )
 }

 let [teks1, teks2] = text.split(",")

 if (!teks1 || !teks2) {
 return m.reply(
 "Format salah!\nContoh:\n.fakepilih Messi,Ronaldo"
 )
 }

 try {
 await m.reply("⏳ Membuat gambar...")

 const url = `https://api.synoxcloud.biz.id/canvas/drakehotline?teks1=${encodeURIComponent(teks1.trim())}&teks2=${encodeURIComponent(teks2.trim())}`

 await conn.sendMessage(m.chat, {
 image: { url },
 caption: "✅ Fake Pilih Berhasil"
 }, { quoted: m })

 } catch (e) {
 console.error(e)
 m.reply(`❌ Error: ${e.message}`)
 }
}

handler.command = ['fakepilih']

handler.category = 'Fun'
handler.description = 'Pilih'

export default handler