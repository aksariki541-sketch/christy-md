import { read, write, userKey } from '../../lib/store.js'
import { SYMBOL } from '../../lib/ui.js'

const FILE = 'notes'
const MAX_NOTE = 2000
const MAX_SLOTS = 50

const scope = (m) => (m.isGroup ? m.chat : 'private')

function loadNotes(m) {
    return read(FILE, {})[userKey(m, scope(m))] || {}
}

function saveNotes(m, notes) {
    const all = read(FILE, {})
    all[userKey(m, scope(m))] = notes
    write(FILE, all)
}

let handler = async (m, { args, command, text, notifReply }) => {
    const notes = loadNotes(m)

    switch (command) {
        case 'note':
        case 'savenote':
        case 'addnote': {
            const [name, ...rest] = args
            if (!name) {
                return notifReply([
                    'Format:',
                    '.note <nama> <isi>',
                    '',
                    'Contoh:',
                    '.note wifi SSID: ChristyNet',
                    '',
                    `Slot terpakai: ${Object.keys(notes).length}/${MAX_SLOTS}`
                ].join('\n'), 'Simpan Catatan')
            }
            const body = rest.join(' ') || m.quoted?.text || ''
            if (!body) return notifReply('Isi catatannya belum diisi.', 'Simpan Catatan')
            if (Object.keys(notes).length >= MAX_SLOTS && !notes[name]) {
                return notifReply(`Slot catatan penuh (${MAX_SLOTS}). Hapus dulu dengan .delnote <nama>.`, 'Slot Penuh')
            }
            notes[name.toLowerCase()] = body.slice(0, MAX_NOTE)
            saveNotes(m, notes)
            return notifReply(`Catatan *${name}* disimpan (${body.length} karakter).`, 'Simpan Catatan')
        }

        case 'getnote':
        case 'lihatnote': {
            const name = (args[0] || '').toLowerCase()
            if (!name) {
                const list = Object.keys(notes)
                return notifReply(
                    list.length ? `Catatan tersimpan:\n${list.map(n => `${SYMBOL.bullet} ${n}`).join('\n')}\n\nBuka dengan: .getnote <nama>` : 'Belum ada catatan. Simpan dengan .note <nama> <isi>',
                    'Buka Catatan'
                )
            }
            const value = notes[name]
            if (!value) return notifReply(`Catatan *${name}* tidak ditemukan.`, 'Buka Catatan')
            return notifReply(value, `Catatan: ${name}`)
        }

        case 'delnote':
        case 'hapusnote': {
            const name = (args[0] || '').toLowerCase()
            if (!name) return notifReply('Format:\n.delnote <nama>\n\nLihat daftar dengan .listnote', 'Hapus Catatan')
            if (!notes[name]) return notifReply(`Catatan *${name}* tidak ada.`, 'Hapus Catatan')
            delete notes[name]
            saveNotes(m, notes)
            return notifReply(`Catatan *${name}* dihapus.`, 'Hapus Catatan')
        }

        case 'listnote':
        case 'notes': {
            const entries = Object.entries(notes)
            if (!entries.length) return notifReply('Belum ada catatan tersimpan.', 'Daftar Catatan')
            const rows = entries.map(([name, body], i) => `${i + 1}. *${name}*\n   ${body.slice(0, 60)}${body.length > 60 ? '...' : ''}`)
            return notifReply([
                `Lingkup: ${m.isGroup ? 'grup ini' : 'chat pribadi'}`,
                `Total: ${entries.length}/${MAX_SLOTS}`,
                '',
                ...rows
            ].join('\n'), 'Daftar Catatan')
        }

        case 'clearnote':
        case 'hapussemua': {
            const count = Object.keys(notes).length
            if (!count) return notifReply('Tidak ada catatan yang perlu dihapus.', 'Bersihkan Catatan')
            saveNotes(m, {})
            return notifReply(`${count} catatan dihapus.`, 'Bersihkan Catatan')
        }

        case 'searchnote': {
            const keyword = (text || '').toLowerCase()
            if (!keyword) return notifReply('Format:\n.searchnote <kata kunci>', 'Cari Catatan')
            const found = Object.entries(notes).filter(([name, body]) =>
                name.includes(keyword) || body.toLowerCase().includes(keyword)
            )
            if (!found.length) return notifReply(`Tidak ada catatan yang cocok dengan "${text}".`, 'Cari Catatan')
            return notifReply(
                found.map(([name, body]) => `*${name}*\n${body.slice(0, 120)}${body.length > 120 ? '...' : ''}`).join('\n\n'),
                `Hasil (${found.length})`
            )
        }

        default:
            return
    }
}

handler.command = ['note', 'savenote', 'addnote', 'getnote', 'lihatnote', 'delnote', 'hapusnote',
    'listnote', 'notes', 'clearnote', 'hapussemua', 'searchnote']
handler.category = 'Tools'
handler.description = 'Catatan sederhana per chat/grup'

export default handler
