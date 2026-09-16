// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/freelimit.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .freelimit

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    if (!user.freelimit) user.freelimit = 0

    const cooldown = 79200000 
    const elapsed = Date.now() - user.freelimit
    const remaining = cooldown - elapsed

    if (elapsed > cooldown) {
        user.limit += 20
        user.freelimit = Date.now()

        m.reply(`✨ Berhasil!\n+20 Limit ditambahkan`)
    } else {
        m.reply(`🎌 Silahkan tunggu *${clockString(remaining)}* untuk mengambil limit kembali`)
    }
}

handler.command = ['freelimit']
handler.group = true
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
    }
handler.category = 'Fun'
handler.description = 'Freelimit'

