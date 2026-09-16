// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/npmshield.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .npmshield

/**
 ╔══════════════════════
 ⧉ [npmshield] — [tools]
╚══════════════════════

 ✺ Type : Plugin ESM
 ✺ Source : https://
 ✺ Creator : SXZnightmare
 ✺ Note : menyediakan quick info berbasis badge, bukan untuk analisis data mendalam atau perhitungan presisi, ditanya berguna engga nya juga kurang tau v:
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
 try {
 if (!text) {
 return m.reply(`*Contoh:* ${usedPrefix + command} /npm/dw/react`)
 }

 await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

 let path = text.trim()
 if (!path.startsWith('/')) {
 return m.reply(`🍂 *Path tidak valid.*\nGunakan:\n*/npm/dw/react*`)
 }

 const url = `https://img.shields.io${path}?format=json`

 const res = await fetch(url, {
 headers: {
 "user-agent": "Mozilla/5.0",
 "accept": "application/json,image/svg+xml"
 }
 })

 if (!res.ok) {
 return m.reply(`🍂 *Fetch gagal.*\nStatus: *${res.status}*`)
 }

 const type = res.headers.get('content-type') || ''

 if (type.includes('application/json')) {
 const data = await res.json()

 let output = `📦 *Shields.io Badge Info*\n\n`
 output += `🏷️ *Label:* ${data.label || '-'}\n`
 output += `📊 *Value:* ${data.message || '-'}\n`
 output += `🎨 *Color:* ${data.color || '-'}\n`

 if (data.namedLogo) {
 output += `🧩 *Logo:* ${data.namedLogo}\n`
 }

 return m.reply(output)
 }

 const svg = await res.text()

 const texts = [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)]
 .map(v => v[1].replace(/&[^;]+;/g, '').trim())
 .filter(Boolean)

 if (texts.length >= 2) {
 let output = `📦 *Shields.io Badge Info (SVG)*\n\n`
 output += `🏷️ *Label:* ${texts[0]}\n`
 output += `📊 *Value:* ${texts[texts.length - 1]}\n`
 output += `🖼️ *Source:* SVG fallback\n`

 return m.reply(output)
 }

 throw new Error('SVG parse failed')
 } catch (e) {
 await m.reply(`🍂 *Gagal memproses badge.*\nEndpoint tidak bisa dibaca.`)
 } finally {
 await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
 }
}

handler.command = ['npmshield'];
handler.category = 'Tools'
handler.description = 'Npmshield'

export default handler