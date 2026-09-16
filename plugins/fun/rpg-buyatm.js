// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/rpg-buyatm.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .buyatm

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (user.atm) {
    return conn.reply(
      m.chat,
      '🌸 Kamu sudah memiliki ATM.',
      m
    )
  }

  const harga = 50000

  if (user.money < harga) {
    return conn.reply(
      m.chat,
      `🌸 Uang kamu kurang.\n\n💰 Harga ATM: ${harga}`,
      m
    )
  }

  user.money -= harga
  user.atm = true
  user.bank = 0
  user.fullatm = 1000

  conn.reply(
    m.chat,
    `
🌸 *ANYA ATM PURCHASE* ❀

╭──〔 ATM BERHASIL DIBELI 〕──╮
│ 💳 ATM : Aktif
│ 💰 Harga : ${harga}
│ 🏦 Kapasitas : 1000
╰────────────────────╯
`.trim(),
    m
  )
}

handler.command = ['buyatm']

export default handler
handler.category = 'Fun'
handler.description = 'Rpg-buyatm'

