// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/cecanindo.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cecanindo

let handler = async (m, { conn }) => {
 try {
 let url = 'https://api.siputzx.my.id/api/r/cecan/indonesia'
 let caption = `🇮🇩 *Random Cecan Indonesia*\nAsli lokal, senyumnya bikin adem 😍`

 await conn.sendFile(m.chat, url, 'cecan-indo.jpg', caption, m)
 } catch (e) {
 console.error(e)
 m.reply(`❌ Gagal ambil gambar cecan Indonesia.\n${e}`)
 }
}

handler.command = ['cecanindo']
handler.category = 'Fun'
handler.description = 'Cecanindo'

export default handler