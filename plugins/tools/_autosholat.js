// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_autosholat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : listener murni -> handler.onMessage

import moment from "moment-timezone"

async function before(m) {
  this.autosholat = this.autosholat || {}

  const who = m.mentionedJid?.[0] || (m.fromMe ? this.user.jid : m.sender)
  const id = m.chat
  const now = Date.now()

  if (id in this.autosholat && now - this.autosholat[id].timestamp < 300000) return false

  const jadwalSholat = {
    Fajr: "04:42",
    Sunrise: "05:58",
    Dhuhr: "12:03",
    Asr: "15:09",
    Sunset: "18:08",
    Maghrib: "18:08",
    Isha: "19:38",
    Imsak: "04:32",
    Midnight: "00:03",
    Firstthird: "22:04",
    Lastthird: "02:01",
  }

  const timeNow = moment().tz("Asia/Jakarta").format("HH:mm")

  if (Object.values(jadwalSholat).includes(timeNow)) {
    const sholat = Object.keys(jadwalSholat).find(key => jadwalSholat[key] === timeNow)

    const caption = `@${who.split('@')[0]},
Waktu *${sholat}* telah tiba, ambillah air wudhu dan segeralah shalat.

*${timeNow}*
_untuk wilayah Jakarta dan sekitarnya._`

    this.autosholat[id] = {
      msg: await this.reply(
        m.chat,
        caption,
        null,
        {
          contextInfo: {
            mentionedJid: [who]
          }
        }
      ),
      timestamp: now
    }

    setTimeout(() => delete this.autosholat[id], 57000)
  }
}

export const disabled = false

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
handler.description = 'Autosholat'

