// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/link.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .linkgrup

let handler = async (m, { conn }) => {
 if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa digunakan di grup!')

 try {
 // Ambil link grup terbaru
 let inviteCode;
 try {
 inviteCode = await conn.groupInviteCode(m.chat)
 inviteCode = `https://chat.whatsapp.com/${inviteCode}`
 } catch {
 inviteCode = '❌ Gagal mengambil link grup'
 }

 m.reply(`*Link Grup:*\n${inviteCode}`)
 } catch (err) {
 console.log(err)
 m.reply('❌ Terjadi kesalahan saat mengambil link grup.')
 }
}

handler.command = ['linkgrup']
handler.group = true 
handler.botAdmin = true

handler.category = 'Group'
handler.description = 'Link'

export default handler