// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-setlabel.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setlabel, .label

// setlabel / tag nama di grup
import util from 'util'

let handler = async (m, { conn, text, command, usedPrefix }) => {
 if (!m.isGroup) return m.reply("❌ Hanya bisa digunakan di grup.")

 let labelText = (text || "").trim()

 if (!labelText && m.quoted) {
 const q = m.quoted
 labelText =
 q.text ||
 q.body ||
 q.msg?.text ||
 q.msg?.caption ||
 q.msg?.conversation ||
 q.message?.extendedTextMessage?.text ||
 q.message?.conversation ||
 ""
 labelText = (labelText || "").trim()
 }

 if (!labelText) {
 return m.reply(
 "🏷 *Set Label Nama di Grup*\n\n" +
 `• ${usedPrefix + command} Orang ganteng\n` +
 `• Atau reply ke teks lalu ketik: *${usedPrefix + command}*`
 )
 }

 labelText = labelText.slice(0, 30)

 let botJid = conn.user?.id || conn.decodeJid(conn.user?.id)

 await groupLabel(conn, m.chat, botJid, labelText)

 m.reply(`✅ Label BOT di grup ini berhasil diubah menjadi:\n*${labelText}*`)
}

handler.command = ['setlabel', 'label']
handler.group = true
handler.owner = true

handler.category = 'Owner'
handler.description = 'Setlabel'

export default handler

async function groupLabel(sock, targetGroupJid, targetJid, text) {
 try {
 const label = String(text || "").slice(0, 30)
 if (!label) return

 await sock.relayMessage(
 targetGroupJid,
 {
 protocolMessage: {
 type: 30,
 key: { participant: targetJid },
 memberLabel: { label }
 }
 },
 {
 additionalNodes: [
 {
 tag: "meta",
 attrs: {
 tag_reason: "user_update",
 appdata: "member_tag"
 },
 content: undefined
 }
 ]
 }
 )
 } catch (e) {
 console.error("GROUP LABEL ERROR:", e)
 }
}