// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/rpg-sell.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: sell→sell2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sell2

let handler = async (m, { args }) => {

	let user = global.db.data.users[m.sender]
	let e = global.rpg.emoticon

	let item = (args[0] || '').toLowerCase()
	let jumlah = parseInt(args[1]) || 1

	let harga = {
		trash: 50,

		ikan: 1500,
		lele: 2000,
		nila: 2000,
		bawal: 2500,
		udang: 3000,
		kepiting: 3500,
		paus: 10000,

		ayam: 5000,
		kambing: 8000,
		sapi: 12000,
		babi: 10000,
		banteng: 15000,

		diamond: 9000,
		emerald: 7000
	}

	if (!item) {
		throw `
🌸 *ANYA RPG SELL* ❀

📦 Item yang bisa dijual

🗑 Trash
🐟 Ikan / Lele / Nila / Bawal
🦐 Udang
🦀 Kepiting
🐋 Paus

🐓 Ayam
🐐 Kambing
🐄 Sapi
🐖 Babi
🐃 Banteng

💎 Diamond
❇️ Emerald

Contoh:
.sell ikan 5
.sell ayam 2
.sell diamond
`
	}

	if (!(item in harga)) throw `Item tidak bisa dijual`

	if (user[item] < jumlah) throw `Item tidak cukup`

	let total = harga[item] * jumlah

	user[item] -= jumlah
	user.money += total

	m.reply(`
❀ *BERHASIL MENJUAL* ❀

Item : ${item}
Jumlah : ${jumlah}

${e('money')} +${total}
`.trim())

}

handler.command = ['sell2']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Rpg-sell'

