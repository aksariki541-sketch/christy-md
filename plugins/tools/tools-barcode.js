// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-barcode.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .barcode

let handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) return m.reply(`Contoh:\n${usedPrefix + command} 8991234567890`)

 try {
 const url = `https://barcodeapi.org/api/128/${encodeURIComponent(text)}`

 await conn.sendFile(
 m.chat,
 url,
 'barcode.png',
 `📦 Barcode:\n${text}`,
 m
 )
 } catch (e) {
 m.reply('Gagal membuat barcode.')
 }
}

handler.command = ['barcode']
handler.category = 'Tools'
handler.description = 'Barcode'

export default handler