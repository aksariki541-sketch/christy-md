// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/addowner.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: addowner→addowner2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .addowner2

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) throw '❌ Hanya owner utama yang bisa pakai perintah ini!'
  if (!args[0]) throw 'Contoh: .addowner 628xxxxx'

  let number = args[0].replace(/[^0-9]/g, '')
  let jid = number + '@s.whatsapp.net'

  if (global.owner.find(([id]) => id === number)) {
    throw '✅ Nomor sudah jadi owner!'
  }

  global.owner.push([number, ''])
  conn.reply(m.chat, `✅ @${number} sekarang adalah owner sementara`, m, {
    mentions: [jid]
  })
}

handler.command = ['addowner2']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Addowner'

