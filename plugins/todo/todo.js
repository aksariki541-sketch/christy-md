import { read, write, userKey } from '../../lib/store.js'
import { SYMBOL } from '../../lib/ui.js'

const FILE = 'todo'
const MAX_ITEMS = 100

const scope = (m) => (m.isGroup ? m.chat : 'private')
const listOf = (m) => read(FILE, {})[userKey(m, scope(m))] || []

function save(m, items) {
    const all = read(FILE, {})
    all[userKey(m, scope(m))] = items.slice(0, MAX_ITEMS)
    write(FILE, all)
}

const format = (items) => {
    const pending = items.filter(i => !i.done)
    const done = items.filter(i => i.done)
    const rows = [
        ...pending.map((item, i) => `${String(i + 1).padStart(2)}. ☐ ${item.text}`),
        ...done.map(item => `   ☑ ~${item.text}~`)
    ]
    return {
        text: rows.join('\n') || 'Daftar masih kosong.',
        pending: pending.length,
        done: done.length
    }
}

let handler = async (m, { args, command, text, notifReply }) => {
    const items = listOf(m)

    switch (command) {
        case 'todo':
        case 'addtodo': {
            const body = (text || '').trim()
            if (!body) {
                return notifReply('Format:\n.todo <kegiatan>\n\nLihat daftar: .todolist', 'Tambah Todo')
            }
            if (items.length >= MAX_ITEMS) return notifReply(`Daftar penuh (${MAX_ITEMS} item). Selesaikan atau hapus dulu.`, 'Daftar Penuh')
            items.push({ text: body.slice(0, 300), done: false, at: Date.now() })
            save(m, items)
            return notifReply(`Ditambahkan: *${body.slice(0, 300)}*\n\nSisa tugas: ${items.filter(i => !i.done).length}`, 'Tambah Todo')
        }

        case 'todolist':
        case 'mytodo': {
            const { text: body, pending, done } = format(items)
            return notifReply([
                `Lingkup : ${m.isGroup ? 'grup ini' : 'chat pribadi'}`,
                `Selesai : ${done} · Belum: ${pending}`,
                '',
                body
            ].join('\n'), 'Daftar Todo')
        }

        case 'tododone':
        case 'done': {
            const index = Number(args[0])
            const pending = items.filter(i => !i.done)
            if (!Number.isInteger(index) || index < 1 || index > pending.length) {
                return notifReply(`Format:\n.tododone <nomor>\n\nNomor mengacu ke daftar di .todolist (1-${pending.length || 0})`, 'Selesaikan Todo')
            }
            const target = pending[index - 1]
            const ref = items.find(i => i === target)
            if (ref) ref.done = true
            save(m, items)
            return notifReply(`☑ Selesai: *${target.text}*`, 'Todo Selesai')
        }

        case 'tododel':
        case 'deltodo': {
            const index = Number(args[0])
            const pending = items.filter(i => !i.done)
            if (!Number.isInteger(index) || index < 1 || index > pending.length) {
                return notifReply(`Format:\n.tododel <nomor>`, 'Hapus Todo')
            }
            const target = pending[index - 1]
            const position = items.indexOf(target)
            if (position >= 0) items.splice(position, 1)
            save(m, items)
            return notifReply(`Dihapus: *${target.text}*`, 'Hapus Todo')
        }

        case 'todoclear':
        case 'cleartodo': {
            const mode = (args[0] || '').toLowerCase()
            if (mode === 'all' || mode === 'semua') {
                save(m, [])
                return notifReply('Semua item todo dihapus.', 'Bersihkan Todo')
            }
            const remaining = items.filter(i => !i.done)
            const removed = items.length - remaining.length
            save(m, remaining)
            return notifReply(`${removed} item selesai dibersihkan.\n\nTambahkan kata "all" untuk hapus semuanya.`, 'Bersihkan Todo')
        }

        case 'todostats': {
            const done = items.filter(i => i.done).length
            const total = items.length
            return notifReply([
                `Total item   : ${total}`,
                `Selesai      : ${done}`,
                `Belum selesai: ${total - done}`,
                `Progres      : ${total ? ((done / total) * 100).toFixed(1) : 0}%`
            ].join('\n'), 'Statistik Todo')
        }

        default:
            return
    }
}

handler.command = ['todo', 'addtodo', 'todolist', 'mytodo', 'tododone', 'done', 'tododel', 'deltodo',
    'todoclear', 'cleartodo', 'todostats']
handler.category = 'Tools'
handler.description = 'Checklist tugas sederhana'

export default handler
