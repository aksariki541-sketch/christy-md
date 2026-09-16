// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/tagadmin.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tagadmin

let handler = async (m, { conn, participants, text }) => {
 if (!m.isGroup) throw '…ini bukan grup.'

 let admins = participants
 .filter(v => v.admin)
 .map(v => v.id)

 if (!admins.length) throw '…adminnya hilang? aneh.'

 let alasan = text ? `\n\nalasan: ${text}` : ''

 let teks = `🎧 *tag admin dulu deh...*\n\n`
 teks += admins.map(v => `@${v.split('@')[0]}`).join('\n')
 teks += `${alasan}\n\n_...cepet respon ya._`

 await conn.sendMessage(m.chat, {
 text: teks,
 mentions: admins
 }, { quoted: m })
}

handler.command = ['tagadmin']
handler.group = true

handler.category = 'Group'
handler.description = 'Tagadmin'

export default handler