// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sound/music.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .music

let handler = async (m, { conn, args }) => {
 if (!args[0]) {
 return m.reply(
 `Contoh penggunaan:\n` +
 `.music 1\n` +
 `.music 65`
 )
 }

 const num = parseInt(args[0])

 if (isNaN(num) || num < 1 || num > 65) {
 return m.reply('Masukkan nomor dari 1 sampai 65.')
 }

 const musicUrl = `https://github.com/Rez4-3yz/Music-rd/raw/master/music/music${num}.mp3`

 try {
 await conn.sendMessage(
 m.chat,
 {
 audio: { url: musicUrl },
 mimetype: 'audio/mpeg',
 ptt: false,
 fileName: `music${num}.mp3`
 },
 { quoted: m }
 )
 } catch {
 m.reply('❌ Sound tidak ditemukan atau gagal diambil.')
 }
}

handler.command = ['music']
handler.category = 'Media'
handler.description = 'Music'

export default handler