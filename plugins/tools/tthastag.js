// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tthastag.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tthashtag, .tiktokhashtag

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} anime
${usedPrefix + command} #anime`)
  }

  await m.reply('🍀 Sedang mencari hashtag TikTok...')

  try {
    const hashtag = text.startsWith('#') ? text : `#${text}`

    const res = await fetch(
      `${global.APIs.nexray}/tools/tiktokhashtags?hashtags=${encodeURIComponent(hashtag)}`
    )
    const data = await res.json()

    if (!data?.status) {
      return m.reply('❌ Gagal mengambil data.')
    }

    const { report, top10, related, trending } = data.result

    let caption = `— *TIKTOK HASHTAGS* —

❀ *Hashtag* : ${hashtag}
❀ *Overall Posts* : ${report.overallPosts || '-'}
❀ *Overall Views* : ${report.overallViews || '-'}
❀ *Views / Post* : ${report.viewsPerPost || '-'}`

    if (top10.length) {
      caption += `

*Top 10*
${top10.map((v, i) => `${i + 1}. ${v}`).join('\n')}`
    }

    if (related.length) {
      caption += `

*Related*
${related.map(v => `• ${v}`).join('\n')}`
    }

    if (trending.length) {
      caption += `

*Trending*
${trending.map(v => `• ${v}`).join('\n')}`
    }

    m.reply(caption)
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.command = ['tthashtag', 'tiktokhashtag']

export default handler
handler.category = 'Tools'
handler.description = 'Tthastag'

