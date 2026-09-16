// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/setbye.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setbye

let handler = async (m, {
    conn, text, isROwner, isOwner, isAdmin, usedPrefix, command
}) => {
    if (text) {
        global.db.data.chats[m.chat].sBye = text
        m.reply('Bye Berhasil Diatur...\n@user [mention]')
    } else return m.reply(`Teksnya Mana..\nContoh:\nSelamat Tinggal Beban @user`)
}
handler.command = ['setbye']
handler.group = true
handler.admin = true

export default handler
handler.category = 'Group'
handler.description = 'Setbye'

