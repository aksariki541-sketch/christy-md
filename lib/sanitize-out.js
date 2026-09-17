/**
 * ══════════════════════════════════════════════════════════════
 *  sanitize-out.js
 *  Filter terpusat untuk SETIAP pesan keluar bot.
 *
 *  Tujuan: memastikan link spoo.me & GitHub (github.com,
 *  api.github.com, gist.github.com, raw.githubusercontent.com,
 *  *.githubusercontent.com) TIDAK PERNAH muncul di chat, baik
 *  sebagai teks, footer, tombol, maupun link-preview. Semuanya
 *  dialihkan ke web resmi bot.
 *
 *  Penting: sub-pohon MEDIA (image/video/audio/document/sticker/
 *  thumbnail/dll) TIDAK disentuh, jadi pengambilan gambar/suara
 *  dari raw.githubusercontent.com tetap berfungsi normal.
 * ══════════════════════════════════════════════════════════════
 */

const WEB = 'https://nakanomiku-md.vercel.app'

// Cocokkan URL spoo.me / GitHub (dengan atau tanpa https://)
const BAD_URL =
  /(https?:\/\/)?(?:[\w.-]+\.)?(?:githubusercontent\.com|github\.com|spoo\.me)(?:\/[^\s"'`<>)\]}]*)?/gi

// Sub-pohon MEDIA / struktur biner -> jangan dimasuki
const SKIP_SUBTREE = new Set([
  // konten tingkat-tinggi Baileys
  'image', 'video', 'audio', 'document', 'sticker', 'contacts',
  'product', 'mediaData',
  // pesan proto mentah
  'imageMessage', 'videoMessage', 'audioMessage', 'documentMessage',
  'stickerMessage', 'ptvMessage', 'contactMessage',
  'contactsArrayMessage', 'liveLocationMessage'
])

// Kunci yang nilainya URL media / biner -> jangan ditulis ulang
const SKIP_KEY = new Set([
  'jpegThumbnail', 'highQualityThumbnail', 'thumbnail', 'thumbnailUrl',
  'thumbnailDirectPath', 'thumbnailSha256', 'thumbnailEncSha256',
  'favicon', 'mediaUrl', 'directPath', 'mediaKey', 'fileSha256',
  'fileEncSha256', 'encFileSha256', 'streamingSidecar',
  'mediaKeyTimestamp', 'fileLength', 'streamingSidecar'
])

const MAX_DEPTH = 30

function isBinaryOrSpecial(v) {
  return (
    Buffer.isBuffer(v) ||
    ArrayBuffer.isView(v) ||
    v instanceof Date ||
    v instanceof Map ||
    v instanceof Set ||
    v instanceof Promise ||
    typeof v.pipe === 'function' // stream
  )
}

function rewriteString(str) {
  return str.replace(BAD_URL, WEB)
}

function walk(node, key, depth, seen) {
  if (depth > MAX_DEPTH) return node

  if (typeof node === 'string') {
    if (key && SKIP_KEY.has(key)) return node
    if (node.includes('spoo.me') || node.includes('github')) {
      return rewriteString(node)
    }
    return node
  }

  if (node === null || typeof node !== 'object') return node
  if (isBinaryOrSpecial(node)) return node
  if (typeof node === 'function') return node
  if (seen.has(node)) return node
  seen.add(node)

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) node[i] = walk(node[i], key, depth + 1, seen)
    return node
  }

  for (const k of Object.keys(node)) {
    if (SKIP_SUBTREE.has(k)) continue // biarkan media utuh
    try {
      node[k] = walk(node[k], k, depth + 1, seen)
    } catch {
      /* jangan pernah gagalkan kirim pesan */
    }
  }
  return node
}

/**
 * Bersihkan satu konten pesan (objek yang dikirim ke sendMessage /
 * relayMessage).
 */
export function sanitizeOutgoing(content) {
  if (content == null) return content
  try {
    return walk(content, undefined, 0, new WeakSet())
  } catch (e) {
    // Jangan pernah menggagalkan pengiriman karena sanitizer
    return content
  }
}

const FLAG = Symbol.for('christy.sanitizeOut.installed')

/**
 * Pasang wrapper pada socket (dipanggil dari handler, idempoten).
 */
export function installOutgoingSanitizer(conn) {
  if (!conn || typeof conn !== 'object') return conn
  if (conn[FLAG]) return conn
  try {
    conn[FLAG] = true
  } catch {
    if (conn.__sanitizeInstalled) return conn
    conn.__sanitizeInstalled = true
  }

  if (typeof conn.sendMessage === 'function') {
    const orig = conn.sendMessage.bind(conn)
    conn.sendMessage = (jid, content, ...rest) =>
      orig(jid, sanitizeOutgoing(content), ...rest)
  }

  if (typeof conn.relayMessage === 'function') {
    const origRelay = conn.relayMessage.bind(conn)
    conn.relayMessage = (jid, message, ...rest) =>
      origRelay(jid, sanitizeOutgoing(message), ...rest)
  }

  return conn
}

export default { sanitizeOutgoing, installOutgoingSanitizer, WEB }
