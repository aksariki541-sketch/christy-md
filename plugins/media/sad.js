// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sound/sad.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sad

import axios from 'axios'

let handler = async (m, { conn, args }) => {
 const sadNumber = parseInt(args[0] || '', 10)

 if (isNaN(sadNumber) || sadNumber < 1 || sadNumber > 34)
 throw 'Masukkan nomor antara 1 dan 34\nContoh: .sad 2'

 const audioUrl = `https://github.com/Rangelofficial/Sad-Music/raw/main/audio-sad/sad${sadNumber}.mp3`

 m.reply('🍬 Mengirim audio...')

 const res = await fetch(audioUrl)
 if (!res.ok) throw 'Gagal mengunduh audio.'
 const audioBuffer = Buffer.from(await res.arrayBuffer())

 const thumbUrl = 'https://files.catbox.moe/y5b7l6.jpg'
 const thumb = (await axios.get(thumbUrl, { responseType: 'arraybuffer' })).data

 await conn.sendMessage(m.chat, {
 audio: audioBuffer,
 mimetype: 'audio/mpeg',
 ptt: false,
 contextInfo: {
 externalAdReplyOffOffOff: {
 title: "🎧 Sad Music",
 body: "Powered by Christy MD",
 thumbnail: thumb,
 sourceUrl: "https://github.com/Rangelofficial/Sad-Music",
 mediaType: 2,
 renderLargerThumbnail: false
 }
 }
 }, { quoted: m })
}

handler.command = ['sad']
handler.category = 'Media'
handler.description = 'Sad'

export default handler