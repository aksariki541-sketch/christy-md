// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/tebakumur.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tebakumur

let handler = async(m, { conn, text }) => {
 if (!text) return conn.reply(m.chat, 'Masukan Namamu', m)
 let age = umur.getRandom()
 m.reply(`Nama Kamu: ${text}\nUmur ${age}`)
}
handler.command = ['tebakumur']
handler.category = 'Fun'
handler.description = 'Tebakumur'

export default handler

const umur = [
'12 Tahun, Masih Bocil',
'11 Tahun, Bocilll',
'10 Tahun, Aduh Masih Gaboleh Main Hp Dek',
'16 Tahun, Remaja Lah Ya',
'19 Tahun, Remajaa',
'20 Tahun, Udah Nikah?',
'21 Tahun, Udah Ketemu Calon Nih?',
'14 Tahun',
'15 Tahun',
'17 Tahun',
'18 Tahun, Udah Balig Nih'
]