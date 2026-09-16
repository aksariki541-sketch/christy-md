// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/ig.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ig, .instagram

import axios from "axios"
import FormData from "form-data"
import * as cheerio from "cheerio"

async function igdl(url, m) {
 m.reply('Wait')
 const form = new FormData()
 form.append("url", url)
 form.append("action", "post")

 const res = await axios.post("https://snapinsta.top/action.php", form, {
 headers: {
 ...form.getHeaders(),
 "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
 "accept": "*/*",
 "origin": "https://snapinsta.top",
 "referer": "https://snapinsta.top/"
 }
 })

 const $ = cheerio.load(res.data)
 const downloads = []

 $(".download-items__btn a").each((_, el) => {
 let path = $(el).attr("href")
 if (!path) return
 if (!path.startsWith("http")) path = "https://snapinsta.top" + path
 downloads.push(path)
 })

 return {
 status: downloads.length ? 200 : 404,
 download: downloads
 }
}

let handler = async (m, { conn, args, command }) => {
 try {
 if (!args[0]) return m.reply(`*Example:* .${command} https://www.instagram.com/p/xxxx/`)
 let res = await igdl(args[0], m)

 for (let url of res.download) {
 let buf = (await axios.get(url, { responseType: "arraybuffer" })).data
 buf = Buffer.from(buf)

 if (buf.slice(4, 8).toString() === "ftyp")
 await conn.sendMessage(m.chat, { video: buf }, { quoted: m })
 else
 await conn.sendMessage(m.chat, { image: buf }, { quoted: m })
 }

 } catch (e) {
 m.reply(e.message)
 }
}

handler.command = ['ig', 'instagram']
handler.category = 'Media'
handler.description = 'Ig'

export default handler