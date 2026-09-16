// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/settings.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .group, .gc

let handler = async (m, { conn, args, usedPrefix, command }) => {
 let isClose = { // Switch Case Like :v
 'open': 'not_announcement',
 'close': 'announcement',
 }[(args[0] || '')]
 if (isClose === undefined)
 throw `
*Format salah! Contoh :*
 *○ ${usedPrefix + command} close*
 *○ ${usedPrefix + command} open*
`.trim()
 await conn.groupSettingUpdate(m.chat, isClose)
}
handler.command = ['group', 'gc']

handler.admin = true
handler.botAdmin = true

handler.category = 'Group'
handler.description = 'Settings'

export default handler
