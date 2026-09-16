// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/resetlimit.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: resetlimit→resetlimit2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .resetlimit2

let handler = async (m, { conn, args }) => {
	let list = Object.entries(global.db.data.users)
	let lim = !args || !args[0] ? 25 : isNumber(args[0]) ? parseInt(args[0]) : 25
	lim = Math.max(1, lim)
	list.map(([user, data], i) => (Number(data.limit = lim)))
		conn.reply(m.chat, `*Berhasil direset ${lim} / user*`, m)
}
handler.command = ['resetlimit2']

handler.owner = true
export default handler 

function isNumber(x = 0) {
  x = parseInt(x)
  return !isNaN(x) && typeof x == 'number'
}
handler.category = 'Owner'
handler.description = 'Resetlimit'

