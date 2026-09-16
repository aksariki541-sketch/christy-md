// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/autotyping.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .autotyping

let handler = async (m, { args }) => {
 if (!args[0]) return m.reply(`
Ketik:
.autotyping on
.autotyping off
 `)

 let input = args[0].toLowerCase()
 if (!['on', 'off'].includes(input)) return m.reply('Gunakan `on` atau `off`')

 global.autotyping = input === 'on'
 m.reply(`Auto Typing ${global.autotyping ? '✅ AKTIF' : '❌ NONAKTIF'}`)
}

handler.command = ['autotyping']
handler.owner = true
handler.category = 'Owner'
handler.description = 'Autotyping'

export default handler