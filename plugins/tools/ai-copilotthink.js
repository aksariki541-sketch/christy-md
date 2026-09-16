// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/ai-copilotthink.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .copilotthink

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return m.reply(`Contoh penggunaan:
${usedPrefix + command} Siapa presiden indonesia sekarang?`)
  }

  try {
    const url = `${global.APIs.deline}/ai/copilot-think?text=${encodeURIComponent(text)}`
    const { data } = await axios.get(url)

    if (!data.status) throw 'AI error'

    m.reply(data.result.text.trim())

  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil jawaban dari AI.')
  }
}

handler.command = ['copilotthink']

export default handler
handler.category = 'Tools'
handler.description = 'Ai-copilotthink'

