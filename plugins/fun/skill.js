// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/skill.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .skill

let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user?.rpg) return m.reply('⚠️ Belum mulai RPG.')

  const cooldown = 1000 * 60 * 5 // 5 menit
  user.rpg.skillCooldown = user.rpg.skillCooldown || 0

  if (Date.now() < user.rpg.skillCooldown)
    return m.reply(`⏳ Skill cooldown! Tunggu ${Math.ceil((user.rpg.skillCooldown - Date.now()) / 60000)} menit lagi.`)

  // Efek skill random
  const efek = Math.random() < 0.5 ? 'heal' : 'gold'
  let hasil = ''

  if (efek === 'heal') {
    user.rpg.hp += 100
    hasil = '❤️ Kamu menggunakan skill *Regen* dan memulihkan 100 HP!'
  } else {
    let g = Math.floor(Math.random() * 100 + 50)
    user.rpg.gold += g
    hasil = `💰 Kamu menggunakan skill *Harta Karun* dan mendapatkan ${g} gold!`
  }

  user.rpg.skillCooldown = Date.now() + cooldown

  m.reply(`🔥 SKILL AKTIF!\n${hasil}`)
}

handler.command = ['skill']

export default handler
handler.category = 'Fun'
handler.description = 'Skill'

