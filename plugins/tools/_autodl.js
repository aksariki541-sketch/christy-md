// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_autodl.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : handler.before/all -> handler.onMessage

import fetch from 'node-fetch'
import { tiktokScrape } from '../../lib/nakano/scrape/tikwm.js'

const SUPPORTED = /tiktok\.com|instagram\.com|facebook\.com|fb\.watch|twitter\.com|x\.com|threads\.net/i

let handler = {}

function makeCaption({ author, duration, title }) {
  return `
❏ Auto Download

❏ Author      : ${author || '-'}
❏ Duration    : ${duration || '-'}
❏ Title       : ${title || '-'}

❏ Christy MD
`.trim()
}

handler.onMessage = async (m, { conn }) => {
  const text =
    m.text ||
    m.caption ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ""

  if (!text) return
  if (m.fromMe) return
  if (/^[.#!\/]/.test(text)) return

  if (!global.db.data.chats[m.chat])
    global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat.autodl) return

  const url = text.match(/https?:\/\/[^\s]+/)?.[0]
  if (!url) return

  if (/youtu\.?be|youtube\.com/i.test(url)) return
  if (!SUPPORTED.test(url)) return

  try {
    await m.react('🕒')

    if (/tiktok\.com/i.test(url)) {
      const tt = await tiktokScrape(url)

      const caption = makeCaption({
        author: tt.author,
        title: tt.title
      })

      if (tt.type === 'video') {
        await conn.sendMessage(m.chat, {
          video: { url: tt.video },
          caption
        }, { quoted: m })
      } else {
        for (const img of tt.images) {
          await conn.sendMessage(m.chat, {
            image: { url: img },
            caption
          }, { quoted: m })
        }
      }

      return await m.react('✅')
    }

    const res = await fetch(
      `${global.APIs.nexray}/downloader/aio?url=${encodeURIComponent(url)}`
    )
    const json = await res.json()

    if (!json.status) throw new Error(json.message || 'Gagal mengambil media.')

    const data = json.result

    const media =
      data.medias.find(v => v.type === 'video' && v.quality === 'hd_no_watermark') ||
      data.medias.find(v => v.type === 'video') ||
      data.medias.find(v => v.type === 'audio')

    if (!media) throw 'Media tidak ditemukan.'

    const caption = makeCaption({
      author: data.author,
      duration: Math.floor((data.duration || 0) / 1000) + ' Detik',
      title: data.title
    })

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
    console.log('AutoDL Error:', e)
    await m.react('❌')
  }
}

export default handler
handler.category = 'Tools'
handler.description = 'Autodl'

