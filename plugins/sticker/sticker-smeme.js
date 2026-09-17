import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

async function uguu(filePath) {
  const form = new FormData()
  form.append('files[]', fs.createReadStream(filePath))

  const { data } = await axios.post(
    'https://uguu.se/upload',
    form,
    { headers: form.getHeaders() }
  )

  return data.files[0].url
}

async function getSmemeUrl(atas, bawah, bg) {
  const primary =
    `https://api-faa.my.id/faa/smeme?text_atas=${encodeURIComponent(atas)}&text_bawah=${encodeURIComponent(bawah)}&background=${encodeURIComponent(bg)}`

  try {
    const res = await axios.get(primary, {
      responseType: 'arraybuffer',
      timeout: 15000
    })

    if (Buffer.isBuffer(res.data) && res.data.length > 1000)
      return primary
  } catch (e) {
    console.log('FAA API Error:', e.message)
  }

  return `https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${encodeURIComponent(bg)}`
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted || m

  if (!text) {
    return m.reply(
      `Contoh:\n${usedPrefix + command} teks atas|teks bawah`
    )
  }

  let [atas, bawah] = text.split('|')
  atas ||= ' '
  bawah ||= ' '

  let buffer
  try {
    buffer = await q.download()
  } catch {
    return m.reply(
      `Balas gambar dengan caption:\n${usedPrefix + command} teks atas|teks bawah`
    )
  }

  await m.react('✨')

  const mime = (q.msg || q).mimetype || 'image/png'
  const ext = mime.split('/')[1] || 'png'

  const tempFile = path.join(
    process.cwd(),
    `smeme_${Date.now()}.${ext}`
  )

  fs.writeFileSync(tempFile, buffer)

  try {
    const url = await uguu(tempFile)

    const memeUrl = await getSmemeUrl(
      atas,
      bawah,
      url
    )

    await conn.sendSticker(
      m.chat,
      memeUrl,
      m,
      {
        packname: global.stickpack || global.namebot,
        packpublish: global.stickauth || global.author
      }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Gagal membuat meme sticker')
  } finally {
    if (fs.existsSync(tempFile))
      fs.unlinkSync(tempFile)
  }
}

handler.help = ['smeme <teks atas>|teks bawah']
handler.tags = ['sticker']
handler.command = /^smeme$/i
handler.limit = true

export default handler