// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/kapankah.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .kapankah

let handler = async (m, { conn, command, text }) => {
 conn.reply(m.chat, `
*Pertanyaan:* ${command} ${text}
*Jawaban:* ${pickRandom(['1','2','3','4','5','6','7','8','9','10'])} ${pickRandom(['detik','jam','menit','hari','bulan','tahun','abad','minggu','dekade'])} lagi...
`.trim(), m, m.mentionedJid ? {
 contextInfo: {
 mentionedJid: m.mentionedJid
 }
 } : {})
}
handler.command = ['kapankah']
handler.owner = false

handler.category = 'Fun'
handler.description = 'Kapankah'

export default handler

function pickRandom(list) {
 return list[Math.floor(Math.random() * list.length)]
}