// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/jadwalsholat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .jadwalsholat

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {

 if (!text) {
 return conn.reply(
 m.chat,
 `Masukkan nama kota

Contoh:
${usedPrefix + command} tasikmalaya`,
 m
 )
 }

 let kota = text

 try {
 let res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(kota)}&country=Indonesia&method=11`)
 let json = await res.json()

 if (!json.data) throw 'Not Found'

 let jadwal = json.data.timings
 let tanggal = json.data.date.readable

 let caption = ` *JADWAL SHOLAT*

📍 Kota : ${kota}
📅 Tanggal : ${tanggal}

Subuh : ${jadwal.Fajr}
Dzuhur : ${jadwal.Dhuhr}
Ashar : ${jadwal.Asr}
Maghrib : ${jadwal.Maghrib}
Isya : ${jadwal.Isha}`

 await conn.reply(m.chat, caption, m)

 } catch (e) {
 conn.reply(m.chat, 'Kota tidak ditemukan', m)
 }
}

handler.command = ['jadwalsholat']
handler.category = 'Main'
handler.description = 'Jadwalsholat'

export default handler