// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/listprem.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: premium→premium2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .prem, .premium2

let handler = async (m, { conn }) => {

  let users = global.db.data.users
  let prem = Object.entries(users).filter(([jid, u]) =>
    u.premiumTime === Infinity || u.premiumTime > Date.now()
  )

  if (!prem.length) {
    return m.reply('✨ Tidak ada user premium saat ini')
  }

  let teks = `✨ *LIST USER PREMIUM*\n\n`

  for (let i of prem) {
    let jid = i[0]
    let user = i[1]

    let name = await conn.getName(jid)
    let tag = '@' + jid.split('@')[0]

    let sisa = user.premiumTime - Date.now()

    let waktu = user.premiumTime === Infinity
      ? 'Permanen'
      : sisa > 0
        ? msToDate(sisa)
        : 'Expired'

    teks += `👤 ${name}
🔗 ${tag}
🌙 ${waktu}\n\n`
  }

  await conn.sendMessage(m.chat, {
    text: teks.trim(),
    mentions: prem.map(v => v[0])
  }, { quoted: m })
}

handler.command = ['prem', 'premium2']
handler.owner = true

export default handler

function msToDate(ms) {
  let d = Math.floor(ms / 86400000)
  let h = Math.floor(ms % 86400000 / 3600000)
  let m = Math.floor(ms % 3600000 / 60000)
  return `${d} Hari ${h} Jam ${m} Menit`
}
handler.category = 'Owner'
handler.description = 'Listprem'

