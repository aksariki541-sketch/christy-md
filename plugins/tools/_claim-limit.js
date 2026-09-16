// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_claim-limit.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .claimlimit

const rewards = {
  limit: 10,
}
const cooldown = 86400000
let handler = async (m,{ conn} ) => {
  let user = global.db.data.users[m.sender]

  if (user.role === 'Free user' && user.limit >= 20) {
    conn.reply(m.chat, 'Free user only have 20 Limit max', m)
    return
  }

  if (new Date - user.lastclaim < cooldown) throw `You have already claimed this daily limit!, wait for *${((user.lastclaim + cooldown) - new Date()).toTimeString()}*`
  let text = ''
  for (let reward of Object.keys(rewards)) {
    if (!(reward in user)) continue
    user[reward] += rewards[reward]
    text += `*+${rewards[reward]}* ${reward}\n`
  }
  conn.reply(m.chat, text.trim(), m)
  user.lastclaim = new Date * 1
}
handler.command = ['claimlimit']


export default handler
handler.category = 'Tools'
handler.description = 'Claim-limit'

