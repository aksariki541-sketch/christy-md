// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/listbanchat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .listbanchat

let handler = async (m, { conn }) => {
  await m.react('✨')

  let chats = global.db.data.chats || {}
  let banned = Object.entries(chats)
    .filter(([jid, data]) => jid.endsWith('@g.us') && data?.isBanned)

  if (!banned.length)
    return m.reply('✅ Tidak ada grup yang sedang dibanned.')

  let teks = '📛 *DAFTAR GRUP KEBANNED*\n\n'
  let flows = []

  for (let i = 0; i < banned.length; i++) {
    let [jid] = banned[i]
    let name = 'Unknown Group'

    try {
      let meta = await conn.groupMetadata(jid)
      name = meta.subject
    } catch {}

    teks += `${i + 1}. ${name}\n`
    teks += `   ${jid}\n\n`

    flows.push({
      text: `📋 Copy ID GC #${i + 1}`,
      copy: jid
    })
  }

  await conn.sendMessage(m.chat, {
    text: teks.trim(),
    footer: '📌 Klik tombol untuk menyalin ID grup',
    nativeFlow: flows
  }, { quoted: m })
}

handler.command = ['listbanchat']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Listbanchat'

