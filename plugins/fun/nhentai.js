// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/nsfw/nhentai.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .nhentai

const URL_TXT = 'https://raw.githubusercontent.com/zxrow/Asupan/refs/heads/main/nhentairandom.txt'

let cache = []
let lastFetch = 0
const TTL = 5 * 60 * 1000

async function getImages() {
  const now = Date.now()
  if (cache.length && now - lastFetch < TTL) return cache

  const res = await fetch(URL_TXT)
  const text = await res.text()

  const list = text
    .split('\n')
    .map(v => v.trim())
    .filter(v => v)
    .map(v => {
      try {
        const obj = JSON.parse(v.replace(/,$/, ''))
        return obj.url
      } catch {
        return null
      }
    })
    .filter(v => typeof v === 'string')

  cache = list
  lastFetch = now
  return cache
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let handler = async (m, { conn }) => {
  const list = await getImages()
  if (!list.length) return m.reply('Gambar tidak tersedia')

  const url = pick(list)

  await conn.sendMessage(
    m.chat,
    { image: { url } },
    { quoted: m }
  )
}

handler.command = ['nhentai']
handler.premium = true

export default handler
handler.category = 'Fun'
handler.description = 'Nhentai'

