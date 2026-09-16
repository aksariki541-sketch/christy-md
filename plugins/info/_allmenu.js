// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/_allmenu.js (diambil dari Nakano-Miku-MD.zip (zip sumber di dalam paket))
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .allmenu

import fs from 'fs'
import os from 'os'
import path from 'path'
import moment from 'moment-timezone'
import fetch from 'node-fetch'
import { spawn } from 'child_process'

/* =========================
 * CONFIG
 * ========================= */

const MENU_VIDEO = './menuvid/anya.mp4'
const AUDIO_URL  = 'https://raw.githubusercontent.com/hamm-r/uploader/main/1787627805466-391.mp3'

const quotes = [
  'waku waku~!',
  'anya suka kacang.',
  'mission complete.',
  'anya membaca pikiranmu.',
  'spy wars dimulai.',
  'anya sangat pintar.',
  'aku tau semuanya.',
  'eleganto.',
  'kacang adalah segalanya.',
  'heh.'
]

const icons = {
  main: '🏠', ai: '🧠', tools: '🔧', download: '📥', search: '🔎', group: '👥',
  owner: '👑', anime: '🌸', game: '🎮', rpg: '⚔️', sticker: '🎨', fun: '🎉',
  internet: '🌐', nsfw: '🔞', other: '🥜'
}

/* =========================
 * AESTHETIC FONT HELPERS
 * ========================= */

function fontBold(str) {
  return [...String(str)].map(c => {
    const n = c.codePointAt(0)
    if (n >= 65 && n <= 90)  return String.fromCodePoint(0x1D400 + n - 65)
    if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D41A + n - 97)
    if (n >= 48 && n <= 57)  return String.fromCodePoint(0x1D7CE + n - 48)
    return c
  }).join('')
}

function fontSmallCaps(str) {
  const map = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
    'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
    's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
  }
  return [...String(str).toLowerCase()].map(c => map[c] || c).join('')
}

function fontItalic(str) {
  return [...String(str)].map(c => {
    const n = c.codePointAt(0)
    if (n >= 65 && n <= 90)  return String.fromCodePoint(0x1D608 + n - 65)
    if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D622 + n - 97)
    return c
  }).join('')
}

/* =========================
 * UTIL
 * ========================= */

function pickQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)]
}

function getIcon(tag) {
  return icons[tag] || '✨'
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
}

function normalizePlugins(plugins) {
  return Object.values(plugins)
    .filter(plugin => plugin && !plugin.disabled)
    .map(plugin => {
      let help = plugin.help || []
      let tags = plugin.tags || ['other']
      if (!Array.isArray(help)) help = [help]
      if (!Array.isArray(tags)) tags = [tags]
      help = help.filter(Boolean)
      tags = tags.filter(Boolean)
      if (!help.length) return null
      return { help, tags, limit: !!plugin.limit, premium: !!plugin.premium }
    }).filter(Boolean)
}

/* =========================
 * AUDIO ANYA
 * ========================= */

async function sendAudioAnya(conn, m) {
  try {
    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const res = await fetch(AUDIO_URL)
    const buffer = Buffer.from(await res.arrayBuffer())
    const input = path.join(tmpDir, `anya_${Date.now()}.mp3`)
    const output = path.join(tmpDir, `anya_${Date.now()}.ogg`)

    fs.writeFileSync(input, buffer)

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ['-y', '-i', input, '-vn', '-c:a', 'libopus', output])
      ffmpeg.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error('ffmpeg error'))
      })
    })

    await conn.sendMessage(m.chat, { audio: fs.readFileSync(output), mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })

    if (fs.existsSync(input)) fs.unlinkSync(input)
    if (fs.existsSync(output)) fs.unlinkSync(output)
  } catch (e) {
    console.log('[MENU AUDIO ERROR]', e)
  }
}

/* =========================
 * LOADING ANIMATION PREMIUM
 * ========================= */

async function loadingAnya(conn, m) {
  const msg = await conn.sendMessage(m.chat, { text: '🌸 _Membangunkan Anya..._' }, { quoted: m })
  
  const frames = [
    { percent: 15,  text: 'mencari kacang...' },
    { percent: 35,  text: 'membaca pikiran user...' },
    { percent: 60,  text: 'mengumpulkan plugin...' },
    { percent: 85,  text: 'menyusun kategori...' },
    { percent: 100, text: 'menu siap ditampilkan!' }
  ]

  for (const frame of frames) {
    const fill = Math.floor(frame.percent / 10)
    const bar = '■'.repeat(fill) + '□'.repeat(10 - fill)

    await new Promise(r => setTimeout(r, 400))
    
    await conn.relayMessage(m.chat, {
      protocolMessage: {
        key: msg.key,
        type: 14,
        editedMessage: {
          conversation: `🌸 *Anya Loading* [${bar}] ${frame.percent}%\n> _${frame.text}_`
        }
      }
    }, {})
  }
  return msg
}

/* =========================
 * USER & SYSTEM INFO
 * ========================= */

function getUserRole(isOwner, user) {
  if (isOwner) return 'Owner'
  if (user?.premium) return 'Premium'
  return 'Member'
}

function getLevelInfo(user = {}) {
  return { level: user.level || 0, exp: user.exp || 0, limit: user.limit || 0, money: user.money || 0 }
}

function getSystemInfo() {
  const memory = process.memoryUsage()
  const totalRam = os.totalmem()
  const freeRam = os.freemem()
  const usedRam = totalRam - freeRam
  return {
    platform: os.platform(),
    ramPercent: ((usedRam / totalRam) * 100).toFixed(1)
  }
}

function getMenuStats(conn, plugins) {
  const totalFeatures = plugins.reduce((total, p) => total + p.help.length, 0)
  const totalUsers = Object.keys(global.db.data.users || {}).length
  let totalGroups = 0
  try {
    if (conn.chats && typeof conn.chats === 'object') {
      totalGroups = Object.keys(conn.chats).filter(jid => jid.endsWith('@g.us')).length
    }
  } catch {}
  return { totalUsers, totalGroups, totalFeatures }
}

/* =========================
 * MENU BUILDER
 * ========================= */

function createHeader({ name, role, level, limit, money, uptime, ping, stats, sys }) {
  const date = moment.tz('Asia/Jakarta').format('DD MMMM YYYY')
  
  return [
    `🎀 ‧₊˚ ೀ *${fontBold('ANYA FORGER')}* ೀ ‧₊˚ 🎀`,
    ``,
    `Hii ${fontItalic(name)}, waku waku~!`,
    ``,
    `┌  ⚲  *P R O F I L E*`,
    `│ ∘ ${fontSmallCaps('Role')}  : ${fontSmallCaps(role)}`,
    `│ ∘ ${fontSmallCaps('Level')} : ${level}`,
    `│ ∘ ${fontSmallCaps('Limit')} : ${limit}`,
    `│ ∘ ${fontSmallCaps('Money')} : ${money}`,
    `└──────────────⟡`,
    ``,
    `┌  ⚲  *S Y S T E M*`,
    `│ ∘ ${fontSmallCaps('Date')}   : ${date}`,
    `│ ∘ ${fontSmallCaps('Uptime')} : ${uptime}`,
    `│ ∘ ${fontSmallCaps('Ping')}   : ${ping} ms`,
    `│ ∘ ${fontSmallCaps('Users')}  : ${stats.totalUsers}`,
    `│ ∘ ${fontSmallCaps('Groups')} : ${stats.totalGroups}`,
    `│ ∘ ${fontSmallCaps('Ram')}    : ${sys.ramPercent}%`,
    `└──────────────⟡`
  ].join('\n')
}

function buildMenu(tags, usedPrefix) {
  return Object.keys(tags).sort().map(tag => {
    const cmds = tags[tag].flatMap(plugin => 
      plugin.help.map(cmd => ({ cmd, limit: plugin.limit, premium: plugin.premium }))
    ).sort((a, b) => a.cmd.localeCompare(b.cmd))

    if (!cmds.length) return ''

    const list = cmds.map(c => `│ ∘ ${usedPrefix}${c.cmd}${c.limit ? ' Ⓛ' : ''}${c.premium ? ' Ⓟ' : ''}`).join('\n')
    
    return [
      `┌  ⚲  *${getIcon(tag)} ${tag.toUpperCase()}*`,
      list,
      `└──────────────⟡`
    ].join('\n')
  }).join('\n\n')
}

function createFooter() {
  return `\n💌 _"${fontItalic(pickQuote())}"_`
}

/* =========================
 * MAIN HANDLER
 * ========================= */

let handler = async (m, { conn, usedPrefix, isOwner }) => {
  const start = Date.now()
  
  // Trigger animasi loading minimalis
  await loadingAnya(conn, m)

  const user = global.db.data.users[m.sender] || {}
  const role = getUserRole(isOwner, user)
  const { level, exp, limit, money } = getLevelInfo(user)
  const plugins = normalizePlugins(global.plugins)
  
  const tags = {}
  for (const plugin of plugins) {
    for (const tag of plugin.tags) {
      if (!tags[tag]) tags[tag] = []
      tags[tag].push(plugin)
    }
  }

  const stats = getMenuStats(conn, plugins)
  const sys = getSystemInfo()
  const ping = Date.now() - start
  const uptime = clockString(process.uptime() * 1000)

  const header = createHeader({
    name: m.pushName || 'User', role, level, exp, limit, money, uptime, ping, stats, sys
  })
  const body = buildMenu(tags, usedPrefix)
  const footer = createFooter()
  const caption = header + '\n\n' + body + '\n' + footer

  try {
    if (fs.existsSync(MENU_VIDEO)) {
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(MENU_VIDEO),
        gifPlayback: true,
        caption,
        mentions: [m.sender]
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m })
    }
  } catch (e) {
    console.log('[MENU ERROR]', e)
    await conn.reply(m.chat, caption, m)
  }

  /* =========================
   * AUTO VOICE ANYA
   * ========================= */
  await sendAudioAnya(conn, m)
}

handler.command = ['allmenu']

export default handler
handler.category = 'Main'
handler.description = 'Allmenu'

