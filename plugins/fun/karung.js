// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/karung.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .karung

let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  user.botol = user.botol || 0
  user.kardus = user.kardus || 0
  user.kaleng = user.kaleng || 0
  user.gelas = user.gelas || 0
  user.plastik = user.plastik || 0

  let isi = [
    ['botol', '🧴 Botol'],
    ['kardus', '📦 Kardus'],
    ['kaleng', '🥫 Kaleng'],
    ['gelas', '🥛 Gelas'],
    ['plastik', '🛍️ Plastik']
  ]
  .map(([k, label]) => user[k] > 0 ? `${label}: ${user[k]}` : null)
  .filter(Boolean)
  .join('\n')

  let teks = isi
    ? `📮 *ISI KARUNG KAMU*\n\n${isi}`
    : '📮 Karung kamu masih kosong!'

  m.reply(teks)
}

handler.command = ['karung']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Karung'

