// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/kick.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: kick→kick2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .kick2

let handler = async (m, { conn, reply, participants }) => {
  const send = reply || ((txt) => m.reply(txt))

  if (!m.isGroup)
    return send('❌ Perintah ini hanya bisa digunakan di grup.')

  let target =
    m.mentionedJid?.[0] ||
    m.msg?.contextInfo?.mentionedJid?.[0] ||
    (m.quoted ? m.quoted.sender : null)

  if (!target)
    return send('❌ Tag atau reply orang yang ingin dikeluarkan.')

  if (target === conn.user.jid)
    return send('❌ Tidak bisa mengeluarkan bot.')

  let isTargetAdmin = participants.find(p => p.id === target && p.admin)
  if (isTargetAdmin)
    return send('❌ Tidak bisa mengeluarkan admin grup.')

  let kicked = false
  try {
    const res = await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
    if (Array.isArray(res)) {
      kicked = res[0]?.status === '200' || res[0]?.status === 200
    } else kicked = true
  } catch (e) {
    console.error('[KICK ERROR]', e)
  }

  if (!kicked)
    return send('❌ Gagal mengeluarkan anggota.')
}

handler.command = ['kick2']

handler.admin = true
handler.botAdmin = true

export default handler
handler.category = 'Group'
handler.description = 'Kick'

