// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/inventory.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .inv, .inventory

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    const fix = (v, d = 0) => v == null ? d : v

    let str = `
╭━━━〔 👤 PROFILE 〕━━━⬣
┃ ❤️ Health : ${fix(user.health)}
┃ ⚡ Energy : ${fix(user.energy)}
┃ 🥋 Armor : ${fix(user.armor)}
┃ 💰 Money : ${fix(user.money)}
┃ 🌌 Limit : ${fix(user.limit)}
┃ 🧬 Level : ${fix(user.level)}
┃ ✨ Exp : ${fix(user.exp)}
╰━━━━━━━━━━━━━━⬣

╭━━━〔 🎒 INVENTORY 〕━━━⬣
┃ 🥤 Potion : ${fix(user.potion)}
┃ 🍖 Pet Food : ${fix(user.petfood)}
┃ 🪱 Umpan : ${fix(user.umpan)}
┃ 💎 Diamond : ${fix(user.diamond)}
┃ 💚 Emerald : ${fix(user.emerald)}
┃ 👑 Gold : ${fix(user.gold)}
┃
┃ 🪵 Wood : ${fix(user.wood)}
┃ 🪨 Rock : ${fix(user.rock)}
┃ ⛓️ Iron : ${fix(user.iron)}
┃ 🕸️ String : ${fix(user.string)}
┃ 🗑️ Trash : ${fix(user.trash)}
╰━━━━━━━━━━━━━━⬣

╭━━━〔 ⚔️ EQUIPMENT 〕━━━⬣
┃ 🥋 Armor : ${fix(user.armor)}
┃ ⚔️ Sword : ${fix(user.sword)}
┃ ⛏️ Pickaxe : ${fix(user.pickaxe)}
┃ 🎣 Fishing Rod : ${fix(user.fishingrod)}
╰━━━━━━━━━━━━━━⬣

╭━━━〔 🐾 PET 〕━━━⬣
┃ 🐱 Cat : ${fix(user.cat)}
┃ 🐎 Horse : ${fix(user.horse)}
┃ 🦊 Fox : ${fix(user.fox)}
┃ 🐺 Wolf : ${fix(user.wolf)}
┃ 🐉 Dragon : ${fix(user.dragon)}
┃ 🦁 Lion : ${fix(user.lion)}
┃ 🦏 Rhinoceros : ${fix(user.rhinoceros)}
┃ 🐎 Centaur : ${fix(user.centaur)}
┃ 🦊 Kyubi : ${fix(user.kyubi)}
┃ 🦅 Griffin : ${fix(user.griffin)}
┃ 🔥 Phonix : ${fix(user.phonix)}
┃ 🤖 Robo : ${fix(user.robo)}
╰━━━━━━━━━━━━━━⬣
`.trim()

    conn.reply(m.chat, str, m)
}

handler.command = ['inv', 'inventory']

export default handler
handler.category = 'Fun'
handler.description = 'Inventory'

