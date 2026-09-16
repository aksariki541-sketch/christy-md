// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_antipromosi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : handler.before/all -> handler.onMessage

let handler = m => m

handler.onMessage = async function (m, { isBotAdmin, isAdmin }) {
  let chat = global.db.data.chats[m.chat]
  let text = m.text || ''

  if (!chat?.antiPromosi) return
  if (!m.isGroup) return
  if (!isBotAdmin) return
  if (isAdmin) return

  let promoRegex = /(murah|promo|promosi|jualan|open jasa|open murid|panel|nokos|sewa bot|jastip|open admin|join grup|join gc|benefit|testimoni|order|ready stock|hubungi|wa\.me|https?:\/\/chat\.whatsapp\.com)/i

  if (promoRegex.test(text)) {
    await this.sendMessage(m.chat, {
      delete: m.key
    })

    await m.reply('🚫 Promosi tidak diperbolehkan di grup ini')
  }
}

export default handler
handler.category = 'Tools'
handler.description = 'Antipromosi'

