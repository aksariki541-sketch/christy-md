const MORSE = {
    a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..',
    j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.',
    s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
    6: '-....', 7: '--...', 8: '---..', 9: '----.'
}
const FROM_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]))

const toMorse = (text) => [...text.toLowerCase()]
    .map(ch => (ch === ' ' ? '/' : MORSE[ch] || ''))
    .filter(Boolean)
    .join(' ')

const fromMorse = (text) => text
    .split(/\s+/)
    .map(code => (code === '/' ? ' ' : FROM_MORSE[code] || ''))
    .join('')

const rot13 = (text) => text.replace(/[a-z]/gi, ch => {
    const base = ch <= 'Z' ? 65 : 97
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base)
})

const toBinary = (text) => [...text].map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
const fromBinary = (text) => {
    const parts = text.trim().split(/\s+/)
    if (!parts.every(p => /^[01]{8}$/.test(p))) return null
    return parts.map(p => String.fromCharCode(parseInt(p, 2))).join('')
}

const toHex = (text) => Buffer.from(text, 'utf8').toString('hex')
const fromHex = (text) => {
    const clean = text.replace(/\s+/g, '')
    if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) return null
    return Buffer.from(clean, 'hex').toString('utf8')
}

let handler = async (m, { command, text, notifReply }) => {
    const input = (text || '').trim() || (m.quoted?.text || '').trim()
    if (!input) return notifReply('Masukkan teks yang mau diproses.\n\nContoh:\n.b64e halo dunia', 'Butuh Teks')

    switch (command) {
        case 'b64e':
        case 'base64encode':
            return notifReply(Buffer.from(input, 'utf8').toString('base64'), 'Base64 Encode')

        case 'b64d':
        case 'base64decode': {
            try {
                const decoded = Buffer.from(input, 'base64').toString('utf8')
                if (!decoded) throw new Error('kosong')
                return notifReply(decoded, 'Base64 Decode')
            } catch {
                return notifReply('Teks bukan Base64 yang valid.', 'Base64 Decode')
            }
        }

        case 'urlencode':
            return notifReply(encodeURIComponent(input), 'URL Encode')

        case 'urldecode':
            try {
                return notifReply(decodeURIComponent(input), 'URL Decode')
            } catch {
                return notifReply('Format URL encoding tidak valid.', 'URL Decode')
            }

        case 'morse':
            return notifReply(toMorse(input), 'Morse')

        case 'unmorse': {
            const result = fromMorse(input)
            return notifReply(result || 'Kode morse tidak dikenali.', 'Morse Decode')
        }

        case 'rot13':
            return notifReply(rot13(input), 'ROT13')

        case 'hex':
        case 'tohex':
            return notifReply(toHex(input), 'Hex Encode')

        case 'unhex':
        case 'fromhex': {
            const result = fromHex(input)
            return notifReply(result ?? 'Format hex tidak valid.', 'Hex Decode')
        }

        case 'binary':
        case 'tobinary':
            return notifReply(toBinary(input), 'Binary Encode')

        case 'unbinary':
        case 'frombinary': {
            const result = fromBinary(input)
            return notifReply(result ?? 'Format biner tidak valid (butuh 8 bit per karakter).', 'Binary Decode')
        }

        default:
            return
    }
}

handler.command = ['b64e', 'base64encode', 'b64d', 'base64decode', 'urlencode', 'urldecode',
    'morse', 'unmorse', 'rot13', 'hex', 'tohex', 'unhex', 'fromhex',
    'binary', 'tobinary', 'unbinary', 'frombinary']
handler.category = 'Tools'
handler.description = 'Encode & decode (Base64, URL, Morse, Hex, Biner, ROT13)'

export default handler
