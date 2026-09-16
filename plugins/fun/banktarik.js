// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/banktarik.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .banktarik

const xpperlimit = 1
let handler = async (m, { conn, command, args }) => {
    let user = global.db.data.users[m.sender]
    let all = command.replace(/^tarik/i, '')
    let count = all ? all : args[0]
    count = count ? /all/i.test(count) ? Math.floor(user.bank / xpperlimit): parseInt(count): args[0] ? parseInt(args[0]): 1
    count = Math.max(1, count)
    if (user.atm == 0) return m.reply("You don't have an ATM card yet")
    if (user.bank >= xpperlimit * count) {
        user.bank -= xpperlimit * count
        user.money += count
        conn.reply(m.chat, `Successfully withdrew ${toRupiah(count)} Money`, m)
    } else conn.reply(m.chat, `There is not enough money in your bank to withdraw ${toRupiah(count)} Money`, m)
}
handler.command = ['banktarik']
handler.group = true
export default handler

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/gi, ".")
handler.category = 'Fun'
handler.description = 'Banktarik'

