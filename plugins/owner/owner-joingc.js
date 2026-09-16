// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-joingc.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .joingc

let handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) {
 return m.reply(
 `Contoh:\n${usedPrefix + command} https://`
 )
 }

 const match = text.trim().match(
 /(?:https?:\/\/)?chat\.whatsapp\.com\/([0-9A-Za-z]{20,30})/i
 )

 if (!match) {
 return m.reply('❌ Link grup WhatsApp tidak valid.')
 }

 const code = match[1]

 try {
 await m.react?.('⏳')

 // Preview info grup (opsional)
 let info = null
 try {
 info = await conn.groupGetInviteInfo(code)
 } catch {}

 // Join grup
 const jid = await conn.groupAcceptInvite(code)

 await m.react?.('✅')

 let txt = `✅ Berhasil bergabung ke grup.`

 if (info) {
 txt += `

📌 Nama : ${info.subject || '-'}
👥 Member : ${info.size || info.participants?.length || '-'}
🆔 JID : ${jid}`
 }

 m.reply(txt)
 } catch (e) {
 console.error(e)

 let msg = '❌ Gagal bergabung ke grup.'

 if (/already/i.test(String(e))) {
 msg = 'ℹ️ Bot sudah berada di grup tersebut.'
 } else if (/expired/i.test(String(e))) {
 msg = '❌ Link grup sudah kedaluwarsa.'
 } else if (/not-authorized|401/i.test(String(e))) {
 msg = '❌ Link grup tidak valid.'
 }

 m.reply(msg)
 }
}

handler.command = ['joingc']
handler.owner = true

handler.category = 'Owner'
handler.description = 'Joingc'

export default handler