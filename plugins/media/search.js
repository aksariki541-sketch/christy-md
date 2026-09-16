// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/search.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .stickersearch

import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://getstickerpack.com'

async function searchStickerPack(query) {
 const res = await axios.get(`${BASE_URL}/stickers?query=${encodeURIComponent(query)}`, {
 headers: {
 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
 }
 })
 const $ = cheerio.load(res.data)
 const packs = []

 $('.sticker-pack-cols a').each((_, el) => {
 const title = $(el).find('.title').text().trim()
 const href = $(el).attr('href')?.trim()
 if (title && href) {
 const fullUrl = href.startsWith('http') ? href : BASE_URL + href
 packs.push({ title, url: fullUrl })
 }
 })

 return packs
}

let handler = async (m, { text, conn, usedPrefix, command }) => {
 if (!text) return m.reply(`🔍 Contoh penggunaan:\n${usedPrefix + command} gura`)

 try {
 await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

 const results = await searchStickerPack(text)

 if (!results.length) return m.reply(`❌ Sticker pack dengan kata kunci *${text}* tidak ditemukan.`)

 let list = `📦 Hasil pencarian untuk *${text}*:\n\n`
 results.forEach((p, i) => {
 list += `${i + 1}. *${p.title}*\n${p.url}\n\n`
 })

 await m.reply(list)
 await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

 } catch (e) {
 console.error(e)
 m.reply('❌ Terjadi kesalahan saat mencari sticker pack.')
 await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
 }
}

handler.command = ['stickersearch']
handler.category = 'Media'
handler.description = 'Search'

export default handler