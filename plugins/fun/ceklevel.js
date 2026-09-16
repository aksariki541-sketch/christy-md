// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/ceklevel.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ceklvl

import { xpRange } from '../../lib/nakano/levelling.js'

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let { min, max } = xpRange(user.level)
  let next = max - user.exp

  m.reply(`
📊 Level Info
🆙 Level: *${user.level}*
✨ XP: *${user.exp} / ${max}*
➡️ Menuju level ${user.level + 1}: *${next} XP lagi*
`.trim())
}

handler.command = ['ceklvl']

export default handler
handler.category = 'Fun'
handler.description = 'Ceklevel'

