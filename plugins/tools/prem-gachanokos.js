// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/prem-gachanokos.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .gachanokos, .getotp

import axios from 'axios'

const BASE_URL = 'https://allapiproject.zone.id/api/gacha'
const PER_PAGE = 20

async function getNumbers() {
 const { data } = await axios.get(`${BASE_URL}/numbers`, {
 headers: {
 Accept: 'application/json',
 'User-Agent': 'Mozilla/5.0'
 }
 })

 if (!data.success) throw new Error('Gagal mengambil data nomor.')

 return data.numbers || []
}

async function getOtps(limit = 200) {
 const { data } = await axios.get(`${BASE_URL}/otps`, {
 params: { limit },
 headers: {
 Accept: 'application/json',
 'User-Agent': 'Mozilla/5.0'
 }
 })

 if (!data.success) throw new Error('Gagal mengambil OTP.')

 return data.otps || []
}

function capitalize(str = '') {
 return str.charAt(0).toUpperCase() + str.slice(1)
}

let handler = async (m, { conn, command, text }) => {
 try {

 // ===========================
 // GACHA NOKOS
 // ===========================
 if (/^gachanokos$/i.test(command)) {

 const allNumbers = await getNumbers()

 let args = text.trim().split(/\s+/).filter(Boolean)

 let page = 1
 let keyword = ''

 if (args.length) {
 if (/^\d+$/.test(args[0])) {
 page = Math.max(parseInt(args[0]), 1)
 } else {
 keyword = args[0].toLowerCase()

 if (args[1] && /^\d+$/.test(args[1])) {
 page = Math.max(parseInt(args[1]), 1)
 }
 }
 }

 let list = keyword
 ? allNumbers.filter(v =>
 v.country.toLowerCase().includes(keyword)
 )
 : allNumbers

 if (!list.length)
 return conn.reply(
 m.chat,
 `❌ Negara *${capitalize(keyword)}* tidak ditemukan.`,
 m
 )

 const totalPage = Math.ceil(list.length / PER_PAGE)

 if (page > totalPage)
 page = totalPage

 const start = (page - 1) * PER_PAGE
 const data = list.slice(start, start + PER_PAGE)

 let txt = `🎲 *GACHA NOKOS*\n\n`

 txt += `📄 Halaman : ${page}/${totalPage}\n`
 txt += `📦 Total : ${list.length}\n`

 if (keyword)
 txt += `🌍 Filter : ${capitalize(keyword)}\n`

 txt += '\n'

 data.forEach((v, i) => {
 txt += `*${start + i + 1}.* ${v.flag} ${v.country}\n`
 txt += `📱 Nomor : +${v.number}\n`
 txt += `🆔 ID : ${v.id}\n\n`
 })

 txt += '━━━━━━━━━━━━━━━\n'
 txt += `Contoh:\n`
 txt += `.gachanokos ${page + 1}\n`

 if (keyword)
 txt += `.gachanokos ${keyword} ${page + 1}\n`

 txt += `.getotp +628xxxxxxxx`

 return conn.reply(m.chat, txt, m)
 }

 // ===========================
 // GET OTP
 // ===========================
 if (/^getotp$/i.test(command)) {

 const query = text.trim()

 // Ambil lebih banyak data supaya peluang ketemu lebih besar
 const otps = await getOtps(500)

 // ===========================
 // .getotp
 // ===========================
 if (!query) {

 let txt = `📩 *OTP TERBARU*\n\n`
 txt += `📦 Total Ditampilkan : ${Math.min(20, otps.length)}\n\n`

 for (const [i, item] of otps.slice(0, 20).entries()) {

 txt += `*${i + 1}.* ${item.flag || "🌍"} ${item.country || "-"}\n`
 txt += `📱 Nomor : +${item.number}\n`
 txt += `👤 Sender : ${item.sender || "-"}\n`
 txt += `🔑 OTP : ${item.otp || "-"}\n`

 if (item.time)
 txt += `⏰ ${item.time}\n`

 if (item.message)
 txt += `💬 ${item.message.replace(/\n/g, " ")}\n`

 txt += "\n"
 }

 txt += "━━━━━━━━━━━━━━━\n"
 txt += "Contoh:\n"
 txt += ".getotp 584161001211"

 return conn.reply(m.chat, txt.trim(), m)
 }

 // ===========================
 // .getotp 50
 // ===========================
 if (/^\d+$/.test(query) && query.length <= 3) {

 const limit = Math.min(parseInt(query), 100)

 const list = await getOtps(limit)

 let txt = `📩 *OTP TERBARU*\n\n`
 txt += `📦 Total : ${list.length}\n\n`

 list.forEach((item, i) => {

 txt += `*${i + 1}. ${item.flag || "🌍"} ${item.country || "-"}*\n`
 txt += `📱 ${item.number}\n`
 txt += `🔑 ${item.otp || "-"}\n`

 if (item.sender)
 txt += `👤 ${item.sender}\n`

 txt += "\n"

 })

 return conn.reply(m.chat, txt.trim(), m)

 }

 // ===========================
 // .getotp 584161001211
 // ===========================

 const nomor = query.replace(/\D/g, "")

 const hasil = otps.filter(v => {

 const num = String(v.number || "").replace(/\D/g, "")

 return (
 num === nomor ||
 num.endsWith(nomor) ||
 nomor.endsWith(num)
 )

 })

 if (!hasil.length)
 return conn.reply(
 m.chat,
 "❌ OTP untuk nomor tersebut tidak ditemukan.",
 m
 )

 let txt = `🔍 *HASIL PENCARIAN OTP*\n\n`
 txt += `📱 Nomor : +${nomor}\n`
 txt += `📦 Ditemukan : ${hasil.length}\n\n`

 hasil.forEach((item, i) => {

 txt += `*${i + 1}.*\n`
 txt += `🌍 ${item.flag || ""} ${item.country || "-"}\n`
 txt += `👤 ${item.sender || "-"}\n`
 txt += `🔑 OTP : ${item.otp || "-"}\n`

 if (item.time)
 txt += `⏰ ${item.time}\n`

 if (item.message)
 txt += `💬 ${item.message.replace(/\n/g, " ")}\n`

 txt += "\n"

 })

 return conn.reply(m.chat, txt.trim(), m)
 }

 } catch (e) {

 console.error(e)

 conn.reply(
 m.chat,
 `❌ Error\n\n${e.message || e}`,
 m
 )

 }

}


handler.premium = true
handler.command = ['gachanokos', 'getotp']

handler.category = 'Tools'
handler.description = 'Gachanokos'

export default handler