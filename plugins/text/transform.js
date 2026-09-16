const toWords = (text) => text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

let handler = async (m, { args, command, text, notifReply }) => {
    const input = (text || '').trim() || (m.quoted?.text || '').trim()
    if (!input) return notifReply('Masukkan teks yang mau diproses.', 'Butuh Teks')

    switch (command) {
        case 'slug':
        case 'slugify':
            return notifReply(
                input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                'Slug'
            )

        case 'camel':
            return notifReply(
                toWords(input)
                    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
                    .join('') || '-',
                'camelCase'
            )

        case 'pascal':
            return notifReply(
                toWords(input).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') || '-',
                'PascalCase'
            )

        case 'snake':
            return notifReply(toWords(input).map(w => w.toLowerCase()).join('_') || '-', 'snake_case')

        case 'kebab':
            return notifReply(toWords(input).map(w => w.toLowerCase()).join('-') || '-', 'kebab-case')

        case 'trim':
            return notifReply(
                input.split('\n').map(l => l.trim()).filter(Boolean).join('\n') || '(kosong)',
                'Trim'
            )

        case 'jsonpretty': {
            try {
                return notifReply(JSON.stringify(JSON.parse(input), null, 2), 'JSON Pretty')
            } catch (e) {
                return notifReply(`JSON tidak valid.\n${e.message}`, 'JSON Pretty')
            }
        }

        case 'jsonmin': {
            try {
                return notifReply(JSON.stringify(JSON.parse(input)), 'JSON Minify')
            } catch (e) {
                return notifReply(`JSON tidak valid.\n${e.message}`, 'JSON Minify')
            }
        }

        case 'sortlines': {
            const mode = (args[0] || '').toLowerCase()
            const lines = input.split('\n').map(l => l.trim()).filter(Boolean)
            if (mode === 'desc' || mode === 'z-a') lines.sort((a, b) => b.localeCompare(a))
            else lines.sort((a, b) => a.localeCompare(b))
            return notifReply(lines.join('\n'), `Urut ${mode === 'desc' || mode === 'z-a' ? 'Z-A' : 'A-Z'}`)
        }

        case 'uniq':
        case 'dedup': {
            const seen = new Set()
            const out = []
            for (const line of input.split('\n')) {
                const key = line.trim()
                if (!key || seen.has(key)) continue
                seen.add(key)
                out.push(key)
            }
            return notifReply(out.join('\n') || '(kosong)', 'Hapus Duplikat')
        }

        case 'lines': {
            const lines = input.split('\n')
            return notifReply(
                lines.map((l, i) => `${String(i + 1).padStart(3)}│ ${l}`).join('\n'),
                `Nomor Baris (${lines.length})`
            )
        }

        case 'replace': {
            const [find, ...rest] = args
            const replacement = rest.join(' ')
            if (!find || replacement === undefined) {
                return notifReply('Format:\n.replace <dicari> <pengganti> <teks>\n\nAtau reply pesan:\n.replace dicari pengganti', 'Replace')
            }
            return notifReply(input.split(find).join(replacement), 'Replace')
        }

        case 'split': {
            const separator = args[0] || ','
            return notifReply(
                input.split(separator).map((p, i) => `${i + 1}. ${p.trim()}`).join('\n') || '(kosong)',
                `Split "${separator}"`
            )
        }

        default:
            return
    }
}

handler.command = ['slug', 'slugify', 'camel', 'pascal', 'snake', 'kebab', 'trim',
    'jsonpretty', 'jsonmin', 'sortlines', 'uniq', 'dedup', 'lines', 'replace', 'split']
handler.category = 'Tools'
handler.description = 'Transformasi teks & format data'

export default handler
