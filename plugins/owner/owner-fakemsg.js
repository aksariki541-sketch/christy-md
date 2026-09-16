// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-fakemsg.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .fakemsg

let handler = async (m, { conn, text }) => {
 if (!m.quoted) return m.reply('Reply pesan yang ingin dijadikan target.')
 if (!text) return m.reply('Masukkan teks.\nContoh: .fakemsg hai')

 try {
 const sent = await conn.sendMessage(m.chat, { text: '' })

 await conn.sendMessage(
 m.chat,
 {
 text: text,
 edit: sent.key
 }
 )
 } catch (e) {
 m.reply(String(e))
 }
}

handler.command = ['fakemsg']
handler.owner = true

handler.category = 'Owner'
handler.description = 'Fakemsg'

export default handler