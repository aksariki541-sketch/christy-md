// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/cecanvietnam.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cecanvietnam

let handler = async (m, { conn }) => {
 try {
 let url = 'https://api.siputzx.my.id/api/r/cecan/vietnam'
 await conn.sendFile(m.chat, url, 'cecan-vietnam.jpg', '', m)
 } catch (e) {
 console.error(e)
 m.reply(`❌ Gagal ambil gambar cecan Vietnam.\n${e}`)
 }
}

handler.command = ['cecanvietnam']
handler.category = 'Fun'
handler.description = 'Cecanvietnam'

export default handler