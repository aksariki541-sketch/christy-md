import { formatBytes } from '../../lib/media.js'

const UNITS = {
    ctof: { label: 'Celsius → Fahrenheit', fn: (v) => (v * 9) / 5 + 32, unit: '°F' },
    ftoc: { label: 'Fahrenheit → Celsius', fn: (v) => ((v - 32) * 5) / 9, unit: '°C' },
    kmmi: { label: 'Kilometer → Mil', fn: (v) => v * 0.621371, unit: 'mi' },
    mikm: { label: 'Mil → Kilometer', fn: (v) => v / 0.621371, unit: 'km' },
    kglb: { label: 'Kilogram → Pound', fn: (v) => v * 2.20462, unit: 'lb' },
    lbkg: { label: 'Pound → Kilogram', fn: (v) => v / 2.20462, unit: 'kg' },
    cmtoin: { label: 'Centimeter → Inci', fn: (v) => v / 2.54, unit: 'in' },
    intocm: { label: 'Inci → Centimeter', fn: (v) => v * 2.54, unit: 'cm' },
    mtokm: { label: 'Meter → Kilometer', fn: (v) => v / 1000, unit: 'km' },
    kmtom: { label: 'Kilometer → Meter', fn: (v) => v * 1000, unit: 'm' },
    ltoml: { label: 'Liter → Mililiter', fn: (v) => v * 1000, unit: 'ml' },
    mltol: { label: 'Mililiter → Liter', fn: (v) => v / 1000, unit: 'L' },
    mstokmh: { label: 'Meter/detik → Km/jam', fn: (v) => v * 3.6, unit: 'km/jam' },
    kmhtoms: { label: 'Km/jam → Meter/detik', fn: (v) => v / 3.6, unit: 'm/s' },
    gbmb: { label: 'Gigabyte → Megabyte', fn: (v) => v * 1024, unit: 'MB' },
    mbgb: { label: 'Megabyte → Gigabyte', fn: (v) => v / 1024, unit: 'GB' }
}

const parseNumber = (text) => {
    const value = Number(String(text).replace(/,/g, '').trim())
    return Number.isFinite(value) ? value : null
}

let handler = async (m, { command, text, notifReply }) => {
    const value = parseNumber(text)

    if (command === 'bytes' || command === 'size') {
        if (value === null) return notifReply('Format:\n.bytes <jumlah byte>\n\nContoh:\n.bytes 1048576', 'Konversi Ukuran')
        return notifReply([
            `${value} byte =`,
            `• ${formatBytes(value)}`,
            `• ${(value / 1024).toFixed(2)} KB`,
            `• ${(value / 1024 / 1024).toFixed(4)} MB`
        ].join('\n'), 'Konversi Ukuran')
    }

    if (command === 'kalkonversi' || command === 'convertlist') {
        const list = Object.entries(UNITS).map(([cmd, cfg]) => `• .${cmd} — ${cfg.label}`)
        return notifReply(['Daftar konversi satuan:', '', ...list].join('\n'), 'Daftar Konversi')
    }

    const cfg = UNITS[command]
    if (!cfg) return

    if (value === null) {
        return notifReply(`Format:\n.${command} <angka>\n\nContoh:\n.${command} 100`, cfg.label)
    }

    const result = cfg.fn(value)
    return notifReply(`${value} → *${result.toFixed(4).replace(/\.?0+$/, '')} ${cfg.unit}*\n\n${cfg.label}`, cfg.label)
}

handler.command = ['ctof', 'ftoc', 'kmmi', 'mikm', 'kglb', 'lbkg', 'cmtoin', 'intocm',
    'mtokm', 'kmtom', 'ltoml', 'mltol', 'mstokmh', 'kmhtoms', 'gbmb', 'mbgb',
    'bytes', 'size', 'kalkonversi', 'convertlist']
handler.category = 'Tools'
handler.description = 'Konversi satuan (suhu, jarak, berat, data)'

export default handler
