import { card } from '../../lib/ui.js'

const needsArg = (text) => `Masukkan teks yang mau diolah.\n\nContoh:\n.upper halo dunia`

let handler = async (m, { args, command, text, notifReply }) => {
    const input = (text || '').trim() || (m.quoted?.text || '').trim()
    if (!input) return notifReply(needsArg(text), 'Butuh Teks')

    switch (command) {
        case 'upper':
            return notifReply(input.toUpperCase(), 'UPPERCASE')

        case 'lower':
            return notifReply(input.toLowerCase(), 'lowercase')

        case 'capitalize':
            return notifReply(input.charAt(0).toUpperCase() + input.slice(1).toLowerCase(), 'Capitalize')

        case 'title':
            return notifReply(
                input.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()),
                'Title Case'
            )

        case 'swapcase':
            return notifReply(
                [...input].map(ch => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase())).join(''),
                'sWAPcASE'
            )

        case 'reverse':
            return notifReply([...input].reverse().join(''), 'Teks Dibalik')

        case 'revwords':
            return notifReply(input.split(/\s+/).reverse().join(' '), 'Urutan Kata Dibalik')

        case 'repeat': {
            const count = Number(args[0])
            if (!Number.isInteger(count) || count < 1) {
                return notifReply('Format:\n.repeat <jumlah> <teks>\n\nContoh:\n.repeat 3 halo', 'Repeat')
            }
            const body = args.slice(1).join(' ') || m.quoted?.text || ''
            if (!body) return notifReply(needsArg(text), 'Butuh Teks')
            const total = Math.min(count, 50)
            return notifReply(
                Array.from({ length: total }, (_, i) => `${i + 1}. ${body}`).join('\n'),
                `Repeat x${total}`
            )
        }

        case 'count':
        case 'charcount': {
            const words = input.split(/\s+/).filter(Boolean).length
            const chars = [...input].length
            const noSpace = [...input.replace(/\s/g, '')].length
            return notifReply([
                `Karakter        : ${chars}`,
                `Tanpa spasi     : ${noSpace}`,
                `Kata            : ${words}`,
                `Baris           : ${input.split('\n').length}`,
                `Huruf vokal     : ${(input.match(/[aiueoAIUEO]/g) || []).length}`,
                `Huruf konsonan  : ${(input.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length}`,
                `Angka           : ${(input.match(/[0-9]/g) || []).length}`
            ].join('\n'), 'Statistik Teks')
        }

        default:
            return
    }
}

handler.command = ['upper', 'lower', 'capitalize', 'title', 'swapcase', 'reverse', 'revwords',
    'repeat', 'count', 'charcount']
handler.category = 'Tools'
handler.description = 'Mengubah dan menghitung teks'

export default handler
