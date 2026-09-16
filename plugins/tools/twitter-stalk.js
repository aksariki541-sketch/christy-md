// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/stalk/twitter.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: twitter→twitter2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .twitterstalk, .twitter2, .xstalk

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Ronaldo`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/stalker/twitter?username=${encodeURIComponent(text)}`
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
      ['Verified', r.verified ? 'Yes' : null],
      ['Verified Type', r.verified_type !== '-' ? r.verified_type : null],
      ['Bio', r.description],
      ['Location', r.location !== '-' ? r.location : null],
      ['Tweets', r.stats?.tweets],
      ['Followers', r.stats?.followers],
      ['Following', r.stats?.following],
      ['Likes', r.stats?.likes],
      ['Media', r.stats?.media],
      ['Created', r.created_at]
    ]

    let caption = `   *Twitter Stalker*\n\n`

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
        image: { url: r.profile.banner || r.profile.avatar },
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

handler.command = ['twitterstalk', 'twitter2', 'xstalk']

export default handler
handler.category = 'Tools'
handler.description = 'Twitter'

