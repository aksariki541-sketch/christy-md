// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/antinsfw.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .antinsfw
// Catatan    : handler.before/all -> handler.onMessage

/*
creator : riki 
Christy MD
follow my channel https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
note : klo masi kurang sesuain lagi aja ya 
*/

import axios from 'axios'
import FormData from 'form-data'

async function nsfwCheck(buffer) {
  const form = new FormData()
  form.append('image', buffer, 'image.jpg')

  const { data } = await axios.post(
    'https://nsfw-categorize.it/api/upload',
    form,
    {
      headers: form.getHeaders()
    }
  )

  if (data.status !== 'OK') throw data.reason || 'Gagal cek NSFW'

  return data.data
}

let handler = async (m, { args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Fitur hanya untuk grup.")
  if (!(isAdmin || isOwner)) return m.reply("Hanya admin.")

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!args[0]) return m.reply("Gunakan:\n.antinsfw on / off")

  if (args[0] === 'on') {
    global.db.data.chats[m.chat].antinsfw = true
    return m.reply("✅ Anti NSFW aktif")
  }

  if (args[0] === 'off') {
    global.db.data.chats[m.chat].antinsfw = false
    return m.reply("❌ Anti NSFW mati")
  }

  m.reply("Opsi salah")
}

handler.onMessage = async (m, { conn, isBotAdmin, usedPrefix }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  if (typeof m.text === 'string') {
    if (m.text.toLowerCase().startsWith((usedPrefix || '.') + 'antinsfw')) return
  }

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!global.db.data.chats[m.chat].antinsfw) return

  let msg = m.msg || m.message?.imageMessage || m.message?.stickerMessage
  let mime = msg?.mimetype || ''

  if (!/image|webp/.test(mime)) return

  try {
    let buffer = await m.download()
    if (!buffer) return

    const res = await nsfwCheck(buffer)

    let klasifikasi = (res.classification || '').toLowerCase()
    let confidence = res.confidence || 0

    if (!klasifikasi || confidence < 50) return

    let isNSFW = false

    if (klasifikasi === 'porn' || klasifikasi === 'hentai') {
      if (confidence >= 70) isNSFW = true
    } else if (klasifikasi === 'nsfw' || klasifikasi === 'sexy') {
      if (confidence >= 90) isNSFW = true
    }

    let who = m.sender

    if (isNSFW) {
      await conn.sendMessage(m.chat, { delete: m.key })

      await conn.sendMessage(m.chat, {
        text: `🚫 @${who.split('@')[0]} jangan kirim NSFW`,
        mentions: [who]
      })
    }

  } catch (e) {
    console.error('ANTINSFW ERROR:', e)
  }
}

handler.command = ['antinsfw']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
handler.category = 'Group'
handler.description = 'Antinsfw'

