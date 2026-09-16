// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/group-antitagall.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .antitagall
// Catatan    : handler.before/all -> handler.onMessage

let handler = async (m, { args }) => {
  let o = args[0] || ""

  if (!["--on", "--off"].includes(o))
    return m.reply("⚠️ Pilih opsi:\n\n• --on\n• --off")

  if (!db.data.chats[m.chat]) {
    db.data.chats[m.chat] = { antitagall: false }
  }

  switch (o) {
    case "--on":
      db.data.chats[m.chat].antitagall = true
      m.reply("✅ Anti TagAll berhasil diaktifkan")
      break

    case "--off":
      db.data.chats[m.chat].antitagall = false
      m.reply("❌ Anti TagAll berhasil dinonaktifkan")
      break
  }
}

handler.onMessage = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return
  if (!m.mentionedJid || !m.mentionedJid.length) return

  const chat = db?.data?.chats?.[m.chat]
  if (!chat?.antitagall) return
  if (isAdmin) return

  const maxTag = 5
  if (m.mentionedJid.length < maxTag) return

  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })

    await conn.reply(
      m.chat,
      `*– 乂 Anti TagAll –*\nTerlalu banyak mention dalam satu pesan.`,
      m
    )
  } catch (e) {
    console.error("AntiTagAll error:", e)
  }
}

handler.command = ['antitagall']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
handler.category = 'Group'
handler.description = 'Group-antitagall'

