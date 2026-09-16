// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/sticker.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .gif

import { sticker } from '../../lib/nakano/sticker.js'
import uploadFile from '../../lib/nakano/uploadFile.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const react = async (emoji) => {
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      })
    } catch (e) {
      console.error('❌ Gagal kirim reaction:', e)
    }
  }

  try {
    await react('🕒')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    let [packname, ...authorArr] = args.join(' ').split('|')
    packname = packname || global.stickpack
    let author = authorArr.join('|') || global.stickauth

    if (/video/g.test(mime)) {
      if ((q.msg || q).seconds > 10) {
        await react('❌')
        return m.reply('Maksimal 10 detik')
      }

      let img = await q.download?.()
      if (!img) throw `Balas video dengan *${usedPrefix + command}*`

      let stiker = false
      try {
        stiker = await sticker(img, false, packname, author)
      } catch (e) {
        console.error(e)
      } finally {
        if (!stiker) {
          let out = await uploadFile(img)
          stiker = await sticker(false, out, packname, author)
        }
      }

      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      await react('✨')

    } else if (/image/g.test(mime)) {
      let img = await q.download?.()
      if (!img) throw `Balas gambar dengan *${usedPrefix + command}*`

      let stiker = false
      try {
        stiker = await sticker(img, false, packname, author)
      } catch (e) {
        console.error(e)
      } finally {
        if (!stiker) {
          let out = await uploadFile(img)
          stiker = await sticker(false, out, packname, author)
        }
      }

      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      await react('✨')

    } else {
      await react('❌')
      m.reply(`Balas gambar atau video dengan command *${usedPrefix + command}*`)
    }

  } catch (e) {
    console.error(e)
    await react('❌')
    m.reply('❌ Terjadi kesalahan')
  }
}

handler.command = ['gif']

export default handler
handler.category = 'Media'
handler.description = 'Sticker'

