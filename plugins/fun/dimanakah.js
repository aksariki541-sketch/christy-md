// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/dimanakah.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .dimanakah

let handler = async (m, { conn, command, text }) => {
 conn.reply(m.chat, `
*Pertanyaan:* ${command} ${text}
*Jawaban:* ${pickRandom(['di neraka','di surga','di mars','di tengah laut','di dada :v','di hatimu >///<'])}
`.trim(), m, m.mentionedJid ? {
 contextInfo: {
 mentionedJid: m.mentionedJid
 }
 } : {})
}
handler.command = ['dimanakah']
handler.owner = false

handler.category = 'Fun'
handler.description = 'Dimanakah'

export default handler

function pickRandom(list) {
 return list[Math.floor(Math.random() * list.length)]
}
