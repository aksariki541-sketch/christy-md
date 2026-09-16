// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/setwelcome.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setwelcome, .setw

let handler = async (m, { conn, text, isROwner, isOwner, isAdmin, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sWelcome = text
    m.reply('Welcome berhasil diatur\n@user (Mention)\n@subject (Judul Grup)\n@desc (Deskripsi Grup)')
  } else return m.reply(`Teksnya mana?\n\ncontoh:\n${usedPrefix + command} hai, @user!\nSelamat datang di grup @subject\n\n@desc`)
}
handler.command = ['setwelcome', 'setw']
handler.group = true
handler.admin = true

export default handler
handler.category = 'Group'
handler.description = 'Setwelcome'

