// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/tutorialbot.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tutorialbot, .tutorbot

let handler = async (m, { conn }) => {

let hlmn = `
╭╾• 〔 T U T O R I A L   B O T 〕
│
├  Sebelum memakai bot, lakukan pendaftaran
├  Ketik : .daftar Nama.Umur
│
├  Bot menggunakan prefix : . atau /
├  Pastikan command sesuai dengan prefix
├  Bot tidak merespon jika salah penulisan
│
├  Gunakan menu untuk melihat daftar fitur
├  Ketik : .menu atau .menu all
│
├  Fitur Sticker
├  Ketik : .brat <text>
│
├  Download Video TikTok
├  Ketik : .tiktok <link>
├  Atau : .tt <link>
│
├  Download Musik
├  Ketik : .play <judul lagu>
│
├  Fitur Game
├  Ketik : .susunkata
│
├  Fitur RPG
├  Ketik : .bank
├  Ketik : .kerja
├  Ketik : .inventory
│
├  Fitur AI & Tools
├  Ketik : .ai <pertanyaan>
├  Ketik : .qc <text>
├  Ketik : .toimg
├  Ketik : .removebg
│
├  Gunakan fitur dengan benar dan seperlunya
├  Beri jeda agar bot tetap stabil
│
└─「 Christy MD 」
`

conn.reply(m.chat, hlmn.trim(), global.fkontak)
}

handler.command = ['tutorialbot', 'tutorbot']
handler.group = false

export default handler;
handler.category = 'Main'
handler.description = 'Tutorialbot'

