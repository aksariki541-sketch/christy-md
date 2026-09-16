// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/search/spotify.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .spotifysearch, .spotifys, .spsearch

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Swim Chase Atlantic`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/search/spotify?q=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status || !data.result?.length) {
      await m.react('❌')
      return m.reply('❌ Lagu tidak ditemukan.')
    }

    const list = data.result.slice(0, 10)

    let caption = `   *Spotify Search*\n\n`

    for (let i = 0; i < list.length; i++) {
      const v = list[i]
      caption += `${i + 1}. *${v.title}*\n`
      caption += `✿ Artist : ${v.artist}\n`
      caption += `✿ Album : ${v.album}\n`
      caption += `✿ Duration : ${v.duration}\n`
      caption += `✿ Release : ${v.release_date}\n`
      caption += `✿ Popularity : ${v.popularity}\n`
      caption += `✿ URL : ${v.url}\n\n`
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: list[0].thumbnail },
        caption
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

handler.command = ['spotifysearch', 'spotifys', 'spsearch']

export default handler
handler.category = 'Tools'
handler.description = 'Spotify'

