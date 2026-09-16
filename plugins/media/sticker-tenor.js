// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/sticker-tenor.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tenor

import axios from 'axios'
import { sticker } from '../../lib/nakano/sticker.js'
import { StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `*Example :* ${usedPrefix + command} Ryo Yamada`,
      m
    )
  }

  try {
    const { data } = await axios.get(
      `${global.APIs.faa}/faa/stickerly?q=${encodeURIComponent(text)}`
    )

    const results = data?.results?.slice(0, 5)
    if (!results?.length) return

    for (const i of results) {
      try {
        let img = await axios.get(i.url, { responseType: 'arraybuffer' })
        let buffer = Buffer.from(img.data)

        const stiker = await sticker(
          buffer,
          false,
          i.title || 'Ryo Yamada MD',
          i.creator || 'Hilman',
          { type: StickerTypes.FULL, animated: true }
        )

        if (stiker) {
          await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
        }
      } catch {}
    }
  } catch {}
}

handler.command = ['tenor']

export default handler
handler.category = 'Media'
handler.description = 'Sticker-tenor'

