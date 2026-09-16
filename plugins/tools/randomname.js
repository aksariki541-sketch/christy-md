// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/randomname.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .randomname

/**
 * CR Ponta Sensei
 * CH https://
 * WEB https://codeteam.my.id
**/

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const ALL_CATEGORIES = [
 'afr','alb','ara','arm','aze','bas','bel','ben','bos','bre','bul','cat','chi','cro','cze','dan','dut','eng','est','fin','fre',
 'fri','gal','geo','ger','gre','hau','haw','heb','hun','ice','igb','ind','ins','iri','ita','jap','kaz','khm','kor','lat','lim',
 'lth','mac','mly','mao','ame','nep','nor','per','pol','por','rmn','rus','sco','ser','slk','sln','spa','swa','swe','tha','tur',
 'ukr','urd','vie','wel','yor','zul','myth','celm','egym','grem','neam','scam','romm','anci','enga','cela','gmca','grea','scaa',
 'roma','litk','bibl','indm','hist','lite','popu','theo','whim','fairy','goth','hb','hippy','kk','rap','trans','witch','wrest',
 'fntsy','fntsg','fntsm','fntso','fntsr','fntss','fntst','fntsx'
]

async function generateRandomName({
 gender = 'both',
 number = 2,
 surnameType = 'none', // none | random | custom
 customSurname = '',
 usage = []
} = {}) {
 const BASE_URL = 'https://www.behindthename.com/random/random.php'
 const params = new URLSearchParams({
 gender,
 number: number.toString(),
 sets: '1',
 showextra: 'yes',
 norare: 'yes',
 nodiminutives: 'yes',
 all: usage.length === 0 ? 'yes' : ''
 })
 if (surnameType === 'random') {
 params.set('randomsurname', 'yes')
 } else if (surnameType === 'custom' && customSurname) {
 params.set('surname', customSurname)
 }
 if (usage.length > 0) {
 usage.forEach(cat => {
 if (ALL_CATEGORIES.includes(cat)) {
 params.append(`usage_${cat}`, '1')
 }
 })
 }
 const url = `${BASE_URL}?${params.toString()}`
 const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
 const html = await res.text()
 const $ = cheerio.load(html)
 const names = $('.random-results a').map((i, el) => $(el).text().trim()).get()
 return names
}

let handler = async (m, { text }) => {
 if (!text) return m.reply('Format: randomname gender|kata|surname(optional)|kategori(optional)\nContoh: randomname cowok|3|random|eng,spa')

 let [genderRaw, kataRaw, surnameRaw, kategoriRaw] = text.split('|').map(v => v?.trim() || '')
 let gender = 'both'
 if (genderRaw) {
 if (['cowok', 'm', 'male'].includes(genderRaw.toLowerCase())) gender = 'm'
 else if (['cewek', 'f', 'female'].includes(genderRaw.toLowerCase())) gender = 'f'
 else gender = 'both'
 }
 let number = parseInt(kataRaw)
 if (isNaN(number) || number < 1 || number > 4) number = 2

 let surnameType = 'none'
 let customSurname = ''
 if (surnameRaw) {
 if (surnameRaw.toLowerCase() === 'random') surnameType = 'random'
 else if (surnameRaw !== '') {
 surnameType = 'custom'
 customSurname = surnameRaw
 }
 }

 let usage = []
 if (kategoriRaw) {
 usage = kategoriRaw.toLowerCase().split(',').map(k => k.trim()).filter(k => ALL_CATEGORIES.includes(k))
 }

 m.reply('Sedang mencari nama random, tunggu sebentar ya Senpai...')

 try {
 let names = await generateRandomName({
 gender,
 number,
 surnameType,
 customSurname,
 usage
 })
 if (!names.length) return m.reply('Gagal mendapatkan nama random, coba lagi ya Senpai.')

 let namaJadi = names.join(' ')

 let teks = `*Random Name Generator*\n`
 teks += `• Gender: ${gender === 'm' ? 'Cowok' : gender === 'f' ? 'Cewek' : 'Bebas'}\n`
 teks += `• Jumlah Kata: ${number}\n`
 teks += `• Surname: ${surnameType === 'random' ? 'Random' : (customSurname ? customSurname : 'Tidak ada')}\n`
 teks += `• Kategori: ${usage.length ? usage.join(', ') : 'Semua'}\n\n`
 teks += `*${namaJadi}*`

 m.reply(teks)
 } catch {
 m.reply('Terjadi kesalahan saat mengambil nama random, coba lagi nanti ya Senpai.')
 }
}

handler.command = ['randomname']
handler.category = 'Tools'
handler.description = 'Randomname'

export default handler

/**
 * CR Ponta Sensei
 * CH https://
 * WEB https://codeteam.my.id
**/