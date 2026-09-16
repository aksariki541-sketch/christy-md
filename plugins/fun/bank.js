// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/bank.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bank

import moment from 'moment-timezone'

let handler = async (m, { conn, isOwner, isPrems }) => {
    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    let user = global.db.data.users[who]

    if (!user) return m.reply('Yahh datanya gak ketemu 🥺')

    let name = user.registered
        ? user.name
        : await conn.getName(who)

    let week = moment().tz('Asia/Jakarta').format('dddd')
    let date = moment().tz('Asia/Jakarta').format('DD MMMM YYYY')
    let time = moment().tz('Asia/Jakarta').format('HH:mm:ss')

    let status =
        isOwner ? '👑 OWNER' :
        isPrems ? '💎 PREMIUM' :
        '🌱 FREE USER'

    let caption = `
⏰ ${time}
(｡•̀ᴗ-)✧ *Konnichiwa~* 🌸

╭───〔 🏦 BANK STATUS 〕───
│ 👤 Nama   : ${name}
│ 💠 Status : ${status}
│ 📝 Reg    : ${user.registered ? '✔️ Sudah' : '❌ Belum'}
│
│ 💳 ATM    : ${user.atm}
│ 🏛️ Bank   : ${toRupiah(user.bank)}
│ 💰 Money  : ${toRupiah(user.money)}
│ 💎 Diamond: ${toRupiah(user.diamond)}
│ 💚 Emerald: ${toRupiah(user.emerald)}
│ 👑 Gold   : ${toRupiah(user.gold)}
│
│ ❤️ Health : ${user.health}
│ ⚡ Energy : ${user.energy}
│ 🥤 Potion : ${user.potion}
╰────────────────────

📆 ${week}, ${date}
`.trim()

    const THUMB = 'https://files.catbox.moe/c67nx0.jpg'

    await conn.sendMessage(
        m.chat,
        {
            image: { url: THUMB },
            caption,
            mentions: [who]
        },
        { quoted: m }
    )
}

handler.command = ['bank']
handler.group = true

export default handler

function toRupiah(number) {
    return parseInt(number || 0)
        .toLocaleString('id-ID')
}
handler.category = 'Fun'
handler.description = 'Bank'

