// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/ppjsewa.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .extendsewa, .perpanjangsewa

const handler = async (m, { text, isOwner }) => {
  if (!isOwner) return m.reply('Owner only.')
  if (!m.isGroup) return m.reply('Harus di grup.')

  const jid = m.chat
  const data = global.db.sewa[jid]

  if (!data) return m.reply('Grup ini tidak dalam status sewa.')

  const days = parseInt(text)
  if (!days) return m.reply('Contoh: .perpanjangsewa 3')

  const base = data.expired > Date.now() ? data.expired : Date.now()
  data.expired = base + days * 86400000

  data.warned = {}

  m.reply(`🔁 Sewa diperpanjang ${days} hari`)
}

handler.command = ['extendsewa', 'perpanjangsewa']
export default handler
handler.category = 'Tools'
handler.description = 'Ppjsewa'

