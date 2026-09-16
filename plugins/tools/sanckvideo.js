// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/stalk/sanckvideo.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .snackvideostalk, .snackstalk, .snackvideo

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} <username>`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/stalker/snackvideo?username=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Username tidak ditemukan.')
    }

    const r = data.result

    const fields = [
      ['ID', r.id],
      ['Nama', r.name],
      ['Bio', r.description],
      ['Followers', r.followers],
      ['Total Like', r.total_like],
      ['Total Video', r.total_video]
    ]

    let caption = `   *SnackVideo Stalker*\n\n`

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
        image: { url: r.profile },
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

handler.command = ['snackvideostalk', 'snackstalk', 'snackvideo']

export default handler
handler.category = 'Tools'
handler.description = 'Sanckvideo'

