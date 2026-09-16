// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/moveon.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .moveon

/*

# Fitur : Gatau
# Type : Plugins ESM
# Created by : https://
# Api : Local Logic

 ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

let handler = async (m, { conn }) => {
 const alasanGagal = [
 "*Error: Masih menyimpan fotonya di galeri*",
 "*Error: Masih suka stalking story-nya tiap malam*",
 "*Error: File hati sedang digunakan oleh proses lain: 'rindu.exe'*",
 "*Error: Gagal menghapus karena kenangan terlalu dalam*",
 "*Error: Sistem mendeteksi denyut jantung meningkat saat melihat namanya*",
 "*Error: Modul 'ikhlas.dll' belum terpasang*",
 "*Error: Masih berharap tanpa sadar*",
 "*Error: Masih ingat semua kata sandi dia*",
 "*Error: Proses move on terhenti, karena lagu 'Kenangan Manis.mp3' diputar kembali*",
 "*Error: Chat terakhir belum dihapus, masih dibaca berulang-ulang*"
 ]

 const teks = [
 "⏳ *Menjalankan perintah: moveon.exe*",
 "⌛ Mengakses direktori kenangan...",
 "⌛ Menemukan 1.042 file terkait: mantan.jpg, tawa.mp3, chat_kita.txt, pelukan terakhir.mp4",
 "⌛ Menghapus file: mantan.jpg",
 "⌛ Menghapus file: tawa.mp3",
 "⌛ Menghapus file: chat_kita.txt",
 "⌛ Menghapus file: pelukan terakhir.mp4",
 "⌛ Membersihkan folder: /hati/kenangan/spesial",
 "⌛ Menghapus log malam_nangis.log",
 "⌛ Menghapus config: harapan.yaml",
 "⌛ Menonaktifkan modul: berharap_lagi.dll",
 "⌛ Menutup port luka_terbuka 4040",
 "⌛ Mencabut izin akses memori emosional",
 "⌛ Restart sistem perasaan...",
 "⌛ Verifikasi status...",
 "❌ *Gagal*"
 ]

 for (let i = 0; i < teks.length; i++) {
 setTimeout(() => {
 conn.sendMessage(m.chat, { text: teks[i] }, { quoted: m })
 }, i * 1600)
 }

 
 setTimeout(() => {
 let alasan = alasanGagal[Math.floor(Math.random() * alasanGagal.length)]
 conn.sendMessage(m.chat, { text: alasan }, { quoted: m })
 }, teks.length * 1600)
}

handler.command = ['moveon']

handler.category = 'Fun'
handler.description = 'Moveon'

export default handler