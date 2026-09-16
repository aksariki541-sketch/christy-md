// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/setintro.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setintro, .intro, .delintro

let handler = async (m, { text, command }) => {
  if (!m.isGroup) throw 'Fitur ini hanya untuk grup!'

  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

  if (command === 'setintro') {
    if (!text) throw `Contoh penggunaan:
.setintro Selamat datang di grup ini

\`\`\`
╭─〔 CARD INTRO 〕
│ • Name        :
│ • Gender      :
│ • Umur        :
│ • Asal        :
│ • Anime Fav   :
│ • Husbu/Waifu :
╰───────────────♡
\`\`\``

    chat.intro = text
    return m.reply('✅ Intro grup berhasil disimpan')
  }

  if (command === 'intro') {
    if (!chat.intro) throw 'Intro belum diset'
    return m.reply(chat.intro)
  }

  if (command === 'delintro') {
    if (!chat.intro) throw 'Intro belum ada'
    delete chat.intro
    return m.reply('🗑️ Intro berhasil dihapus')
  }
}

handler.command = ['setintro', 'intro', 'delintro']
handler.admin = true
handler.group = true

export default handler
handler.category = 'Group'
handler.description = 'Setintro'

