// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/group-autogpt.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .autogpt, .autoanya

let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('Khusus grup.')

  // Admin grup ATAU owner bot boleh akses
  if (!isAdmin && !isOwner) {
    return m.reply('Fitur ini khusus admin grup atau owner bot.')
  }

  global.db.data.chats[m.chat] ??= {}
  let chat = global.db.data.chats[m.chat]

  if (!args[0]) {
    return m.reply(
`*AUTO ANYA*

Contoh:
.autogpt on
.autogpt off`
    )
  }

  let type = args[0].toLowerCase()

  if (type === 'on') {
    chat.autogpt = true
    return m.reply(
`Waku waku~ 🤗

Auto Anya berhasil diaktifkan.`
    )
  }

  if (type === 'off') {
    chat.autogpt = false
    return m.reply(
`Hweh... 🥹

Auto Anya dimatikan dulu yaa.`
    )
  }

  return m.reply('Pilih on / off')
}

handler.command = ['autogpt', 'autoanya']

handler.group = true
// Jangan pakai handler.admin = true
// Biar owner bot tetap bisa akses walaupun bukan admin grup

export default handler
handler.category = 'Group'
handler.description = 'Group-autogpt'

