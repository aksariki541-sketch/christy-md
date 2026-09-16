// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/birthdaylist.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .listbirthday

let handler = async (m) => {
  const db = global.db?.data?.users
  if (!db) return m.reply('❌ DB tidak ditemukan')

  const list = Object.entries(db)
    .filter(([_, u]) => u?.birthday)

  if (!list.length) return m.reply('❌ Belum ada birthday')

  let text = `📋 *LIST BIRTHDAY*\n\n`

  for (let [jid, u] of list) {
    text += `• @${jid.split('@')[0]} → ${u.birthday}\n`
  }

  m.reply(text, { mentions: list.map(v => v[0]) })
}

handler.command = ['listbirthday']
export default handler
handler.category = 'Main'
handler.description = 'Birthdaylist'

