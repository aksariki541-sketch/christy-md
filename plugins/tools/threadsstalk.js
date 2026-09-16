// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/stalk/threadsstalk.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .threadsstalk, .threadstalk

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} <username>`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/stalker/threads?username=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Username tidak ditemukan.')
    }

    const r = data.result

    const fields = [
      ['ID', r.id],
      ['Username', r.username],
      ['Nama', r.name],
      ['Bio', r.bio],
      ['Followers', r.followers],
      ['Verified', r.is_verified ? 'Yes' : null]
    ]

    if (Array.isArray(r.links) && r.links.length) {
      fields.push(['Links', r.links.join(', ')])
    }

    let caption = `   *Threads Stalker*\n\n`

    for (const [key, value] of fields) {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === '-' ||
        value === false
      ) continue

      caption += `✿ ${key} : ${value}\n`
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: r.hd_profile_picture || r.profile_picture },
        caption: caption.trim()
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.command = ['threadsstalk', 'threadstalk']

export default handler
handler.category = 'Tools'
handler.description = 'Threadsstalk'

