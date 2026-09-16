import crypto from 'crypto'
import { SYMBOL } from '../../lib/ui.js'

const pick = (arr) => arr[crypto.randomInt ? crypto.randomInt(arr.length) : Math.floor(Math.random() * arr.length)]
const rand = (min, max) => min + (crypto.randomInt ? crypto.randomInt(max - min + 1) : Math.floor(Math.random() * (max - min + 1)))
const percent = () => Number((Math.random() * 100).toFixed(1))

const DATA = {
    truth: [
        'Apa hal paling memalukan yang pernah kamu lakukan di depan umum?',
        'Siapa orang terakhir yang kamu stalking di media sosial?',
        'Apa kebohongan terakhir yang kamu ucapkan?',
        'Sebutkan satu hal yang kamu sembunyikan dari orang tua.',
        'Apa hal yang paling kamu sesali tahun ini?'
    ],
    dare: [
        'Kirim pesan "aku kangen" ke kontak terakhir di chat-mu.',
        'Ubah namamu di grup ini jadi nama hewan selama 10 menit.',
        'Rekam voice note menyanyi selama 15 detik.',
        'Kirim emoji acak sebanyak 10 kali di chat ini.',
        'Tulis status WhatsApp dengan huruf kapital semua selama 1 jam.'
    ],
    roast: [
        'Kamu bukan susah ditebak, cuma susah dipahami — beda tipis sih.',
        'Kamu itu seperti WiFi lemot: ada, tapi bikin kesal.',
        'Kalau kepintaran itu pacaran, kamu masih jomblo.',
        'Jangan sedih, semua orang juga pernah jadi versi beta dari dirinya.',
        'Kamu punya banyak rencana hebat. Sayangnya semuanya masih di kepala.'
    ],
    compliment: [
        'Kamu orangnya tulus — jarang lho ada yang kayak kamu.',
        'Cara kamu bikin orang nyaman itu bakat, bukan kebetulan.',
        'Kamu lebih kuat dari yang kamu kira.',
        'Ide-idemu segar, teruskan.',
        'Terima kasih sudah ada — grup ini lebih hidup karenamu.'
    ],
    pickup: [
        'Aku bukan fotografer, tapi aku suka lihat senyummu.',
        'Kamu itu seperti sinyal 5G — aku mau connect terus.',
        'Kalau kamu jadi error, aku rela jadi stack trace-nya.',
        'Kamu bukan bug, kamu fitur favoritku.'
    ],
    fact: [
        'Madu tidak pernah basi — madu berumur 3000 tahun masih bisa dimakan.',
        'Gurita punya tiga jantung dan darah berwarna biru.',
        'Satu hari di Venus lebih lama daripada satu tahun di Venus.',
        'Komputer pertama di dunia beratnya sekitar 27 ton.',
        'Bumi itu tidak bulat sempurna — bentuknya oblate spheroid.',
        'Ada lebih banyak kemungkinan posisi catur daripada atom di alam semesta yang terlihat.'
    ],
    joke: [
        'Kenapa programmer suka gelap? Karena light attracts bugs.',
        'Aku bilang ke WiFi: kamu lemot. Dia jawab: kamu juga lambat paham.',
        'Kenapa bot tidak pernah pusing? Karena semua masalahnya di-input.',
        'Kata dokter, saya kurang tidur. Saya bilang: saya tidur kok, cuma sambil kerja.',
        'Ada 10 jenis orang: yang paham biner dan yang tidak.'
    ],
    motivasi: [
        'Mulai saja dulu, sempurna itu urusan nanti.',
        'Konsisten 1% tiap hari mengalahkan usaha besar yang sekali setahun.',
        'Kegagalan itu data, bukan hukuman.',
        'Kalau capek, istirahat — bukan berhenti.',
        'Kamu tidak harus jadi hebat untuk mulai, tapi harus mulai untuk jadi hebat.'
    ],
    quote: [
        'Orang yang berhenti belajar akan jadi tua, entah di umur 20 atau 80. — Henry Ford',
        'Keberhasilan adalah kumpulan usaha kecil yang diulang hari demi hari. — Robert Collier',
        'Disiplin adalah jembatan antara cita-cita dan pencapaian. — Jim Rohn',
        'Yang penting bukan seberapa lambat, tapi jangan berhenti. — Confucius'
    ],
    eightball: [
        'Ya, pasti.',
        'Sudah jelas begitu.',
        'Sebagian besar iya.',
        'Coba lagi nanti.',
        'Belum bisa dipastikan.',
        'Jangan diandalkan.',
        'Menurutku tidak.',
        'Sangat tidak mungkin.'
    ]
}

const ZODIAC = [
    { name: 'Capricorn', from: 1222, to: 119 }, { name: 'Aquarius', from: 120, to: 218 },
    { name: 'Pisces', from: 219, to: 320 }, { name: 'Aries', from: 321, to: 419 },
    { name: 'Taurus', from: 420, to: 520 }, { name: 'Gemini', from: 521, to: 620 },
    { name: 'Cancer', from: 621, to: 722 }, { name: 'Leo', from: 723, to: 822 },
    { name: 'Virgo', from: 823, to: 922 }, { name: 'Libra', from: 923, to: 1022 },
    { name: 'Scorpio', from: 1023, to: 1121 }, { name: 'Sagittarius', from: 1122, to: 1221 }
]
const SHIO = ['Tikus', 'Kerbau', 'Macan', 'Kelinci', 'Naga', 'Ular', 'Kuda', 'Kambing', 'Monyet', 'Ayam', 'Anjing', 'Babi']

let handler = async (m, { conn, args, command, text, notifReply }) => {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    const targetName = `@${String(target).split('@')[0]}`

    switch (command) {
        case 'dice':
        case 'dadu': {
            const sides = Math.min(Math.max(Number(args[0]) || 6, 2), 1000)
            return notifReply(`🎲 Dadu ${sides} sisi: *${rand(1, sides)}*`, 'Dadu')
        }

        case 'coin':
        case 'koin': {
            const result = rand(0, 1) ? '👑 Angka (Head)' : '🪙 Gambar (Tail)'
            return notifReply(`Koin dilempar...\n\n*${result}*`, 'Koin')
        }

        case 'slot': {
            const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣', '⭐']
            const roll = [pick(symbols), pick(symbols), pick(symbols)]
            const jackpot = roll[0] === roll[1] && roll[1] === roll[2]
            const pair = !jackpot && (roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2])
            const verdict = jackpot ? '🎉 JACKPOT!' : pair ? '✨ Hampir menang!' : '😅 Belum beruntung'
            return notifReply(`${roll.join(' │ ')}\n\n*${verdict}*`, 'Slot Machine')
        }

        case 'rps': {
            const choices = { batu: '🪨', gunting: '✂️', kertas: '📄' }
            const player = (args[0] || '').toLowerCase()
            if (!choices[player]) {
                return notifReply('Pilih salah satu:\n.rps batu\n.rps gunting\n.rps kertas', 'Batu Gunting Kertas')
            }
            const bot = pick(Object.keys(choices))
            let verdict
            if (player === bot) verdict = '🤝 Seri!'
            else if (
                (player === 'batu' && bot === 'gunting') ||
                (player === 'gunting' && bot === 'kertas') ||
                (player === 'kertas' && bot === 'batu')
            ) verdict = '🎉 Kamu menang!'
            else verdict = '🤖 Bot menang!'

            return notifReply([
                `Kamu : ${choices[player]} ${player}`,
                `Bot  : ${choices[bot]} ${bot}`,
                '',
                verdict
            ].join('\n'), 'Batu Gunting Kertas')
        }

        case '8ball':
        case 'tanya': {
            if (!text) return notifReply('Format:\n.8ball <pertanyaan>\n\nContoh:\n.8ball besok hujan?', 'Magic 8 Ball')
            return notifReply(`❓ ${text}\n\n🎱 *${pick(DATA.eightball)}*`, 'Magic 8 Ball')
        }

        case 'truth':
            return notifReply(`🎯 *TRUTH*\n\n${pick(DATA.truth)}`, 'Truth')

        case 'dare':
            return notifReply(`🔥 *DARE*\n\n${pick(DATA.dare)}`, 'Dare')

        case 'roast':
            return notifReply(`🔥 ${targetName}\n\n${pick(DATA.roast)}`, 'Roast')

        case 'compliment':
        case 'pujian':
            return notifReply(`💐 ${targetName}\n\n${pick(DATA.compliment)}`, 'Pujian')

        case 'pickup':
            return notifReply(`😎 ${targetName}\n\n${pick(DATA.pickup)}`, 'Pickup Line')

        case 'rate': {
            const subject = text || targetName
            const score = percent()
            const bar = '█'.repeat(Math.round(score / 10)).padEnd(10, '░')
            return notifReply(`${subject}\n\n${bar} *${score}%*`, 'Penilaian')
        }

        case 'ship': {
            const mentioned = m.mentionedJid || []
            const partner = mentioned[0] || m.quoted?.sender
            if (!partner || partner === m.sender) {
                return notifReply('Tag atau balas pesan orang lain.\n\nContoh:\n.ship @nama', 'Ship')
            }
            const score = percent()
            const verdict = score > 80 ? '💞 Sangat cocok!' : score > 60 ? '💖 Cocok!' : score > 40 ? '🤔 Bisa dicoba' : '💔 Sepertinya tidak'
            return notifReply([
                `@${String(m.sender).split('@')[0]} ❤️ @${String(partner).split('@')[0]}`,
                '',
                `${score}% — ${verdict}`
            ].join('\n'), 'Ship Meter')
        }

        case 'fact':
        case 'fakta':
            return notifReply(pick(DATA.fact), 'Fakta Unik')

        case 'joke':
        case 'lelucon':
            return notifReply(pick(DATA.joke), 'Lelucon')

        case 'motivasi':
            return notifReply(pick(DATA.motivasi), 'Motivasi')

        case 'quote':
        case 'kutipan':
            return notifReply(pick(DATA.quote), 'Kutipan')

        case 'zodiac':
        case 'zodiak': {
            const raw = (text || '').replace(/[^0-9]/g, '')
            const day = Number(args[1] ?? raw.slice(0, 2))
            const month = Number(args[2] ?? raw.slice(2, 4))
            if (!Number.isInteger(day) || !Number.isInteger(month) || day < 1 || day > 31 || month < 1 || month > 12) {
                return notifReply('Format:\n.zodiac <tanggal> <bulan>\n\nContoh:\n.zodiac 17 8', 'Zodiak')
            }
            const key = month * 100 + day
            const found = ZODIAC.find(z =>
                z.from > z.to ? key >= z.from || key <= z.to : key >= z.from && key <= z.to
            )
            return notifReply(`${day}/${month} → *${found ? found.name : 'tidak diketahui'}*`, 'Zodiak')
        }

        case 'shio': {
            const year = Number(text)
            if (!Number.isInteger(year) || year < 1900 || year > 2100) {
                return notifReply('Format:\n.shio <tahun>\n\nContoh:\n.shio 1998', 'Shio')
            }
            return notifReply(`${year} → Shio *${SHIO[(year - 4) % 12]}*`, 'Shio')
        }

        case 'randommember': {
            if (!m.isGroup) return notifReply('Perintah ini hanya untuk grup.', 'Acak Anggota')
            const meta = await conn.groupMetadata(m.chat).catch(() => null)
            if (!meta?.participants?.length) return notifReply('Gagal mengambil anggota grup.', 'Acak Anggota')
            const chosen = pick(meta.participants).id
            return notifReply(`🎯 Yang terpilih: @${String(chosen).split('@')[0]}`, 'Acak Anggota')
        }

        default:
            return
    }
}

handler.command = ['dice', 'dadu', 'coin', 'koin', 'slot', 'rps', '8ball', 'tanya', 'truth', 'dare',
    'roast', 'compliment', 'pujian', 'pickup', 'rate', 'ship', 'fact', 'fakta', 'joke', 'lelucon',
    'motivasi', 'quote', 'kutipan', 'zodiac', 'zodiak', 'shio', 'randommember']
handler.category = 'Fun'
handler.description = 'Hiburan, random, truth/dare, zodiak'

export default handler
