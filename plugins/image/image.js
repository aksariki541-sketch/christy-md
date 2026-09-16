import sharp from 'sharp'
import { imageBuffer, toSticker, toJpeg, formatBytes } from '../../lib/media.js'
import { SYMBOL } from '../../lib/ui.js'

const needImage = 'Kirim/bales gambar dengan perintah ini.\n\nContoh:\n1. Kirim gambar\n2. Bales gambarnya dengan .sticker'

const out = (buffer, name = 'JPEG') => ({ buffer, name })

let handler = async (m, { args, command, conn, notifReply }) => {
    const buffer = await imageBuffer(m).catch(() => null)
    if (!buffer) return notifReply(needImage, 'Butuh Gambar')

    let meta = {}
    try {
        meta = await sharp(buffer).metadata()
    } catch {
        return notifReply('File yang dikirim tidak bisa dibaca sebagai gambar.', 'Gagal Membaca')
    }

    const num = (index, fallback) => {
        const value = Number(args[index])
        return Number.isFinite(value) ? value : fallback
    }

    switch (command) {
        case 'sticker':
        case 'stiker': {
            const webp = await toSticker(buffer)
            await conn.sendMessage(m.chat, { sticker: webp }, { quoted: m })
            return
        }

        case 'toimg':
        case 'toimage': {
            const jpeg = await toJpeg(buffer)
            await conn.sendMessage(m.chat, { image: jpeg, caption: `${SYMBOL.mark} Dari sticker/gambar untukmu` }, { quoted: m })
            return
        }

        case 'imgresize': {
            const width = Math.min(Math.max(num(0, 512), 16), 4096)
            const height = args[1] ? Math.min(Math.max(num(1, 512), 16), 4096) : null
            const result = await sharp(buffer).resize(width, height, { fit: 'inside' }).jpeg({ quality: 90 }).toBuffer()
            const after = await sharp(result).metadata()
            await conn.sendMessage(m.chat, {
                image: result,
                caption: `${SYMBOL.mark} Resize: ${meta.width}x${meta.height} → ${after.width}x${after.height}\n${formatBytes(result.length)}`
            }, { quoted: m })
            return
        }

        case 'imgscale': {
            const percent = Math.min(Math.max(num(0, 50), 5), 400)
            const result = await sharp(buffer).resize(Math.round((meta.width * percent) / 100)).jpeg({ quality: 90 }).toBuffer()
            const after = await sharp(result).metadata()
            await conn.sendMessage(m.chat, {
                image: result,
                caption: `${SYMBOL.mark} Skala ${percent}% → ${after.width}x${after.height}`
            }, { quoted: m })
            return
        }

        case 'grayscale':
        case 'greyscale':
            return out(await sharp(buffer).grayscale().jpeg({ quality: 90 }).toBuffer(), 'Grayscale')

        case 'invert':
        case 'invertimg':
            return out(await sharp(buffer).negate({ alpha: false }).jpeg({ quality: 90 }).toBuffer(), 'Invert')

        case 'blur': {
            const sigma = Math.min(Math.max(num(0, 5), 0.3), 50)
            return out(await sharp(buffer).blur(sigma).jpeg({ quality: 90 }).toBuffer(), `Blur σ=${sigma}`)
        }

        case 'sharpen': {
            const sigma = Math.min(Math.max(num(0, 2), 0.5), 10)
            return out(await sharp(buffer).sharpen({ sigma }).jpeg({ quality: 90 }).toBuffer(), `Sharpen σ=${sigma}`)
        }

        case 'brighten':
        case 'brightness': {
            const factor = Math.min(Math.max(num(0, 1.3), 0.1), 3)
            return out(await sharp(buffer).modulate({ brightness: factor }).jpeg({ quality: 90 }).toBuffer(), `Brightness x${factor}`)
        }

        case 'darken': {
            const factor = Math.min(Math.max(num(0, 0.7), 0.1), 1)
            return out(await sharp(buffer).modulate({ brightness: factor }).jpeg({ quality: 90 }).toBuffer(), `Darken x${factor}`)
        }

        case 'saturate': {
            const factor = Math.min(Math.max(num(0, 1.5), 0), 4)
            return out(await sharp(buffer).modulate({ saturation: factor }).jpeg({ quality: 90 }).toBuffer(), `Saturation x${factor}`)
        }

        case 'sepia':
        case 'vintage':
            return out(await sharp(buffer).modulate({ saturation: 0.6, brightness: 1.05 }).tint('#c0a080').jpeg({ quality: 90 }).toBuffer(), 'Sepia')

        case 'rotate': {
            const angle = num(0, 90)
            return out(await sharp(buffer).rotate(angle).jpeg({ quality: 90 }).toBuffer(), `Rotate ${angle}°`)
        }

        case 'flip':
            return out(await sharp(buffer).flip().jpeg({ quality: 90 }).toBuffer(), 'Flip Vertikal')

        case 'mirror':
            return out(await sharp(buffer).flop().jpeg({ quality: 90 }).toBuffer(), 'Mirror Horizontal')

        case 'compress': {
            const quality = Math.min(Math.max(num(0, 60), 10), 100)
            const result = await sharp(buffer).jpeg({ quality, mozjpeg: true }).toBuffer()
            await conn.sendMessage(m.chat, {
                image: result,
                caption: [
                    `${SYMBOL.mark} Kompresi gambar`,
                    `Sebelum : ${formatBytes(buffer.length)}`,
                    `Sesudah : ${formatBytes(result.length)}`,
                    `Hemat   : ${(100 - (result.length / buffer.length) * 100).toFixed(1)}%`
                ].join('\n')
            }, { quoted: m })
            return
        }

        case 'imgthumb':
        case 'thumbnail': {
            const size = Math.min(Math.max(num(0, 256), 32), 1024)
            const result = await sharp(buffer).resize(size, size, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()
            await conn.sendMessage(m.chat, {
                image: result,
                caption: `${SYMBOL.mark} Thumbnail ${size}x${size} · ${formatBytes(result.length)}`
            }, { quoted: m })
            return
        }

        case 'imgtojpg': {
            const result = await toJpeg(buffer, 92)
            await conn.sendMessage(m.chat, {
                image: result,
                caption: `${SYMBOL.mark} Dikonversi ke JPEG · ${formatBytes(result.length)}`
            }, { quoted: m })
            return
        }

        case 'imgtopng': {
            const result = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer()
            await conn.sendMessage(m.chat, {
                document: result, mimetype: 'image/png', fileName: `image-${Date.now()}.png`,
                caption: `${SYMBOL.mark} Dikonversi ke PNG · ${formatBytes(result.length)}`
            }, { quoted: m })
            return
        }

        case 'meme': {
            const top = (args[0] || '').trim()
            const bottom = args.slice(1).join(' ').trim()
            if (!top) {
                return notifReply('Format:\n.meme <teks atas> | <teks bawah>\n\nAtau:\n.meme teks atas | teks bawah (reply gambar)', 'Meme')
            }
            const [upper, lower] = top.includes('|') ? top.split('|').map(s => s.trim()) : [top, bottom]
            const base = await sharp(buffer).resize(600, null, { fit: 'inside' }).toBuffer()
            const { width, height } = await sharp(base).metadata()

            const escapeXml = (s) => String(s || '').replace(/[<>&'"]/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[ch]))
            const svg = `<svg width="${width}" height="${height}">
                <style>
                    .t { font-family: Impact, 'DejaVu Sans', sans-serif; font-weight: bold; fill: #fff;
                         stroke: #000; stroke-width: 3; paint-order: stroke; text-anchor: middle; }
                </style>
                ${upper ? `<text x="50%" y="${Math.round(height * 0.12)}" class="t" font-size="${Math.round(width / 12)}">${escapeXml(upper).toUpperCase()}</text>` : ''}
                ${lower ? `<text x="50%" y="${Math.round(height * 0.95)}" class="t" font-size="${Math.round(width / 12)}">${escapeXml(lower).toUpperCase()}</text>` : ''}
            </svg>`

            try {
                const result = await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 90 }).toBuffer()
                await conn.sendMessage(m.chat, { image: result, caption: `${SYMBOL.mark} Meme siap` }, { quoted: m })
            } catch (e) {
                await notifReply(`Gagal membuat meme.\nPastikan server punya font sistem (fontconfig + DejaVu).\n\n${e.message}`, 'Meme')
            }
            return
        }

        case 'imginfo':
        case 'imageinfo': {
            return notifReply([
                `Format    : ${meta.format || 'tidak diketahui'}`,
                `Dimensi   : ${meta.width}x${meta.height} px`,
                `Rasio     : ${(meta.width / meta.height).toFixed(2)}`,
                `Channel   : ${meta.channels || '-'}`,
                `Ruang warna: ${meta.space || '-'}`,
                `Ukuran    : ${formatBytes(buffer.length)}`,
                `Orientasi : ${meta.orientation || 'normal'}`
            ].join('\n'), 'Info Gambar')
        }

        case 'dominant':
        case 'dominantcolor': {
            const { dominant } = await sharp(buffer).stats()
            const hex = `#${[dominant.r, dominant.g, dominant.b].map(v => v.toString(16).padStart(2, '0')).join('')}`
            const swatch = await sharp({
                create: { width: 200, height: 80, channels: 3, background: { r: dominant.r, g: dominant.g, b: dominant.b } }
            }).jpeg().toBuffer()
            await conn.sendMessage(m.chat, {
                image: swatch,
                caption: `${SYMBOL.mark} Warna dominan: ${hex.toUpperCase()}\nRGB: ${dominant.r}, ${dominant.g}, ${dominant.b}`
            }, { quoted: m })
            return
        }

        default:
            return
    }
}

handler.command = ['sticker', 'stiker', 'toimg', 'toimage', 'imgresize', 'imgscale', 'grayscale',
    'greyscale', 'invert', 'invertimg', 'blur', 'sharpen', 'brighten', 'brightness', 'darken',
    'saturate', 'sepia', 'vintage', 'rotate', 'flip', 'mirror', 'compress', 'imgthumb', 'thumbnail',
    'imgtojpg', 'imgtopng', 'meme', 'imginfo', 'imageinfo', 'dominant', 'dominantcolor']
handler.category = 'Media'
handler.description = 'Edit gambar, sticker, filter, meme, info gambar'

export default handler
