// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/limit.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .limit

let handler = async (m, { conn, isOwner, isPrems }) => {
  let who

  if (m.isGroup) {
    who = m.mentionedJid?.[0] || m.sender
  } else {
    who = m.sender
  }

  const user = global.db.data.users[who]

  if (!user) {
    return m.reply('Pengguna tidak ditemukan di database.')
  }

  const name = user.registered
    ? user.name
    : await conn.getName(who)

  const limitNow = user.limit || 0

  const status = isOwner
    ? 'Owner'
    : isPrems
      ? 'Premium User'
      : user.level > 999
        ? 'Elite User'
        : 'Free User'

  const limit = isPrems
    ? 'Unlimited'
    : `${limitNow}`

  const text = `*\`User Limit\`*

✿ Name : ${name}
✿ Status : ${status}
✿ Limit : ${limit}`

  await conn.sendMessage(
    m.chat,
    { text },
    { quoted: m }
  )
}

handler.command = ['limit']

export default handler
handler.category = 'Main'
handler.description = 'Limit'

