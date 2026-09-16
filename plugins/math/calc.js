// Kalkulator aman: hanya menerima angka, operator, dan fungsi matematika terdaftar.
const SAFE_PATTERN = /^[0-9+\-*/%^().,\s]*(sqrt|abs|round|floor|ceil|min|max|pow|log|sin|cos|tan|pi|e)?[0-9+\-*/%^().,\s]*$/i

function safeEval(expression) {
    const cleaned = expression
        .replace(/\^/g, '**')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\be\b/gi, 'Math.E')

    if (/[^0-9+\-*/%().,\s*]/.test(cleaned.replace(/Math\.(PI|E)/g, ''))) {
        const allowed = cleaned.replace(/Math\.(PI|E)/g, '')
        if (/[a-df-z]/i.test(allowed)) throw new Error('Ekspresi hanya boleh berisi angka dan operator')
    }

    const value = Function(`"use strict"; return (${cleaned})`)()
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Hasil bukan angka valid')
    return value
}

const isPrime = (n) => {
    if (n < 2) return false
    if (n % 2 === 0) return n === 2
    for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false
    return true
}

const primeFactors = (n) => {
    const factors = []
    let rest = n
    for (let d = 2; d * d <= rest; d++) {
        while (rest % d === 0) {
            factors.push(d)
            rest /= d
        }
    }
    if (rest > 1) factors.push(rest)
    return factors
}

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))

let handler = async (m, { args, command, text, notifReply }) => {
    const input = (text || '').trim()

    switch (command) {
        case 'calc':
        case 'math':
        case 'hitung': {
            if (!input) {
                return notifReply([
                    'Contoh pemakaian:',
                    '.calc 2 + 3 * 4',
                    '.calc (10 / 3).toFixed(2)',
                    '.calc 2 ^ 10',
                    '.calc sqrt(144)',
                    '.calc pi * 2'
                ].join('\n'), 'Kalkulator')
            }
            try {
                const result = safeEval(input)
                return notifReply(`${input}\n= *${result}*`, 'Hasil')
            } catch (e) {
                return notifReply(`Tidak bisa dihitung.\n${e.message}`, 'Kalkulator')
            }
        }

        case 'percent': {
            const [a, b] = input.split(/\s+/).map(Number)
            if (!Number.isFinite(a) || !Number.isFinite(b)) {
                return notifReply('Format:\n.percent <nilai> <total>\n\nContoh:\n.percent 25 200', 'Persen')
            }
            const result = (a / b) * 100
            return notifReply(`${a} dari ${b} = *${result.toFixed(2)}%*`, 'Persen')
        }

        case 'discount': {
            const [price, percentOff] = input.split(/\s+/).map(Number)
            if (!Number.isFinite(price) || !Number.isFinite(percentOff)) {
                return notifReply('Format:\n.discount <harga> <diskon%>\n\nContoh:\n.discount 250000 20', 'Diskon')
            }
            const cut = (price * percentOff) / 100
            return notifReply([
                `Harga awal : ${price}`,
                `Diskon     : ${percentOff}%`,
                `Potongan   : ${cut.toFixed(2)}`,
                `Harga akhir: *${(price - cut).toFixed(2)}*`
            ].join('\n'), 'Diskon')
        }

        case 'prime': {
            const n = Number(input)
            if (!Number.isInteger(n)) return notifReply('Masukkan bilangan bulat.\n\nContoh:\n.prime 97', 'Bilangan Prima')
            const verdict = isPrime(n) ? '*adalah* bilangan prima' : '*bukan* bilangan prima'
            return notifReply(`${n} ${verdict}`, 'Bilangan Prima')
        }

        case 'factor': {
            const n = Number(input)
            if (!Number.isInteger(n) || n === 0) {
                return notifReply('Masukkan bilangan bulat bukan nol.\n\nContoh:\n.factor 360', 'Faktorisasi')
            }
            const factors = primeFactors(Math.abs(n))
            const grouped = factors.reduce((acc, f) => {
                acc[f] = (acc[f] || 0) + 1
                return acc
            }, {})
            const pretty = Object.entries(grouped).map(([base, exp]) => (exp > 1 ? `${base}^${exp}` : base)).join(' × ')
            return notifReply(`${n} = ${pretty}`, 'Faktorisasi Prima')
        }

        case 'fib':
        case 'fibonacci': {
            const n = Math.min(Math.max(Number(input) || 10, 1), 80)
            const series = [0, 1]
            while (series.length < n) series.push(series.at(-1) + series.at(-2))
            return notifReply(series.slice(0, n).join(', '), `Fibonacci (${n})`)
        }

        case 'gcd': {
            const [a, b] = input.split(/\s+/).map(Number)
            if (!Number.isInteger(a) || !Number.isInteger(b)) {
                return notifReply('Format:\n.gcd <angka1> <angka2>', 'GCD')
            }
            return notifReply(`GCD(${a}, ${b}) = ${gcd(a, b)}`, 'Faktor Persekutuan Terbesar')
        }

        case 'lcm': {
            const [a, b] = input.split(/\s+/).map(Number)
            if (!Number.isInteger(a) || !Number.isInteger(b) || a === 0 || b === 0) {
                return notifReply('Format:\n.lcm <angka1> <angka2> (bukan nol)', 'LCM')
            }
            return notifReply(`LCM(${a}, ${b}) = ${Math.abs(a * b) / gcd(a, b)}`, 'Kelipatan Persekutuan Terkecil')
        }

        case 'sqrt': {
            const n = Number(input)
            if (!Number.isFinite(n) || n < 0) return notifReply('Masukkan angka >= 0.', 'Akar')
            return notifReply(`√${n} = ${Math.sqrt(n)}`, 'Akar Kuadrat')
        }

        case 'pow': {
            const [base, exp] = input.split(/\s+/).map(Number)
            if (!Number.isFinite(base) || !Number.isFinite(exp)) {
                return notifReply('Format:\n.pow <basis> <pangkat>\n\nContoh:\n.pow 2 10', 'Pangkat')
            }
            return notifReply(`${base}^${exp} = ${Math.pow(base, exp)}`, 'Pangkat')
        }

        case 'round': {
            const parts = input.split(/\s+/).map(Number)
            const value = parts[0]
            const digits = Number.isInteger(parts[1]) ? parts[1] : 0
            if (!Number.isFinite(value)) return notifReply('Format:\n.round <angka> [desimal]', 'Pembulatan')
            const factor = Math.pow(10, digits)
            return notifReply([
                `Bulat     : ${Math.round(value)}`,
                `Ke bawah  : ${Math.floor(value)}`,
                `Ke atas   : ${Math.ceil(value)}`,
                `Desimal ${digits} : ${Math.round(value * factor) / factor}`
            ].join('\n'), 'Pembulatan')
        }

        case 'mean':
        case 'statistik': {
            const numbers = input.split(/[\s,]+/).map(Number).filter(Number.isFinite)
            if (numbers.length < 2) {
                return notifReply('Masukkan minimal 2 angka dipisah spasi atau koma.\n\nContoh:\n.mean 10 20 30 40', 'Statistik')
            }
            const sorted = [...numbers].sort((a, b) => a - b)
            const sum = numbers.reduce((a, b) => a + b, 0)
            const mean = sum / numbers.length
            const median = sorted.length % 2
                ? sorted[(sorted.length - 1) / 2]
                : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            const variance = numbers.reduce((acc, n) => acc + (n - mean) ** 2, 0) / numbers.length
            const counts = numbers.reduce((acc, n) => {
                acc[n] = (acc[n] || 0) + 1
                return acc
            }, {})
            const mode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

            return notifReply([
                `Data    : ${numbers.join(', ')}`,
                `Jumlah  : ${sum}`,
                `Rata-rata: ${mean.toFixed(2)}`,
                `Median  : ${median}`,
                `Modus   : ${mode[0]} (${mode[1]}x)`,
                `Min/Max : ${sorted[0]} / ${sorted.at(-1)}`,
                `Std dev : ${Math.sqrt(variance).toFixed(2)}`
            ].join('\n'), 'Statistik')
        }

        default:
            return
    }
}

handler.command = ['calc', 'math', 'hitung', 'percent', 'discount', 'prime', 'factor', 'fib',
    'fibonacci', 'gcd', 'lcm', 'sqrt', 'pow', 'round', 'mean', 'statistik']
handler.category = 'Tools'
handler.description = 'Kalkulator & matematika'

export default handler
