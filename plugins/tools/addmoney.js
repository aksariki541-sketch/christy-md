// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/addmoney.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .addmoney

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db) global.db = {}
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.users) global.db.data.users = {}

  const user = m.mentionedJid?.[0] || m.quoted?.sender
  const amount = parseInt(args[0])

  if (!user) return m.reply(`Contoh:\n${usedPrefix + command} @tag 1000`)
  if (!amount || isNaN(amount)) return m.reply('Masukin jumlah uang yang valid!')

  if (!global.db.data.users[user]) global.db.data.users[user] = { money: 0, exp: 0 }

  if (!global.db.data.users[user].money) global.db.data.users[user].money = 0

  global.db.data.users[user].money += amount

  m.reply(`💰 Berhasil menambahkan *${amount} money*\nke user @${user.split('@')[0]}`, null, {
    mentions: [user]
  })
}

handler.command = ['addmoney']
handler.owner = true

export default handler
handler.category = 'Tools'
handler.description = 'Addmoney'

