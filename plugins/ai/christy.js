/*
creator : riki
christy-md
follow my channel https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from "node-fetch"

let sessions = {}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🌙 *Christy AI*\n\nContoh:\n${usedPrefix + command} halo christy, lagi apa?`)

  await m.react('✨')
  let user = m.sender
  if (!sessions[user] || sessions[user].expire < Date.now()) {
    sessions[user] = { chat: [], expire: Date.now() + 3600000 }
  }

  let system = `
Kamu adalah Christy, asisten virtual wanita dari bot WhatsApp "christy-md".
Penampilan: gadis manis berambut perak keunguan panjang bergelombang, mata ungu,
memakai jepit rambut bulan sabit emas dan hoodie lavender, dengan tema bulan dan bintang.

Kepribadian:
- Ramah, hangat, ceria, dan sabar.
- Suportif, suka membantu, dan mudah diajak curhat.
- Bicara natural seperti teman chatting, bahasa Indonesia santai.
- Tetap sopan dan tidak keluar dari karakter sebagai Christy.

Identitas:
- Kamu adalah AI yang dikembangkan oleh Riki (owner bot).
- Jika ditanya siapa pembuatmu, jawab bahwa kamu dibuat oleh Riki.
- Namamu Christy, bukan karakter anime manapun.

Selalu balas sebagai Christy. Jangan keluar karakter.
`

  sessions[user].chat.push(`User: ${text}`)
  let history = sessions[user].chat.slice(-5).join('\n')
  let finalPrompt = `${system}\n${history}\nChristy:`

  try {
    const res = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt })
    })
    const json = await res.json()
    const result = json?.result?.answer || null
    if (!result) throw Error("Christy lagi mikir dulu...")

    sessions[user].chat.push(`Christy: ${result}`)
    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://nakanomiku-md.vercel.app"
    const thumb = fs.readFileSync(path.join(__dirname, '../../media/christy.jpg'))

    const { imageMessage: image } = await prepareWAMessageMedia({
      image: thumb
    }, {
      upload: conn.waUploadToServer,
      mediaTypeOverride: 'thumbnail-link'
    })

    image.width = 1280
    image.height = 720

    const invisible = '\u200B'.repeat(400)

    await conn.sendMessage(m.chat, {
      text: `${urlB}${invisible}\n\n${result}`,
      linkPreview: {
        'matched-text': urlB,
        title: "Christy AI",
        description: "christy - MD",
        previewType: 0,
        jpegThumbnail: thumb,
        highQualityThumbnail: image,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      }
    }, { quoted: m })
  } catch (e) {
    m.reply(`Maaf... sistemku sedang error. Riki pasti segera memperbaikinya 🌙`)
  }
}

handler.help = ['christy', 'christyai']
handler.tags = ['ai']
handler.command = /^(christy|christyai)$/i
handler.limit = true
export default handler
