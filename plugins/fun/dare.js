// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/quotes/dare.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: dare→dare2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .dare2
// daftar lokal (pengganti @bochilteam/scraper — paket itu memakai cheerio
// versi lama yang tidak cocok dengan project ini)
const DAFTAR_DARE = [
  "Foto selfie terjelek kirim ke grup",
  "Bilang 'aku sayang kamu' ke orang yang ada di chat",
  "Tirukan suara hewan sampai ada yang nebak",
  "Ketik apa saja dengan mata tertutup selama 30 detik",
  "Ceritakan hal paling memalukan yang pernah kamu alami",
  "Ganti nama jadi 'Aku Lucu' selama 10 menit",
  "Kirim voice note nyanyi satu lagu",
  "Chat orang yang kamu suka sekarang juga",
  "Pamerkan isi galeri foto ke-5 dari atas",
  "Bilang jujur siapa yang kamu suka di grup ini"
]

async function dare() {
    return DAFTAR_DARE[Math.floor(Math.random() * DAFTAR_DARE.length)]
}



import fs from 'fs'
import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix, __dirname, text, command }) => {
let tag = `@${m.sender.replace(/@.+/, '')}`
  let mentionedJid = [m.sender]
let name = conn.getName(m.sender)
let flaaa2 = [
'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=',
'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=',
'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=',
'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=',
'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=']
let cin = await dare()
let nth = '❲ *DARE* ❳'
m.reply(nth + `\n` + cin)
}
handler.command = ['dare2']


export default handler

function ucapan() {
  const time = moment.tz('Asia/Jakarta').format('HH')
  let res = "Selamat Malam"
  if (time >= 4) {
    res = "Selamat Pagi"
  }
  if (time >= 10) {
    res = "Selamat Siang"
  }
  if (time >= 15) {
    res = "Selamat Sore"
  }
  if (time >= 18) {
    res = "Selamat Malam"
  }
  return res
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
handler.category = 'Fun'
handler.description = 'Dare'

