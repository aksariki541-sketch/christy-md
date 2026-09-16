import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'
import pino from 'pino'
import chalk from 'chalk'
import {
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
    jidDecode,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    makeWASocket
} from './lib/baileys.js'
import { smsg } from './lib/myfunc.js'
import { sendFile, replyText } from './lib/compat.js'
import handleMessage, { initPlugins } from './handler.js'
import { banner, brand, SYMBOL, THEME } from './lib/ui.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'))
const identity = brand()

const usePairingCode = true
const pairingCode = config.pairingCode || identity.pairingCode

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise(resolve => rl.question(text, resolve))

const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) })

let pluginsLoaded = false

const tag = chalk.hex(THEME.edge)(`${SYMBOL.arrow}`)
const say = (text) => console.log(`${tag} ${text}`)

function printStartup() {
    console.clear?.()
    console.log()
    console.log(banner())
    console.log()
    say(chalk.gray(`Login     : ${usePairingCode ? 'Pairing Code' : 'QR Code'}`))
    say(chalk.gray(`Pairing   : ${usePairingCode ? chalk.bold.white(pairingCode) : '-'}`))
    say(chalk.gray(`Mode      : ${config.botMode === 'public' ? 'Public' : 'Self'}`))
    say(chalk.gray(`Prefix    : ${(config.prefix || ['.']).join('  ')}`))
    console.log()
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        printQRInTerminal: !usePairingCode,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        logger: pino({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        }
    })

    // Kompatibilitas plugin hasil adaptasi: sebagian plugin memakai
    // conn.sendFile() / conn.reply() seperti base lain.
    sock.sendFile = (chat, file, filename, caption, quoted, options) =>
        sendFile(sock, chat, file, filename, caption, quoted, options)
    sock.reply = (chat, text, quoted) => replyText(sock, chat, text, quoted)

    // conn.getName(jid) — dipakai plugin adaptasi dari base lain
    sock.getName = async (jid) => {
        try {
            const cached = global.nameCache?.[jid]
            if (cached) return cached
            if (String(jid).endsWith('@g.us')) {
                const meta = await sock.groupMetadata(jid)
                if (meta?.subject) return meta.subject
            }
        } catch {}
        return String(jid || '').split('@')[0]
    }

    // Sebagian plugin adaptasi membaca koneksi lewat variabel global
    global.conn ??= sock

    sock.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server ? decode.user + '@' + decode.server : jid
        }
        return jid
    }

    store.bind(sock.ev)

    if (!sock.authState.creds.registered && usePairingCode) {
        console.log(chalk.hex(THEME.from)('┌─「 PAIRING 」'))
        const phoneNumber = await question(chalk.hex(THEME.edge)('│  Nomor WhatsApp (contoh 628xxx): '))
        const code = await sock.requestPairingCode(phoneNumber.trim(), pairingCode)
        console.log(chalk.hex(THEME.from)('│') + `  Kode: ` + chalk.bold.white(code))
        console.log(chalk.hex(THEME.from)('└─') + chalk.gray('  Masukkan di WhatsApp › Perangkat Tertaut › Tautkan dengan nomor telepon'))
        console.log()
    }

    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const mek = messages[0]
            if (!mek.message) return
            if (mek.key.remoteJid === 'status@broadcast') return
            if (mek.key.id?.startsWith('BAE5') && mek.key.id.length === 16) return

            const m = smsg(sock, mek, store)
            if (!m) return

            await handleMessage(sock, m)
        } catch (e) {
            console.log(e)
        }
    })

    sock.public = true

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            if (!pluginsLoaded) {
                await initPlugins()
                pluginsLoaded = true
            }
            say(chalk.green(`Terhubung — ${identity.name} siap menerima perintah`))
            say(chalk.gray(`Coba kirim: ${(config.prefix || ['.'])[0]}menu`))
            console.log()
            return
        }

        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                say(chalk.yellow('Koneksi terputus — menyambung ulang...'))
                connectToWhatsApp()
            } else {
                say(chalk.red('Sesi logout. Hapus folder ./session lalu jalankan ulang bot.'))
            }
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

printStartup()
connectToWhatsApp()
