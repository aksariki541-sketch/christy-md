// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sound/sound.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: sound→sound2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sound2

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(
      `Contoh penggunaan:\n` +
      `.sound 1\n` +
      `.sound 119`
    )
  }

  const num = parseInt(args[0])

  if (isNaN(num) || num < 1 || num > 119) {
    return m.reply('Masukkan nomor dari 1 sampai 119.')
  }

  m.reply('✨ Mengirim audio...')

  const audioUrl = `https://raw.githubusercontent.com/Aisyah-Aldi/Sound/main/sound${num}.mp3`

  await conn.sendFile(
    m.chat,
    audioUrl,
    `sound${num}.mp3`,
    null,
    m,
    false,
    {
      type: 'audioMessage',
      ptt: true,
      seconds: 0
    }
  )
}

handler.command = ['sound2']

export default handler
handler.category = 'Media'
handler.description = 'Sound'

