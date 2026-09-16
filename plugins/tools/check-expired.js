// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/check-expired.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : listener murni -> handler.onMessage

let lastCheck = 0

async function before(m, { conn }) {
  const now = Date.now()

  if (now - lastCheck < 60000) return
  lastCheck = now

  if (!global.db.data.sewa) return

  for (const [jid, data] of Object.entries(global.db.data.sewa)) {
    if (!data?.expired) continue

    const sisa = data.expired - now

    try {
      if (sisa <= 86400000 && !data.warn24h) {
        await conn.sendMessage(jid, {
          text: '⚠️ Masa sewa bot akan berakhir dalam 24 jam.'
        })
        data.warn24h = true
      }

      if (sisa <= 0) {
        await conn.sendMessage(jid, {
          text: '❌ Masa sewa habis, bot akan keluar dari grup.'
        })

        await conn.groupLeave(jid)
        delete global.db.data.sewa[jid]
      }
    } catch (e) {
      console.error('[SEWA]', e)
    }
  }

  return false
}

// Dibungkus jadi plugin Christy MD: hook asli "handler.before" (dipanggil untuk
// setiap pesan di base lama) dipetakan ke hook "handler.onMessage".
const handler = async (m, ctx) => before(m, {
    conn: ctx.conn, sock: ctx.sock, plugins: ctx.plugins,
    args: ctx.args, text: ctx.text, usedPrefix: ctx.usedPrefix,
    isAdmin: ctx.isAdmin, isBotAdmin: ctx.isBotAdmin,
    isOwner: ctx.isOwner, isCreator: ctx.isCreator, isPremium: ctx.isPremium, isPrems: ctx.isPrems,
    participants: ctx.participants, groupMetadata: ctx.groupMetadata,
    user: ctx.user
})
handler.onMessage = handler

export default handler
handler.category = 'Tools'
handler.description = 'Check-expired'

