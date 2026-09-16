// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/sewa-join.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: sewa→sewa2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .addsewa, .sewa2

import moment from 'moment'

if (!global.db) global.db = {}
if (!global.db.sewa) global.db.sewa = {}

const handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return m.reply('Owner only.')

  if (!text) {
    return m.reply('Contoh:\n.sewa https://chat.whatsapp.com/xxxx 7')
  }

  const [link, daysStr] = text.split(' ')
  const days = parseInt(daysStr)

  if (!link || !days) {
    return m.reply('Format salah!\n.sewa <linkgroup> <hari>')
  }

  const inviteCode = link.split('https://chat.whatsapp.com/')[1]
  if (!inviteCode) return m.reply('Link grup tidak valid.')

  try {
    // JOIN GROUP
    const res = await conn.groupAcceptInvite(inviteCode)

    const jid = res
    const now = Date.now()
    const expired = now + days * 86400000

    global.db.sewa[jid] = {
      expired,
      owner: m.sender,
      warned: {}
    }

    await conn.sendMessage(jid, {
      text:
`🤖 Bot berhasil join!

📦 Status Sewa Aktif
⏳ Durasi: ${days} hari
📅 Expired: ${moment(expired).format('DD/MM/YYYY HH:mm')}

⚠️ Bot akan keluar otomatis saat masa sewa habis.`
    })

    m.reply(`✅ Bot berhasil join & sewa aktif di grup\nID: ${jid}`)

  } catch (e) {
    console.log(e)
    m.reply('Gagal join grup. Pastikan link valid & bot diizinkan join.')
  }
}

handler.command = ['addsewa', 'sewa2']
export default handler
handler.category = 'Tools'
handler.description = 'Sewa-join'

