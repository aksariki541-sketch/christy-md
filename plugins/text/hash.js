import crypto from 'crypto'

const ALGO = { md5: 'md5', sha1: 'sha1', sha256: 'sha256', sha512: 'sha512' }

const randomString = (length, charset) => {
    const bytes = crypto.randomBytes(length * 2)
    let out = ''
    for (let i = 0; out.length < length && i < bytes.length; i++) {
        const byte = bytes[i]
        if (byte < 256 - (256 % charset.length)) out += charset[byte % charset.length]
    }
    return out.padEnd(length, charset[0])
}

const randomNumber = (min, max) => {
    const range = max - min + 1
    return min + (crypto.randomInt ? crypto.randomInt(range) : Math.floor(Math.random() * range))
}

let handler = async (m, { args, command, text, notifReply }) => {
    const input = (text || '').trim() || (m.quoted?.text || '').trim()

    switch (command) {
        case 'md5':
        case 'sha1':
        case 'sha256':
        case 'sha512': {
            if (!input) return notifReply('Masukkan teks yang mau di-hash.', 'Butuh Teks')
            return notifReply(crypto.createHash(ALGO[command]).update(input, 'utf8').digest('hex'), command.toUpperCase())
        }

        case 'hash': {
            if (!input) return notifReply('Format:\n.hash <teks>\n\nMenampilkan MD5, SHA-1, SHA-256, SHA-512 sekaligus.', 'Butuh Teks')
            const rows = Object.entries(ALGO).map(([name, algo]) =>
                `*${name}*\n${crypto.createHash(algo).update(input, 'utf8').digest('hex')}`
            )
            return notifReply(rows.join('\n\n'), 'Hash Lengkap')
        }

        case 'uuid': {
            const count = Math.min(Math.max(Number(args[0]) || 1, 1), 10)
            const rows = Array.from({ length: count }, (_, i) =>
                `${i + 1}. ${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${randomString(12, 'abcdef0123456789')}`}`
            )
            return notifReply(rows.join('\n'), `UUID (${count})`)
        }

        case 'password':
        case 'passgen': {
            const length = Math.min(Math.max(Number(args[0]) || 16, 6), 128)
            let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            if (args.includes('--sym') || args.includes('symbol')) charset += '!@#$%^&*()-_=+[]{};:,.?'
            if (args.includes('--nosym') || args.includes('nosymbol')) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            const password = randomString(length, charset)
            return notifReply(
                `${password}\n\nPanjang: ${length} karakter\nCharset: ${charset.length} karakter${charset.includes('!') ? ' (dengan simbol)' : ' (tanpa simbol)'}`,
                'Password Generator'
            )
        }

        case 'randnum':
        case 'randnumber': {
            const min = Number(args[0]) || 1
            const max = Number(args[1]) || 100
            if (min > max) return notifReply('Nilai minimum tidak boleh lebih besar dari maksimum.', 'Random Number')
            return notifReply(`${randomNumber(Math.ceil(min), Math.floor(max))} (rentang ${min} - ${max})`, 'Random Number')
        }

        case 'randstr':
        case 'randtext': {
            const length = Math.min(Math.max(Number(args[0]) || 12, 1), 200)
            return notifReply(randomString(length, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 'Random String')
        }

        case 'lorem': {
            const paras = Math.min(Math.max(Number(args[0]) || 1, 1), 5)
            const words = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor '
                + 'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud').split(' ')
            const block = Array.from({ length: paras }, () =>
                Array.from({ length: 40 }, () => words[randomNumber(0, words.length - 1)]).join(' ')
            )
            return notifReply(block.join('\n\n'), 'Lorem Ipsum')
        }

        default:
            return
    }
}

handler.command = ['md5', 'sha1', 'sha256', 'sha512', 'hash', 'uuid', 'password', 'passgen',
    'randnum', 'randnumber', 'randstr', 'randtext', 'lorem']
handler.category = 'Tools'
handler.description = 'Hash, UUID, generator password, random'

export default handler
