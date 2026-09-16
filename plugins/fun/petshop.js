// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/petshop.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .petshop

let handler = async (m, { conn, command, args }) => {
    try {
        const user = global.db.data.users[m.sender]
        const em = global.rpg.emoticon

        const pets = {
            cat: 2,
            horse: 4,
            fox: 6,
            robo: 10,
            lion: 10,
            rhinoceros: 10,
            dragon: 10,
            centaur: 10,
            kyubi: 10,
            griffin: 10,
            phonix: 10,
            wolf: 10
        }

        const type = (args[0] || '').toLowerCase()

        if (!type) {
            return m.reply(`
╭━━━〔 🐾 PET SHOP 〕━━━⬣
┃ ${em('cat')} Cat : 2 Pet Token
┃ ${em('horse')} Horse : 4 Pet Token
┃ ${em('fox')} Fox : 6 Pet Token
┃ 🤖 Robo : 10 Pet Token
┃
┃ 🦁 Lion : 10 Pet Token
┃ 🦏 Rhinoceros : 10 Pet Token
┃ 🐉 Dragon : 10 Pet Token
┃ 🏹 Centaur : 10 Pet Token
┃ 🦊 Kyubi : 10 Pet Token
┃ 🦅 Griffin : 10 Pet Token
┃ 🔥 Phonix : 10 Pet Token
┃ ${em('wolf')} Wolf : 10 Pet Token
╰━━━━━━━━━━━━━━⬣

Contoh:
.petshop cat
.petshop dragon
.petshop wolf
`.trim())
        }

        if (!(type in pets)) {
            return m.reply('Pet tidak tersedia di Pet Shop.')
        }

        if (user[type] > 0) {
            return m.reply('Kamu sudah memiliki pet ini.')
        }

        const harga = pets[type]

        if (user.pet < harga) {
            return m.reply(
                `Pet Token kamu tidak cukup.\n\n` +
                `🎟️ Dibutuhkan: ${harga}\n` +
                `🎟️ Milikmu: ${user.pet}`
            )
        }

        user.pet -= harga
        user[type] += 1

        let emoji = em(type) || '🐾'

        m.reply(`
🎉 Berhasil membeli pet!

${emoji} Pet : ${type.charAt(0).toUpperCase() + type.slice(1)}
🎟️ Harga : ${harga} Pet Token

Sisa Pet Token: ${user.pet}
`.trim())

    } catch (e) {
        console.error(e)
        m.reply('Terjadi kesalahan.')
    }
}

handler.command = ['petshop']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Petshop'

