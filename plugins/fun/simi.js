// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/simi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .simi, .simisimi

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) throw `Contoh: ${usedPrefix + command} halo`
 try {
 let res = await fetch(`https://api.nexray.web.id/ai/simisimi?text=${encodeURIComponent(text)}`)
 let json = await res.json()
 if (json.status) {
 await conn.sendMessage(m.chat, { text: json.result }, { quoted: m })
 } else {
 throw 'Gagal mendapatkan respon dari Simi.'
 }
 } catch (e) {
 throw 'Terjadi kesalahan sistem.'
 }
}

handler.command = ['simi', 'simisimi']

handler.category = 'Fun'
handler.description = 'Simi'

export default handler