// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/rpg-bagiuang.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bagiuang

let handler = async (m, { conn, args }) => {

let user = global.db.data.users[m.sender]
let target = m.mentionedJid[0]

if (!target) return conn.reply(m.chat, `Tag orang yang ingin kamu beri uang

Contoh:
.bagiuang @user 5000`, global.fstatus)

if (!args[1]) return conn.reply(m.chat, `Masukkan jumlah uang yang ingin diberikan`, global.fstatus)

let jumlah = parseInt(args[1])

if (jumlah < 1) return conn.reply(m.chat, `Jumlah tidak valid`, global.fstatus)

if (user.money < jumlah) return conn.reply(m.chat, `Uang kamu tidak cukup`, global.fstatus)

let targetUser = global.db.data.users[target]

user.money -= jumlah
targetUser.money += jumlah

let teks = `🌸 ANYA BERBAGI ❀

💸 @${m.sender.split('@')[0]} memberikan uang kepada
🎁 @${target.split('@')[0]}

💰 Jumlah : ${jumlah} Money

Baik sekali kamu hari ini ✨`

conn.reply(m.chat, teks, global.fstatus, {
mentions: [m.sender, target]
})

}

handler.command = ['bagiuang']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Rpg-bagiuang'

