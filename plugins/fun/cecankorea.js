// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/cecankorea.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cecankorea

let handler = async (m, { conn }) => {
 try {
 let url = 'https://api.siputzx.my.id/api/r/cecan/korea'
 let caption = `📸 *Random Cecan korea*\nSenyumnya bikin semangat 😳`

 await conn.sendFile(m.chat, url, 'cecan.jpg', caption, m)
 } catch (e) {
 console.error(e)
 m.reply(`❌ Gagal ambil gambar cecan.\n${e}`)
 }
}

handler.command = ['cecankorea']
handler.category = 'Fun'
handler.description = 'Cecankorea'

export default handler