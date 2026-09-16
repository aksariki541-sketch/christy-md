// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/fun-carabalikan.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .carabalikan

let handler = async (m, { conn }) => {
 let teks = [
 'Badut paling setia yang masih berharap dia balik lagi padahal udah punya yang baru 🤡'
 ]

 let hasil = teks[Math.floor(Math.random() * teks.length)]

 conn.sendMessage(m.chat, {
 text: hasil
 }, { quoted: m })
}

handler.command = ['carabalikan']

handler.category = 'Fun'
handler.description = 'Carabalikan'

export default handler