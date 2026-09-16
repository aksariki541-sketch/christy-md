// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/cekidch.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cekidgc, .cekidgrup, .cekidch, .idch

const handler = async (m, { conn, text, command, isOwner }) => {
 try {
 await m.react('🆔')

 if (/^(cekidgc|cekidgrup)$/i.test(command)) {
 if (!isOwner) return m.reply('❌ Khusus owner.')
 if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa dipakai di grup.')

 let id = m.chat

 return await conn.sendMessage(m.chat, {
 text: `✨ *ID Grup:*\n${id}`,
 nativeFlow: [
 {
 text: '✨ Salin ID',
 copy: id
 }
 ]
 }, { quoted: m })
 }

 if (/^(cekidch|idch)$/i.test(command)) {
 if (!text) {
 return m.reply('❌ Masukkan link channel WhatsApp.')
 }

 if (!text.includes('https://whatsapp.com/channel/')) {
 return m.reply('❌ Link channel tidak valid.')
 }

 let result = text.split('https://whatsapp.com/channel/')[1].split('?')[0].trim()

 let res = await conn.newsletterMetadata('invite', result).catch(() => null)

 let id = res?.id || result + '@newsletter'

 return await conn.sendMessage(m.chat, {
 text: `✨ *ID Channel:*\n${id}`,
 nativeFlow: [
 {
 text: '✨ Salin ID',
 copy: id
 }
 ]
 }, { quoted: m })
 }

 } catch (e) {
 console.log(e)
 m.reply('❌ Terjadi kesalahan.')
 }
}

handler.command = ['cekidgc', 'cekidgrup', 'cekidch', 'idch']
handler.category = 'Tools'
handler.description = 'Cekidch'

export default handler