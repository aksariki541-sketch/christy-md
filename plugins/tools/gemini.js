// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/gemini.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .gemini, .ai

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Halo`,
      m
    )
  }

  try {
    let res = await fetch(`${global.APIs.faa}/faa/gemini-ai?text=${encodeURIComponent(text)}`)
    let json = await res.json()

    if (!json.status) throw 'API error'

    conn.reply(m.chat, json.result.trim(), m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil jawaban.', m)
  }
}

handler.command = ['gemini', 'ai']

export default handler
handler.category = 'Tools'
handler.description = 'Gemini'

