// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/cecanjapan.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cecanjapan

let handler = async (m, { conn }) => {
 try {
 let url = 'https://api.siputzx.my.id/api/r/cecan/japan'
 let caption = `🇯🇵 *Random Cecan Jepang*\nManisnya bikin pengen liburan ke Tokyo 😳`

 await conn.sendFile(m.chat, url, 'cecan-japan.jpg', caption, m)
 } catch (e) {
 console.error(e)
 m.reply(`❌ Gagal ambil gambar cecan Jepang.\n${e}`)
 }
}

handler.command = ['cecanjapan']
handler.category = 'Fun'
handler.description = 'Cecanjapan'

export default handler