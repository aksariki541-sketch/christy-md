// lib/media.js
//
// Helper pengambilan & pengiriman media untuk plugin.
// Dipakai oleh plugin gambar/audio/sticker agar tidak menduplikasi logika.

import sharp from 'sharp'
import { downloadContentFromMessage } from './baileys.js'

const SUPPORTED = ['image', 'video', 'audio', 'document', 'sticker']

// Cari node media dari pesan yang dikirim atau pesan yang di-quote.
export function findMedia(m) {
    const candidates = []
    if (m?.quoted) candidates.push([m.quoted.mtype, m.quoted.msg || m.quoted])
    if (m?.mtype) candidates.push([m.mtype, m.msg])

    for (const [type, node] of candidates) {
        if (!type || !node || typeof node !== 'object') continue
        const kind = String(type).replace(/Message$/, '')
        if (!SUPPORTED.includes(kind)) continue
        if (node.mediaKey || node.directPath || node.url) return { kind, node }
    }
    return null
}

export async function downloadMedia(m) {
    const found = findMedia(m)
    if (!found) return null

    const stream = await downloadContentFromMessage(found.node, found.kind)
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    return { buffer: Buffer.concat(chunks), kind: found.kind }
}

// Ambil buffer gambar dari pesan/quoted (gambar, sticker, atau dokumen gambar).
export async function imageBuffer(m) {
    const media = await downloadMedia(m)
    if (!media) return null

    if (media.kind === 'image' || media.kind === 'sticker') return media.buffer

    if (media.kind === 'document' || media.kind === 'video') {
        try {
            return await sharp(media.buffer).png().toBuffer()
        } catch {
            return null
        }
    }
    return null
}

export async function toSticker(buffer) {
    return sharp(buffer, { animated: false })
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 82 })
        .toBuffer()
}

export async function toJpeg(buffer, quality = 88) {
    return sharp(buffer).flatten({ background: '#ffffff' }).jpeg({ quality }).toBuffer()
}

export function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let value = Number(bytes) || 0
    let i = 0
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024
        i++
    }
    return `${value.toFixed(value >= 100 || i === 0 ? 0 : 2)} ${units[i]}`
}
