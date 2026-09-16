// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/simulate.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .simulate, .simulasi

let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {
 if (!event) return await conn.reply(m.chat, `contoh:
${usedPrefix + command} welcome @user
${usedPrefix + command} bye @user
${usedPrefix + command} promote @user
${usedPrefix + command} demote @user`.trim(), m, null, [['Welcome', '#simulate welcome'], ['Bye', '#simulate bye']])
 let mentions = text.replace(event, '').trimStart()
 let who = mentions ? conn.parseMention(mentions) : []
 let part = who.length ? who : [m.sender]
 let act = false
 m.reply(`*${htjava} Simulating ${event}...*`)
 switch (event.toLowerCase()) {
 case 'add':
 case 'invite':
 case 'welcome':
 act = 'add'
 break
 case 'bye':
 case 'kick':
 case 'leave':
 case 'remove':
 act = 'remove'
 break
 case 'promote':
 act = 'promote'
 break
 case 'demote':
 act = 'demote'
 break
 default:
 throw eror
 }
 if (act) return conn.participantsUpdate({
 id: m.chat,
 participants: part,
 action: act
 })
}
handler.rowner = true

handler.command = ['simulate', 'simulasi']
handler.category = 'Owner'
handler.description = 'Simulate'

export default handler