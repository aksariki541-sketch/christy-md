// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/exp-unreg.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: ister→ister2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ister2

import { createHash } from 'crypto'
let handler = async function (m, { args }) {
  if (!args[0]) throw 'Serial Number kosong'
  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')
  if (args[0] !== sn) throw 'Serial Number salah'
  user.registered = false
  m.reply('```Success Unreg !```')
}

handler.command = ['ister2']

export default handler
handler.category = 'Main'
handler.description = 'Exp-unreg'

