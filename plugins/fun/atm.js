// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/atm.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .atm

const xpperlimit = 1
let handler = async (m, { conn, command, args }) => {
    let user = global.db.data.users[m.sender]
    let all = command.replace(/^atm/i, '')
    let count = all ? all : args[0]
    count = count ? /all/i.test(count) ? Math.floor(user.money / xpperlimit): parseInt(count): args[0] ? parseInt(args[0]): 1
    count = Math.max(1, count)
    if (user.atm == 0) return m.reply("You don't have an ATM card yet")
    if (user.bank > user.fullatm) return m.reply('The ATM is full of money!')
    if (count > user.fullatm - user.bank) return m.reply('The money has reached the limit')
    if (user.money >= xpperlimit * count) {
        user.money -= xpperlimit * count
        user.bank += count
        conn.reply(m.chat, `Successful saving amount ${toRupiah(count)} Money`, m)
    } else conn.reply(m.chat, `There is not enough money in your bank to withdraw ${toRupiah(count)} Money`, m)
}
handler.command = ['atm']
handler.group = true
export default handler

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/gi, ".")
handler.category = 'Fun'
handler.description = 'Atm'

