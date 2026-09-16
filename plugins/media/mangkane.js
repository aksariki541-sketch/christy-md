// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sound/mangkane.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .mangkane

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(
      `Contoh penggunaan:\n` +
      `.mangkane 1\n` +
      `.mangkane 54`
    )
  }

  const num = parseInt(args[0])

  if (isNaN(num) || num < 1 || num > 54) {
    return m.reply('Masukkan nomor dari 1 sampai 54.')
  }

  let audio

  if (num <= 24) {
    audio = `https://raw.githubusercontent.com/hyuura/Rest-Sound/main/HyuuraKane/mangkane${num}.mp3`
  } else {
    audio = `https://raw.githubusercontent.com/aisyah-rest/mangkane/main/Mangkanenya/mangkane${num}.mp3`
  }

  m.reply('✨ Mengirim audio...')

  await conn.sendMessage(
    m.chat,
    {
      audio: { url: audio },
      mimetype: 'audio/mpeg',
      fileName: `mangkane${num}.mp3`
    },
    { quoted: global.fkontak || m }
  )
}

handler.command = ['mangkane']

export default handler
handler.category = 'Media'
handler.description = 'Mangkane'

