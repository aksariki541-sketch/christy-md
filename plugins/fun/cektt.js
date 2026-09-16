// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/cektt.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cekpentil, .cektt

let handler = async (m, { conn, command, text }) => {
	
 if (!text) return conn.reply(m.chat, '• *Example :* .cektt elaina', m)
	
 conn.reply(m.chat, `
╭━━━━°「 *TT nya ${text}* 」°
┃
┊• Nama : ${text}
┃• TT : ${pickRandom(['Putih','Hitam','Putih mulus','Hytam banget','Karatan ☠️'])}
┊• Pentil : ${pickRandom(['Hytam','Pink','kecil','Perfect'])}
┃• Ukuran : ${pickRandom(['Tepos','Spek Nasi KFC','Tobrut','32','34','36'])}
╰═┅═━––––––๑
`.trim(), m)
}
handler.command = ['cekpentil', 'cektt']

handler.category = 'Fun'
handler.description = 'Cektt'

export default handler

function pickRandom(list) {
 return list[Math.floor(Math.random() * list.length)]
}