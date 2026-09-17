import axios from 'axios'
import crypto from 'node:crypto'

const CONFIG = {
  UA: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  TIMEOUT: 60000,
  MAX_RETRIES: 3,
  API_HOST: 'https://api.hitube.io',
  WEB_HOST: 'https://hitube.io',
  WH: 'hitube.io',
  PUBKEY_DER_B64:
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCAdf/EyIbLBxjGqmh7qLU6/CPCzru+75+82OSPZ+nf4BFvg88drpZ6KigNW0J8TNgxe6Yms1irCZNVDyu+RXsl4y/7c2KOHc4OGTzHB5fUMiMasFUvcEs2P70e6yA/sKHZfBLG1XPhlb84Ibs3nhD3W5e2SuC+4EuVkaqzN08LQIDAQAB'
}

const PUBKEY_PEM =
  '-----BEGIN PUBLIC KEY-----\n' +
  CONFIG.PUBKEY_DER_B64.match(/.{1,64}/g).join('\n') +
  '\n-----END PUBLIC KEY-----'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function buildSecureMessage() {
  const ts = Date.now().toString()
  const enc = crypto.publicEncrypt(
    {
      key: PUBKEY_PEM,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    Buffer.from(ts, 'utf8')
  )
  return enc.toString('base64')
}

function generateSessionId() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < 10; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return `hitube.io_${s}_${Date.now()}`
}

function isValidTikTokUrl(url) {
  return /https?:\/\/(www\.|vm\.|vt\.|m\.)?tiktok\.com\//i.test(url || '')
}

function buildTokenUrl(jwt, sessionid) {
  if (!jwt) return null
  return `${CONFIG.API_HOST}/st-tik/token/${jwt}?sessionid=${sessionid}&wh=${encodeURIComponent(CONFIG.WH)}`
}

async function requestWithRetry(config, label, attempts = CONFIG.MAX_RETRIES) {
  let lastError

  for (let i = 1; i <= attempts; i++) {
    try {
      return await axios({
        timeout: CONFIG.TIMEOUT,
        validateStatus: () => true,
        ...config
      })
    } catch (e) {
      lastError = e
      if (i === attempts) break
      await sleep(i * 1000)
    }
  }

  throw new Error(`${label} gagal: ${lastError.message}`)
}

async function hitubeDownload(url) {
  if (!url) throw new Error('URL TikTok wajib diisi')
  if (!isValidTikTokUrl(url)) throw new Error('URL TikTok tidak valid')

  const sessionid = generateSessionId()

  const response = await requestWithRetry(
    {
      method: 'GET',
      url: `${CONFIG.API_HOST}/st-tik/tiktok/dl?url=${encodeURIComponent(
        url
      )}&sessionid=${sessionid}`,
      headers: {
        Accept: 'application/json, text/plain, */*',
        Origin: CONFIG.WEB_HOST,
        Referer: CONFIG.WEB_HOST + '/',
        'User-Agent': CONFIG.UA,
        'X-Secure-Message': buildSecureMessage()
      }
    },
    'TikTok Downloader'
  )

  if (response.status === 429)
    throw new Error('Rate limit, coba lagi beberapa saat.')

  if (response.status !== 200)
    throw new Error(`HTTP Error ${response.status}`)

  const body = response.data

  if (!body?.result || body.code !== 200)
    throw new Error(body?.msg || body?.message || 'Response tidak valid.')

  const x = body.result

  return {
    desc: x.desc,
    author: x.author,
    duration: x.duration,
    type: x.type,
    thumbnail: buildTokenUrl(x.thumb, sessionid),
    cover: buildTokenUrl(x.cover, sessionid),
    video: buildTokenUrl(x.withoutWaterMarkMp4, sessionid),
    video_wm: buildTokenUrl(x.waterMarkMp4, sessionid),
    audio: buildTokenUrl(x.mp3, sessionid),
    images: Array.isArray(x.pics)
      ? x.pics.map(v => buildTokenUrl(v, sessionid))
      : []
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const input = m.quoted?.text || text

    if (!input)
      return m.reply(
        `Masukkan link TikTok.\n\nContoh:\n${usedPrefix + command} https://vt.tiktok.com/xxxx`
      )

    await m.react?.('⏳')

    const data = await hitubeDownload(input)

    const caption = `
乂 *TIKTOK DOWNLOADER*

👤 Author : ${data.author || '-'}
📝 Caption : ${data.desc || '-'}
⏱️ Durasi : ${data.duration || '-'}
📦 Type : ${data.type || '-'}
`.trim()

    if (data.images.length) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: data.images[0] },
          caption
        },
        { quoted: m }
      )

      for (let i = 1; i < data.images.length; i++) {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: data.images[i] }
          },
          { quoted: m }
        )
      }

      if (data.audio) {
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: data.audio },
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        )
      }
    } else {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: data.video },
          caption
        },
        { quoted: m }
      )

      if (data.audio) {
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: data.audio },
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        )
      }
    }

    await m.react?.('✅')
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    m.reply(e.message)
  }
}

handler.help = ['tiktok2 <url>']
handler.tags = ['downloader']
handler.command = ['tiktok2', 'tt2']
handler.limit = true

export default handler