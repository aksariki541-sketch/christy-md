// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/toai.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .aisticker, .stickerai, .sai

let handler = async (m, { conn }) => {
 if (!m.quoted) return m.reply('Reply sticker biasa yang mau dijadiin AI sticker ')

 let q = m.quoted
 let mime = q.mimetype || q.msg?.mimetype || ''

 if (!/webp/i.test(mime)) {
 return m.reply('Reply sticker webp yaa')
 }

 try {
 await m.react?.('🕒')

 let buffer = await q.download()
 if (!buffer) throw new Error('Gagal download sticker')

 await conn.sendMessage(
 m.chat,
 {
 sticker: buffer,
 mimetype: 'image/webp',
 isAiSticker: true
 },
 { quoted: m }
 )

 await m.react?.('✅')
 } catch (e) {
 await m.react?.('❌')
 m.reply(`Gagal bikin AI sticker:\n${e.message}`)
 }
}

handler.command = ['aisticker', 'stickerai', 'sai']

handler.category = 'Media'
handler.description = 'Toai'

export default handler