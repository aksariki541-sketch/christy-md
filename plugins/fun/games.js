import { read, write, userKey } from '../../lib/store.js'

const FILE = 'games'

function loadState(m) {
    return read(FILE, {})[userKey(m, 'game')] || null
}

function saveState(m, state) {
    const all = read(FILE, {})
    all[userKey(m, 'game')] = state
    write(FILE, all)
}

function clearState(m) {
    const all = read(FILE, {})
    delete all[userKey(m, 'game')]
    write(FILE, all)
}

let handler = async (m, { args, command, text, notifReply }) => {
    switch (command) {
        case 'tebakangka':
        case 'guess': {
            const existing = loadState(m)
            if (existing && !existing.done) {
                return notifReply(
                    `Masih ada permainan berjalan (angka 1-100).\nTebak: .guess <angka> (atau .tebak <angka>)\nMenyerah: .nyerah\n\nSudah ditebak: ${existing.tries}`,
                    'Tebak Angka'
                )
            }
            const max = Math.min(Math.max(Number(args[0]) || 100, 10), 10000)
            const secret = 1 + Math.floor(Math.random() * max)
            saveState(m, { secret, max, tries: 0, done: false, startedAt: Date.now() })
            return notifReply(
                `🎯 Aku menyimpan angka rahasia antara *1 sampai ${max}*.\n\nTebak dengan:\n.guess <angka>`,
                'Tebak Angka'
            )
        }

        case 'guess':
        case 'tebak': {
            const state = loadState(m)
            if (!state || state.done) {
                return notifReply('Belum ada permainan. Mulai dengan:\n.tebakangka', 'Tebak Angka')
            }
            const value = Number(args[0])
            if (!Number.isInteger(value) || value < 1 || value > state.max) {
                return notifReply(`Masukkan angka antara 1 sampai ${state.max}.`, 'Tebak Angka')
            }
            state.tries++

            if (value === state.secret) {
                const tries = state.tries
                state.done = true
                saveState(m, state)
                const bonus = tries <= 3 ? 'Luar biasa! 🔥' : tries <= 7 ? 'Bagus! 👏' : 'Akhirnya ketemu juga 😄'
                return notifReply(`${bonus}\n\nAngkanya memang *${state.secret}*.\nKamu menebak ${tries} kali.`, 'Benar!')
            }

            saveState(m, state)
            const hint = value < state.secret ? 'terlalu *kecil* ⬆️' : 'terlalu *besar* ⬇️'
            return notifReply(`Tebakan ${value} — ${hint}\n\nPercobaan ke-${state.tries}`, 'Tebak Angka')
        }

        case 'nyerah':
        case 'giveup': {
            const state = loadState(m)
            if (!state || state.done) return notifReply('Tidak ada permainan yang berjalan.', 'Tebak Angka')
            const answer = state.secret
            const tries = state.tries
            clearState(m)
            return notifReply(`Angka rahasianya adalah *${answer}*.\nKamu sudah menebak ${tries} kali. Coba lagi dengan .tebakangka`, 'Menyerah')
        }

        case 'gamescore':
        case 'skor': {
            const state = loadState(m)
            if (!state) return notifReply('Belum ada catatan permainan di chat ini.', 'Skor Game')
            return notifReply([
                `Status   : ${state.done ? 'selesai' : 'berjalan'}`,
                `Maksimal : 1-${state.max}`,
                `Percobaan: ${state.tries}`,
                `Dimulai  : ${new Date(state.startedAt).toLocaleString('id-ID')}`
            ].join('\n'), 'Skor Game')
        }

        default:
            return
    }
}

handler.command = ['tebakangka', 'guess', 'tebak', 'nyerah', 'giveup', 'gamescore', 'skor']
handler.category = 'Fun'
handler.description = 'Game tebak angka'

export default handler
