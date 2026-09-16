// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/ttimg.js (diambil dari Nakano-Miku-MD.zip (zip sumber di dalam paket))
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ttimg2, .tiktokimg2
// Catatan    : command bentrok diganti: ttimg→ttimg2, tiktokimg→tiktokimg2

/**
 * Fitur   : TikTok Slide Downloader
 * Base    : tikwm.com
 * Type    : Plugin ESM
 * Channel : https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
 * Creator : Riki
 */

import { proto, generateWAMessageFromContent, generateWAMessageContent } from '../../lib/baileys.js'

async function getSlide(url) {
  const res = await fetch(`https://www.tikwm.com/api/?url=${url}&hd=1`)
  const json = await res.json()
  return json?.data
}

async function createImage(url, conn) {
  const { imageMessage } = await generateWAMessageContent(
    { image: { url } },
    { upload: conn.waUploadToServer }
  )
  return imageMessage
}

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} https://vt.tiktok.com/xxxx`)
  }

  await m.react('✨')

  try {
    const regex = /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/
    const url = text.match(regex)?.[0]

    if (!url) return m.reply('❌ Link TikTok tidak valid.')

    const data = await getSlide(url)
    if (!data) return m.reply('❌ Gagal mengambil data.')

    const images = data.images || []
    if (!images.length) return m.reply('❌ Post ini bukan slideshow foto.')

    const cards = []

    for (let img of images.slice(0, 6)) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: data.title || 'TikTok Slide'
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: 'ᴍɪᴋᴜ yᴀᴍᴀᴅᴀ - ᴍᴅ'
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: data.author.nickname,
          hasMediaAttachment: true,
          imageMessage: await createImage(img, conn)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Buka TikTok',
                url: `https://www.tiktok.com/@${data.author.unique_id || 'user'}/video/${data.video_id}`
              })
            }
          ]
        })
      })
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text:
`✨ *TIKTOK PHOTO*

Judul: ${data.title || '-'}
Uploader: ${data.author.nickname}
Total: ${images.length}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'Slide Viewer'
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage:
              proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards
              })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil slide.')
  }
}

handler.command = ['ttimg2', 'tiktokimg2']

export default handler
handler.category = 'Media'
handler.description = 'Ttimg'

