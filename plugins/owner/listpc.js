// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/listpc.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .listpc

/*
wa.me/6283134600805
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

let handler = async (m, {
 conn,
 usedPrefix,
 text,
 command,
 args
}) => {
 let pc = (Object.entries(await conn.chats).map(([nama, isi]) => {
 return {
 nama,
 ...isi
 }
 })).filter(v => !v.nama.endsWith('g.us'))
 let list = pc.map((chat, index) => `*${index + 1}.* Name: ${chat.name}\nwa.me/${chat.id.split('@')[0]}\n`).join('\n')

 if (!args[0]) {
 m.reply(`📡 Private Chats List:\n\n${list}`)
 return
 }

 let i = parseInt(args[0]) - 1
 if (!pc[i]) {
 return m.reply('Invalid index!')
 }

 let pp = await conn.profilePictureUrl(pc[i].id, 'image')
 let str = `*Information about ${await conn.getName(pc[i].id)}*\n\n`
 str += `*Name:* ${pc[i].name || 'Tidak diketahui'}\n`
 str += `*ID:* @${pc[i].id.replace('@s.whatsapp.net', '')}\n`
 str += `*Presences:* ${pc[i].presences || 'Tidak diketahui'}\n`

 await conn.sendFile(m.chat, pp, 'profile.jpg', str, m, null, {
 mentions: [pc[i].id]
 })
}

handler.command = ['listpc']

handler.category = 'Owner'
handler.description = 'Listpc'

export default handler