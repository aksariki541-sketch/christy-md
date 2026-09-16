// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/addlimit.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .user

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Format:\n.addlimit @user 1000\n.addlimit 628xxxx 1000'

  let users = global.db.data.users
  let args = text.trim().split(/\s+/)
  let jumlah = parseInt(args[1]) || 1000
  let who

  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid.length) {
    who = m.mentionedJid[0]
  } else if (args[0].match(/^\d{5,}$/)) {
    who = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
  }

  if (!who) throw 'Tag, reply, atau masukkan nomor user!'

  if (!users[who]) users[who] = { limit: 0 }
  users[who].limit += jumlah

  conn.reply(
    m.chat,
    `✅ *DONE*\n\n👤 User: @${who.split('@')[0]}\n➕ Limit: +${jumlah}`,
    m,
    { mentions: [who] }
  )
}

handler.command = ['user']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Addlimit'

