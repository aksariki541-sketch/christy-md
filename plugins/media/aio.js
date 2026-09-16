// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/aio.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .aio

let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:
.aio https://vm.tiktok.com/ZSXwf1TAm/`

  await m.react('🕒')

  try {
    const res = await fetch(`${global.APIs.nexray}/downloader/aio?url=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status) throw new Error(json.message || 'Gagal mengambil media.')

    const data = json.result

    const media =
      data.medias.find(v => v.type === 'video' && v.quality === 'hd_no_watermark') ||
      data.medias.find(v => v.type === 'video') ||
      data.medias.find(v => v.type === 'audio')

    if (!media) throw 'Media tidak ditemukan.'

    if (media.type === 'audio') {
      await conn.sendMessage(m.chat, {
        audio: { url: media.url },
        mimetype: 'audio/mpeg',
        fileName: `${data.title || 'audio'}.mp3`,
        ptt: false
      }, { quoted: m })
    } else {
      const size = media.data_size || 0
      const isLarge = size > 50 * 1024 * 1024

      const caption = `❏ Author      : ${data.author || '-'}
❏ Duration    : ${Math.floor((data.duration || 0) / 1000)} Detik
❏ Title       : ${data.title || '-'}`

      if (isLarge) {
        await conn.sendMessage(m.chat, {
          document: { url: media.url },
          fileName: `${data.title || 'video'}.mp4`,
          mimetype: 'video/mp4',
          caption
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: media.url },
          caption
        }, { quoted: m })
      }
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw e.message || 'Terjadi kesalahan.'
  }
}

handler.command = ['aio']

export default handler
handler.category = 'Media'
handler.description = 'Aio'

