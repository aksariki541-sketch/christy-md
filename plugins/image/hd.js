import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/^image\//.test(mime)) {
    return m.reply(
      `Kirim atau reply sebuah foto dengan caption *${usedPrefix}${command}*`
    )
  }

  await m.react('🕒')

  let tmpFile

  try {
    const media = await q.download()

    if (!media || !Buffer.isBuffer(media)) {
      throw new Error('Gagal mengunduh gambar dari pesan.')
    }

    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    tmpFile = path.join(tmpDir, `hd-input-${Date.now()}.jpg`)
    fs.writeFileSync(tmpFile, media)

    // 1) Upload ke catbox.moe untuk dapat URL publik
    const fd = new FormData()
    fd.append('reqtype', 'fileupload')
    fd.append(
      'fileToUpload',
      new Blob([fs.readFileSync(tmpFile)], { type: 'image/jpeg' }),
      path.basename(tmpFile)
    )

    const upRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: fd
    })
    const imageUrl = (await upRes.text()).trim()

    if (!imageUrl.startsWith('http')) {
      throw new Error('Gagal mengupload gambar ke host publik.')
    }

    // Bersihkan file input setelah upload berhasil
    try {
      fs.unlinkSync(tmpFile)
      tmpFile = null
    } catch {}

    // 2) Panggil API jerexd.my.id untuk HD/Upscale (scale 4x)
    const apiRes = await fetch(
      'https://api.jerexd.my.id/api/tools/hd?apikey=jere_oLuQmh1XoHHN',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scale: '4',
          url: imageUrl
        })
      }
    )

    // Tangani jika server mengembalikan HTML (misal halaman maintenance/error)
    const contentType = apiRes.headers.get('content-type') || ''

    if (contentType.includes('text/html')) {
      const html = await apiRes.text()
      throw new Error(
        `API mengembalikan HTML (kemungkinan endpoint error/maintenance). Cuplikan: ${html.slice(0, 120)}`
      )
    }

    if (!apiRes.ok) {
      throw new Error(`API merespons HTTP ${apiRes.status}`)
    }

    const data = await apiRes.json()

    // Validasi struktur JSON dari jerexd.my.id
    if (data?.status === false) {
      throw new Error(data?.message || 'API menolak permintaan.')
    }

    // ✅ Field yang benar dari API jerexd.my.id adalah `upscaled_url`
    const resultUrl =
      data?.result?.upscaled_url ||
      data?.upscaled_url ||
      data?.result?.url ||
      data?.url ||
      data?.data ||
      data?.result?.data

    if (!resultUrl) {
      throw new Error(
        'Tidak menemukan URL hasil. Struktur: ' +
          JSON.stringify(data).slice(0, 250)
      )
    }

    // 3) Download gambar HD dari URL hasil
    const fetchResult = await fetch(resultUrl)
    if (!fetchResult.ok) {
      throw new Error(
        `Gagal mengunduh hasil HD. HTTP ${fetchResult.status}`
      )
    }
    const ab = await fetchResult.arrayBuffer()
    const resultBuffer = Buffer.from(ab)

    if (!Buffer.isBuffer(resultBuffer) || resultBuffer.length === 0) {
      throw new Error('Buffer hasil HD kosong atau tidak valid.')
    }

    const scaleApplied = data?.result?.scale_applied || '4x'
    const fileName = data?.result?.filename || 'hd.jpg'

    await conn.sendFile(
      m.chat,
      resultBuffer,
      fileName,
      `✨ *HD berhasil!*\n• Scale: ${scaleApplied}\n• Ukuran: ${(
        resultBuffer.length /
        1024 /
        1024
      ).toFixed(2)} MB`,
      m
    )

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    await m.reply(`❌ *Gagal:* ${e.message || e}`)
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try {
        fs.unlinkSync(tmpFile)
      } catch {}
    }
  }
}

handler.help = ['hd']
handler.tags = ['image', 'tools']
handler.command = /^(hd|upscale|enhance)$/i
handler.limit = true
handler.register = false
handler.premium = false

export default handler