// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/kandang.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .kandang

let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  const animals = [
    'banteng','harimau','gajah','kambing','panda','buaya',
    'kerbau','sapi','monyet','ayam','babi','babihutan'
  ]

  let isi = animals
    .map(v => {
      user[v] = user[v] || 0
      return user[v] > 0
        ? `• ${global.rpg.emoticon(v)} ${v}: ${user[v]}`
        : null
    })
    .filter(Boolean)
    .join('\n')

  let caption = isi
    ? `📮 *KANDANG KAMU*\n\n${isi}`
    : '📮 Kandang kamu masih kosong!'

  m.reply(caption)
}

handler.command = ['kandang']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Kandang'

