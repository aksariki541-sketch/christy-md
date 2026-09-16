// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/jual.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .jual

let handler = async (m, { args }) => {
  let user = global.db.data.users[m.sender]
  if (!args[0] || !args[1]) {
    return m.reply(`Contoh:
.jual trash 10
.jual wood 5`)
  }

  const item = args[0].toLowerCase()
  const jumlah = parseInt(args[1])

  if (isNaN(jumlah) || jumlah <= 0) return m.reply('Jumlah tidak valid.')

  const harga = {
    trash: 50,
    wood: 200,
    rock: 150,
    iron: 500,
    string: 300,
    petfood: 250
  }

  if (!(item in harga)) {
    return m.reply(`Item tidak bisa dijual.

Yang bisa dijual:
trash, wood, rock, iron, string, petfood`)
  }

  if (user[item] < jumlah) {
    return m.reply(`Item kamu tidak cukup.`)
  }

  let total = harga[item] * jumlah
  user[item] -= jumlah
  user.money += total

  m.reply(`Berhasil menjual ${jumlah} ${item}
Mendapat uang: Rp${total.toLocaleString()}`)
}

handler.command = ['jual']

export default handler
handler.category = 'Fun'
handler.description = 'Jual'

