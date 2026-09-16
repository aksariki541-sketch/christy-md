// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-resetlimit.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .resetlimit

let handler = async (m, { text }) => {
  let jumlah = parseInt(text)

  if (isNaN(jumlah) || jumlah < 0) {
    return m.reply(`❌ Masukkan angka limit!\n\nContoh:\n.resetlimit 10`)
  }

  let users = global.db.data.users
  let total = 0

  for (let jid in users) {
    let user = users[jid]
    if (!user) continue

    user.limit = jumlah
    total++
  }

  m.reply(
`✅ *RESET LIMIT GLOBAL BERHASIL*

👥 Total user : *${total} user*
🎯 Limit baru : *${jumlah}*`
  )
}

handler.command = ['resetlimit']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Owner-resetlimit'

