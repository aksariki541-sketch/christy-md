// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/bratbahlil.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bahlil, .bratbahlil

/**
 * ✨ Brat Bahlil
 * -----------------------------
 * Type   : Plugins ESM 
 * Author : Riki
 * Source : https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
 */

import canvasLib from '@napi-rs/canvas'
const { createCanvas, loadImage } = canvasLib
import fetch from "node-fetch"
import { createSticker, StickerTypes } from "wa-sticker-formatter"

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: `✨ Contoh:\n${usedPrefix + command} halo member` },
      { quoted: global.fkontak }
    )
  }

  await m.react("✨")

  try {
    const imageUrl = "https://i.ibb.co/JwT2QFvY/elaina-md.jpg"

    const res = await fetch(imageUrl)
    const buffer = Buffer.from(await res.arrayBuffer())
    const img = await loadImage(buffer)

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(img, 0, 0, img.width, img.height)

    const boardX = img.width * 0.18
    const boardY = img.height * 0.55
    const boardW = img.width * 0.64
    const boardH = img.height * 0.30

    const padding = boardW * 0.08
    const textAreaW = boardW - padding * 2

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#000000"

    function wrapLines(ctx, text, maxWidth) {
      const words = text.split(" ")
      let lines = []
      let line = ""
      for (let w of words) {
        const test = line + w + " "
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          lines.push(line.trim())
          line = w + " "
        } else {
          line = test
        }
      }
      lines.push(line.trim())
      return lines
    }

    let fontSize = 80
    let lines = []

    while (fontSize > 32) {
      ctx.font = `500 ${fontSize}px Roboto, Helvetica Neue, Helvetica, Arial, sans-serif`
      lines = wrapLines(ctx, text, textAreaW)
      const lineHeight = fontSize * 1.05
      if (lines.length <= 3 && lines.length * lineHeight <= boardH) break
      fontSize--
    }

    ctx.font = `500 ${fontSize}px Roboto, Helvetica Neue, Helvetica, Arial, sans-serif`

    ctx.shadowColor = "rgba(0,0,0,0.12)"
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    const lineHeight = fontSize * 1.05
    const startY =
      boardY +
      boardH / 2 -
      (lines.length * lineHeight) / 2 +
      lineHeight * 0.38

    lines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(
        line,
        boardX + boardW / 2,
        startY + i * lineHeight
      )
    })

    const stickerBuffer = await createSticker(canvas.toBuffer("image/png"), {
      type: StickerTypes.FULL,
      pack: "ᴍɪᴋᴜ yᴀᴍᴀᴅᴀ - ᴍᴅ",
      author: "ʙy ʀɪᴋɪ",
      quality: 80
    })

    await conn.sendMessage(
      m.chat,
      { sticker: stickerBuffer },
      { quoted: global.fkontak }
    )
  } catch (e) {
    console.error(e)
    await conn.sendMessage(
      m.chat,
      { text: "❌ Gagal membuat stiker" },
      { quoted: global.fkontak }
    )
  }
}

handler.command = ['bahlil', 'bratbahlil']

export default handler
handler.category = 'Media'
handler.description = 'Bratbahlil'

