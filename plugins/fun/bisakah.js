// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/bisakah.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bisakah

let handler = async (m, { conn, command, text }) => {
 conn.reply(m.chat, `
*🌎Pertanyaan:* ${command} ${text}
*💬Jawaban:* ${pickRandom(['Iya','Bisa','Tentu saja bisa','Tentu bisa','Sudah pasti','Sudah pasti bisa','Tidak','Tidak bisa','Tentu tidak','tentu tidak bisa','Sudah pasti tidak'])}
`.trim(), m)
}
handler.command = ['bisakah']
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

handler.category = 'Fun'
handler.description = 'Bisakah'

export default handler 

function pickRandom(list) {
 return list[Math.floor(Math.random() * list.length)]
}

