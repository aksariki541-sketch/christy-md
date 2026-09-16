// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/buah.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: list→list2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .list2

let handler = async (m, { conn }) => {
	let user = global.db.data.users[m.sender]
	let text = `
[ *GUDANG BUAH KAMU* ]

${global.rpg.emoticon("pisang")} Pisang: ${toRupiah(user.pisang)}
${global.rpg.emoticon("anggur")} Anggur: ${toRupiah(user.anggur)}
${global.rpg.emoticon("mangga")} Mangga: ${toRupiah(user.mangga)}
${global.rpg.emoticon("jeruk")} Jeruk: ${toRupiah(user.jeruk)}
${global.rpg.emoticon("apel")} Apel: ${toRupiah(user.apel)}
`.trim()
	m.reply(text)
}

handler.tagsfun = ['rpg']
handler.command = ['list2']
handler.group = true
export default handler

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/g, ".")
handler.category = 'Fun'
handler.description = 'Buah'

