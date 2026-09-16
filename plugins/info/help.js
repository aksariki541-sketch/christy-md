// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/help.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: help→help2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .help2

let handler = async (m, { conn, usedPrefix }) => {

  await conn.sendMessage(m.chat, {
    richResponse: [
      {
        text: 'totalfitur'
      },
      {
        text: 'status overview\n'
      },

      // 📊 Table menu utama
      {
        title: 'menu',
        table: [
          {
            isHeading: true,
            items: ['category', 'command']
          },
          {
            isHeading: false,
            items: ['info', `${usedPrefix}totalfitur`]
          },
          {
            isHeading: false,
            items: ['owner', `${usedPrefix}gp`]
          },
          {
            isHeading: false,
            items: ['group', 'ingatkan ... jam ...']
          }
        ]
      },

      // 💻 contoh penggunaan
      {
        text: '\nexample\n'
      },
      {
        language: 'javascript',
        code: [
          {
            highlightType: 0,
            codeContent: `${usedPrefix}totalfitur`
          },
          {
            highlightType: 0,
            codeContent: `${usedPrefix}gp menu`
          }
        ]
      },

      // ✨ closing
      {
        text: '\nclean interface • fast response'
      }
    ]
  }, { quoted: m })
}

handler.command = ['help2']

export default handler
handler.category = 'Main'
handler.description = 'Help'

