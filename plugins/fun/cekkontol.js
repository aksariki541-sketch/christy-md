// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/cekkontol.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cekkontol

let handler = async (m, { conn, command, text }) => {
	
 if (!text) return conn.reply(m.chat, '• *Example :* .cekkontol Bapak Komintod', m)
	
 conn.reply(m.chat, `
╭━━━━°「 *kontolnya ${text}* 」°
┃
┊• Nama : ${text}
┃• kontol : ${pickRandom(['Putih mulus','Putih','Hitam'])}
┊• Jembut : ${pickRandom(['Lebat','Tipis','Gada Jembut', 'Bersih'])}
┃• Status : ${pickRandom(['perjaka','Ga perjaka','Besar','Panjang','Disunat','Blom Disunat'])}
╰═┅═━––––––๑
`.trim(), m)
}
handler.command = ['cekkontol']

handler.category = 'Fun'
handler.description = 'Cekkontol'

export default handler

function pickRandom(list) {
 return list[Math.floor(Math.random() * list.length)]
}