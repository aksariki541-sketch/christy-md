// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/cecanthailand.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cecanthai

let handler = async (m, { conn }) => {
 try {
 let url = 'https://api.siputzx.my.id/api/r/cecan/thailand'
 await conn.sendFile(m.chat, url, 'cecan-thai.jpg', '', m)
 } catch (e) {
 console.error(e)
 m.reply(`❌ Gagal ambil gambar cecan Thailand.\n${e}`)
 }
}

handler.command = ['cecanthai']
handler.category = 'Fun'
handler.description = 'Cecanthailand'

export default handler