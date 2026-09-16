// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/game-caklontong_hint.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .calo

let handler = async (m, { conn }) => {
 conn.caklontong = conn.caklontong ? conn.caklontong : {}
 let id = m.chat
 if (!(id in conn.caklontong)) throw false
 let json = conn.caklontong[id][1]
 let ans = json.jawaban
 let clue = ans.replace(/[AIUEO]/gi, '_')
 m.reply('```' + clue + '```')
}
handler.command = ['calo']

handler.category = 'Tools'
handler.description = 'Caklontong Hint'

export default handler