import moment from 'moment-timezone'
import { tanggal } from '../../lib/myfunc.js'

const ZONES = {
    wib: 'Asia/Jakarta',
    wita: 'Asia/Makassar',
    wit: 'Asia/Jayapura',
    jakarta: 'Asia/Jakarta',
    makassar: 'Asia/Makassar',
    jayapura: 'Asia/Jayapura',
    singapore: 'Asia/Singapore',
    tokyo: 'Asia/Tokyo',
    dubai: 'Asia/Dubai',
    london: 'Europe/London',
    paris: 'Europe/Paris',
    newyork: 'America/New_York',
    losangeles: 'America/Los_Angeles',
    sydney: 'Australia/Sydney',
    utc: 'UTC'
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
    'Agustus', 'September', 'Oktober', 'November', 'Desember']

const toDate = (text) => {
    const value = String(text || '').trim()
    if (!value) return null
    const formats = ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'DD MM YYYY']
    const parsed = moment(value, formats, true)
    return parsed.isValid() ? parsed : null
}

let handler = async (m, { args, command, text, notifReply }) => {
    const zone = ZONES[(args[0] || '').toLowerCase()] || 'Asia/Jakarta'
    const now = moment().tz(zone)

    switch (command) {
        case 'time':
        case 'jam': {
            const lines = Object.entries({
                Jakarta: 'Asia/Jakarta', Makassar: 'Asia/Makassar', Jayapura: 'Asia/Jayapura',
                Singapore: 'Asia/Singapore', Tokyo: 'Asia/Tokyo', Dubai: 'Asia/Dubai',
                London: 'Europe/London', 'New York': 'America/New_York', Sydney: 'Australia/Sydney', UTC: 'UTC'
            }).map(([label, tz]) => `${label.padEnd(10)}: ${moment().tz(tz).format('HH:mm:ss')} (${moment().tz(tz).format('ddd, DD MMM')})`)

            return notifReply(lines.join('\n'), 'Waktu Dunia')
        }

        case 'date':
        case 'tanggal': {
            return notifReply([
                `${HARI[now.day()]}, ${now.date()} ${BULAN[now.month()]} ${now.year()}`,
                '',
                `Zona     : ${zone}`,
                `ISO      : ${now.format('YYYY-MM-DD')}`,
                `Minggu ke: ${now.week()}`,
                `Hari ke  : ${now.dayOfYear()} dari tahun`,
                `Format ID: ${tanggal(Date.now())}`
            ].join('\n'), 'Tanggal')
        }

        case 'calendar':
        case 'kalender': {
            const month = args[1] ? Number(args[1]) - 1 : now.month()
            const year = args[2] ? Number(args[2]) : now.year()
            const base = moment().tz(zone).year(year).month(month).date(1)
            const days = base.daysInMonth()
            const startPad = base.day()

            const header = ['Min Sen Sel Rab Kam Jum Sab']
            const cells = []
            for (let i = 0; i < startPad; i++) cells.push('   ')
            for (let d = 1; d <= days; d++) cells.push(String(d).padStart(3, ' '))

            const weeks = []
            for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7).join(' '))

            return notifReply([
                `${BULAN[base.month()]} ${base.year()}`.padStart(20, ' '),
                '',
                ...header,
                ...weeks,
                '',
                `Hari ini: ${now.date()} ${BULAN[now.month()]} ${now.year()}`
            ].join('\n'), 'Kalender')
        }

        case 'timestamp':
        case 'unix': {
            const input = (text || '').trim()
            if (!input) {
                const ts = Math.floor(Date.now() / 1000)
                return notifReply([
                    `Unix sekarang : ${ts}`,
                    `Milidetik     : ${Date.now()}`,
                    `ISO           : ${new Date().toISOString()}`,
                    '',
                    `Balik dari unix: .timestamp 1700000000`
                ].join('\n'), 'Timestamp')
            }
            const value = Number(input)
            if (!Number.isFinite(value)) return notifReply('Masukkan angka unix timestamp.', 'Timestamp')
            const ms = input.length > 10 ? value : value * 1000
            const date = moment(ms).tz(zone)
            return notifReply([
                `Unix   : ${value}`,
                `Waktu  : ${date.format('dddd, DD MMMM YYYY HH:mm:ss')}`,
                `Zona   : ${zone}`,
                `ISO    : ${date.toISOString()}`
            ].join('\n'), 'Timestamp')
        }

        case 'age':
        case 'umur': {
            const birth = toDate(text)
            if (!birth) {
                return notifReply('Format:\n.age <tanggal lahir>\n\nContoh:\n.age 2000-08-17\n.age 17-08-2000', 'Hitung Umur')
            }
            const diff = moment().diff(birth, 'years', true)
            const duration = moment.duration(moment().diff(birth))
            return notifReply([
                `Lahir    : ${birth.format('DD MMMM YYYY')}`,
                `Umur     : ${Math.floor(diff)} tahun`,
                `Detail   : ${duration.years()} tahun, ${duration.months()} bulan, ${duration.days()} hari`,
                `Total hari: ${moment().diff(birth, 'days').toLocaleString('id-ID')} hari`
            ].join('\n'), 'Hitung Umur')
        }

        case 'diffdate':
        case 'selisih': {
            const [first, second] = String(text || '').split(/\s*\|\s*|\s+ke\s+/i)
            const from = toDate(first)
            const to = toDate(second) || moment()
            if (!from) {
                return notifReply('Format:\n.diffdate <tanggal1> | <tanggal2>\n\nContoh:\n.diffdate 2026-01-01 | 2026-12-31', 'Selisih Tanggal')
            }
            const days = to.diff(from, 'days')
            return notifReply([
                `Dari    : ${from.format('DD MMM YYYY')}`,
                `Ke      : ${to.format('DD MMM YYYY')}`,
                `Selisih : ${Math.abs(days)} hari`,
                `        = ${Math.abs(days / 7).toFixed(1)} minggu`,
                `        = ${Math.abs(days / 30.44).toFixed(1)} bulan`,
                `        = ${(Math.abs(days) / 365.25).toFixed(2)} tahun`
            ].join('\n'), 'Selisih Tanggal')
        }

        case 'countdown':
        case 'hitungmundur': {
            const target = toDate(text)
            if (!target) {
                return notifReply('Format:\n.countdown <tanggal target>\n\nContoh:\n.countdown 2027-01-01', 'Countdown')
            }
            const diff = target.diff(moment().tz(zone))
            if (diff <= 0) return notifReply(`${target.format('DD MMMM YYYY')} sudah terlewat.`, 'Countdown')
            const duration = moment.duration(diff)
            return notifReply([
                `Menuju : ${target.format('DD MMMM YYYY')}`,
                `Sisa   : ${duration.days()} hari ${duration.hours()} jam ${duration.minutes()} menit`,
                `Total  : ${Math.floor(diff / 86400000)} hari lagi`
            ].join('\n'), 'Countdown')
        }

        case 'week':
        case 'minggu': {
            return notifReply([
                `Sekarang   : ${now.format('dddd, DD MMMM YYYY')}`,
                `Minggu ke  : ${now.week()} (ISO)`,
                `Hari ke    : ${now.dayOfYear()} / ${now.isLeapYear() ? 366 : 365}`,
                `Kuartal    : Q${now.quarter()}`,
                `Sisa hari  : ${(now.isLeapYear() ? 366 : 365) - now.dayOfYear()} hari lagi ke tahun baru`
            ].join('\n'), 'Info Minggu')
        }

        default:
            return
    }
}

handler.command = ['time', 'jam', 'date', 'tanggal', 'calendar', 'kalender', 'timestamp', 'unix',
    'age', 'umur', 'diffdate', 'selisih', 'countdown', 'hitungmundur', 'week', 'minggu']
handler.category = 'Tools'
handler.description = 'Waktu, tanggal, kalender, dan hitungan hari'

export default handler
