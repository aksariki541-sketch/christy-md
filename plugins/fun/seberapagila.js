// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/seberapagila.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .seberapagila

let handler = async (m, { text }) => {
 const nama = text || m.pushName || 'Kamu'
 const persen = Math.floor(Math.random() * 101)

 const komentar = [
 'Normal... kayak batu bata.',
 'Agak nyeleneh, tapi masih bisa diajak diskusi.',
 'Udah mulai ngaco, tolong dijaga.',
 'Wah ini sih gila bener, cocok masuk rumah tertawa.',
 'Level dewa... gila tapi keren.',
 'Gila banget, sampe bot aja pusing baca chat kamu.',
 'Kayaknya udah enggak bisa diselamatkan 😭',
 'Kamu waras, tapi cuma kalau tidur.',
 'Gila dalam diam... serem banget kamu.',
 'Gila bergaya profesional. Respect.'
 ]

 const kata = komentar[Math.floor(Math.random() * komentar.length)]

 m.reply(`🧠 *Tes Kegilaan Hari Ini*\n\n👤 Nama: *${nama}*\n📊 Tingkat Gila: *${persen}%*\n🗯️ Komentar: *${kata}*`)
}

handler.command = ['seberapagila']
handler.category = 'Fun'
handler.description = 'Seberapagila'

export default handler