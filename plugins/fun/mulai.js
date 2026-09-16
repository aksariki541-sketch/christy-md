// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/mulai.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .mulai

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  if (user.rpg) return m.reply('🧙 Kamu sudah memulai petualangan!')

  user.rpg = {
    level: 1,
    exp: 0,
    hp: 100,
    atk: 10,
    gold: 50,
    inventory: [],
    lastHunt: 0
  }

  m.reply(`🎮 Petualangan dimulai!\n\n📊 Level: 1\n❤️ HP: 100\n🪙 Gold: 50\n🔪 ATK: 10\n\nGunakan *.berburu* untuk mulai bertarung!`)
}

handler.command = ['mulai']

export default handler
handler.category = 'Fun'
handler.description = 'Mulai'

