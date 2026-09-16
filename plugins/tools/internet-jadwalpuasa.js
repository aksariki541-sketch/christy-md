// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/internet-jadwalpuasa.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .jadwalpuasa

/**
 * jadwal puasa 
 * -----------------------------
 * Type : Plugins ESM
 * creator : Hilman
 * Channel : https://
 Api : https://api.myquran.com
 */
import axios from 'axios'

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

 try {
 const { data: search } = await axios.get(
 `https://api.myquran.com/v3/sholat/kabkota/cari/${encodeURIComponent(text)}`,
 { timeout: 10000 }
 )

 if (!search.data.length) throw 'Kota tidak ditemukan'

 const kota = search.data[0]

 const { data: jadwalRes } = await axios.get(
 `https://api.myquran.com/v3/sholat/jadwal/${kota.id}/today?tz=Asia/Jakarta`,
 { timeout: 10000 }
 )

 const info = jadwalRes.data
 const j = Object.values(info.jadwal)[0]

 const caption = `🌙 *JADWAL PUASA RAMADHAN*

📍 ${info.kabko}
📅 ${j.tanggal}

Imsak : ${j.imsak}
Subuh : ${j.subuh}

Maghrib (Buka Puasa) : ${j.maghrib}`

 conn.reply(m.chat, caption, m)

 } catch (err) {
 console.log(err.message)
 conn.reply(m.chat, 'Kota tidak ditemukan.', m)
 }
}

handler.command = ['jadwalpuasa']
handler.category = 'Tools'
handler.description = 'Jadwalpuasa'

export default handler