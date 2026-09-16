// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/creator.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .owner, .infoowner, .creator

let handler = async (m, { conn }) => {
 const number = global.owner[0][0]
 const name = global.owner[0][1]

 const vcard =
 'BEGIN:VCARD\n' +
 'VERSION:3.0\n' +
 `FN:${name}\n` +
 `ORG:${global.namebot};\n` +
 `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n` +
 'END:VCARD'

 await conn.sendMessage(
 m.chat,
 {
 contacts: {
 displayName: name,
 contacts: [{ vcard }]
 }
 },
 { quoted: m }
 )
}

handler.command = ['owner', 'infoowner', 'creator']

handler.category = 'Main'
handler.description = 'Creator'

export default handler