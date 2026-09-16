// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/cekmemek.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cekmemek, .cekmmk

let handler = async (m, { conn, command, text }) => {
	
 if (!text) return conn.reply(m.chat, '• *Example :* .cekmemek elaina', m)
	
 conn.reply(m.chat, `
╭━━━━°「 *Memeknya ${text}* 」°
┃
┊• Nama : ${text}
┃• Memek : ${pickRandom(['Putih mulus','Hitam','Pink','Pink Mulus','Hitam mulus'])}
┊• Jembut : ${pickRandom(['Lebat','Tipis','Gada Jembut', 'Bersih'])}
┃• Lobang : ${pickRandom(['Perawan','Ga Perawan','Besar','Sempit'])}
╰═┅═━––––––๑
`.trim(), m)
}
handler.command = ['cekmemek', 'cekmmk']

handler.category = 'Fun'
handler.description = 'Cekmemek'

export default handler

function pickRandom(list) {
 return list[Math.floor(Math.random() * list.length)]
}