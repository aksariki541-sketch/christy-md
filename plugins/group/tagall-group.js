// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/tagall.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: tagall→tagall2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tagall2

// Code By Xnuvers007
// https://github.com/Xnuvers007
/////////////////////////////////

let handler = async (m, { conn, text, participants }) => {
    let teks = `◇───── Tag All ─────◇
乂 *Pesan : ${text ? text : 'kosong'}*\n\n`
				for (let mem of participants) {
					teks += `• @${mem.id.split('@')[0]}\n`
				}
				conn.sendMessage(m.chat, {
					text: teks,
					mentions: participants.map(a => a.id)
				}, {
					quoted: m
				})
  }
  
  handler.command = ['tagall2']
  handler.admin = true
  handler.group = true
  
  export default handler
handler.category = 'Group'
handler.description = 'Tagall'

