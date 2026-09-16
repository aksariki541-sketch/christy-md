import crypto from 'crypto'
import sharp from 'sharp'
import { SYMBOL } from '../../lib/ui.js'

const rand = (min, max) => min + crypto.randomInt(max - min + 1)

const toHex = (r, g, b) => `#${[r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('').toUpperCase()}`

const parseHex = (input) => {
    const clean = String(input || '').replace(/^#/, '').trim()
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
    return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
    }
}

const rgbToHsl = ({ r, g, b }) => {
    const rn = r / 255, gn = g / 255, bn = b / 255
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
    const l = (max + min) / 2
    let h = 0, s = 0
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
        else if (max === gn) h = ((bn - rn) / d + 2) / 6
        else h = ((rn - gn) / d + 4) / 6
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

// Nama warna sederhana berdasarkan HSL
const colorName = ({ h, s, l }) => {
    if (l < 12) return 'Hitam'
    if (l > 92) return 'Putih'
    if (s < 12) return 'Abu-abu'
    if (h < 15 || h >= 345) return 'Merah'
    if (h < 45) return 'Jingga'
    if (h < 70) return 'Kuning'
    if (h < 160) return 'Hijau'
    if (h < 200) return 'Cyan'
    if (h < 250) return 'Biru'
    if (h < 290) return 'Ungu'
    return 'Magenta'
}

const swatch = (rgb) => sharp({
    create: { width: 240, height: 120, channels: 3, background: rgb }
}).jpeg({ quality: 90 }).toBuffer()

let handler = async (m, { args, command, text, conn, notifReply }) => {
    switch (command) {
        case 'randomcolor':
        case 'warna': {
            const rgb = { r: rand(0, 255), g: rand(0, 255), b: rand(0, 255) }
            const hex = toHex(rgb.r, rgb.g, rgb.b)
            const hsl = rgbToHsl(rgb)
            const image = await swatch(rgb)
            await conn.sendMessage(m.chat, {
                image,
                caption: [
                    `${SYMBOL.mark} Warna acak`,
                    `HEX : ${hex}`,
                    `RGB : ${rgb.r}, ${rgb.g}, ${rgb.b}`,
                    `HSL : ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`,
                    `Nama: ${colorName(hsl)}`
                ].join('\n')
            }, { quoted: m })
            return
        }

        case 'hexrgb':
        case 'hexinfo': {
            const input = (args[0] || text || '').trim()
            const rgb = parseHex(input)
            if (!rgb) return notifReply('Format:\n.hexrgb <kode hex>\n\nContoh:\n.hexrgb #22D3EE', 'Info Warna')
            const hsl = rgbToHsl(rgb)
            const image = await swatch(rgb)
            await conn.sendMessage(m.chat, {
                image,
                caption: [
                    `${SYMBOL.mark} ${toHex(rgb.r, rgb.g, rgb.b)}`,
                    `RGB : ${rgb.r}, ${rgb.g}, ${rgb.b}`,
                    `HSL : ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`,
                    `Nama: ${colorName(hsl)}`
                ].join('\n')
            }, { quoted: m })
            return
        }

        case 'rgbhex': {
            const numbers = (text || '').split(/[\s,]+/).map(Number).filter(Number.isFinite)
            if (numbers.length < 3) {
                return notifReply('Format:\n.rgbhex <r> <g> <b>\n\nContoh:\n.rgbhex 34 211 238', 'Konversi Warna')
            }
            const [r, g, b] = numbers.map(v => Math.max(0, Math.min(255, Math.round(v))))
            const hsl = rgbToHsl({ r, g, b })
            const image = await swatch({ r, g, b })
            await conn.sendMessage(m.chat, {
                image,
                caption: [
                    `${SYMBOL.mark} RGB ${r}, ${g}, ${b}`,
                    `HEX : ${toHex(r, g, b)}`,
                    `HSL : ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`,
                    `Nama: ${colorName(hsl)}`
                ].join('\n')
            }, { quoted: m })
            return
        }

        case 'colorname': {
            const rgb = parseHex(args[0] || text)
            if (!rgb) return notifReply('Format:\n.colorname <hex>', 'Nama Warna')
            const hsl = rgbToHsl(rgb)
            return notifReply(`${toHex(rgb.r, rgb.g, rgb.b)} → *${colorName(hsl)}*\nHSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, 'Nama Warna')
        }

        default:
            return
    }
}

handler.command = ['randomcolor', 'warna', 'hexrgb', 'hexinfo', 'rgbhex', 'colorname']
handler.category = 'Tools'
handler.description = 'Warna: acak, konversi HEX/RGB/HSL'

export default handler
