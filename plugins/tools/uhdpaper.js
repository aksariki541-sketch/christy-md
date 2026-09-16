// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/uhdpaper.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .uhdpaper

import axios from 'axios'
import * as cheerio from 'cheerio'

async function UhdpaperSearch(query) {
 try {
 const response = await axios.get(`https://www.uhdpaper.com/search?q=${encodeURIComponent(query)}&by-date=true&i=0`, {
 headers: {
 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
 }
 })
 const html = response.data
 const $ = cheerio.load(html)
 const results = []

 $('article.post-outer-container').each((_, element) => {
 const title = $(element).find('.snippet-title h2').text().trim()
 const imageUrl = $(element).find('.snippet-title img').attr('src')
 const resolution = $(element).find('.wp_box b').text().trim()
 const link = $(element).find('a').attr('href')

 if (title && imageUrl && resolution && link) {
 results.push({ title, imageUrl, resolution, link })
 }
 })

 return results
 } catch (error) {
 console.error('Error scraping UHDPaper:', error.message)
 return []
 }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) throw `Contoh:\n${usedPrefix + command} naruto`

 let results = await UhdpaperSearch(text)
 if (results.length === 0) throw 'Wallpaper tidak ditemukan!'

 let list = results.map((v, i) => `*${i + 1}. ${v.title}*\n📏 *Resolusi:* ${v.resolution}\n🔗 ${v.link}`).join`\n\n`

 await conn.sendMessage(m.chat, { text: `*Hasil Pencarian UHDPaper: ${text}*\n\n${list}` }, { quoted: m })
}

handler.command = ['uhdpaper']
handler.category = 'Tools'
handler.description = 'Uhdpaper'

export default handler