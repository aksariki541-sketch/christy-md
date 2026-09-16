// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/cecanchina.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cecanchina

let handler = async (m, { conn }) => {
 try {
 let url = 'https://api.siputzx.my.id/api/r/cecan/china'
 let caption = `📸 *Random Cecan China*\nSenyumnya bikin semangat 😳`

 await conn.sendFile(m.chat, url, 'cecan.jpg', caption, m)
 } catch (e) {
 console.error(e)
 m.reply(`❌ Gagal ambil gambar cecan.\n${e}`)
 }
}

handler.command = ['cecanchina']
handler.category = 'Fun'
handler.description = 'Cecanchina'

export default handler