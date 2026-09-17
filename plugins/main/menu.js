/*
  creator : riki
  christy md
  ——————————————————————————————
  NEON GLASS MENU  (gaya baru)
  tampilan: box-line elektrik + small caps
  audio   : media/chirsty.mp3  (auto transcode -> voice note)
*/

import moment from 'moment-timezone'
import fs from 'fs'
import { prepareWAMessageMedia } from 'baileys'
import { spawn } from 'child_process'

let sharp
try { sharp = (await import('sharp')).default } catch {}

moment.locale('id')

/* ══════════════════ KONFIG ══════════════════ */

const MENU_VIDEO =
  'https://cdn.nekohime.site/file/9a7ngxww.mp4'

/* file audio lokal (punya kamu) */
const MENU_AUDIO = './media/chirsty.mp3'

const MENU_LINK   = 'https://nakanomiku-md.vercel.app'
const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbAYjQgKrWQluDTYcg2G'

/* pilih tema: 'neon' | 'mono' | 'royal' */
const THEME = 'neon'

const MAX_BUTTON_TEXT = 3000   // batas aman teks tombol native flow

/* kalau daftar perintah kepanjangan untuk tombol, tetap dikirim UTUH 1 pesan:
   'link' = pakai preview tautan + thumbnail  |  'text' = teks polos */
const MENU_FULL_FALLBACK = 'link'
const CACHE_TTL = 6 * 3600 * 1000  // cache gif/thumb/audio 6 jam

const TMP_DIR   = './tmp'
const TMP_VIDEO = './tmp/christy-menu-source.mp4'
const TMP_GIF   = './tmp/christy-menu.gif.mp4'
const TMP_THUMB = './tmp/christy-thumbnail.jpg'
const TMP_A_IN  = './tmp/christy-audio-in.mp3'
const TMP_A_OUT = './tmp/christy-audio-out.ogg'

/* ══════════════════ TEMA ══════════════════ */

const THEMES = {
  neon: {
    tl: '╭', tr: '╮', bl: '╰', br: '╯', v: '│', h: '━', h2: '─',
    pip: '✦', bullet: '▸', arrow: '➤', mark: '◈', spark: '⌁', bar: '▰'
  },
  mono: {
    tl: '┌', tr: '┐', bl: '└', br: '┘', v: '│', h: '═', h2: '─',
    pip: '◆', bullet: '›', arrow: '→', mark: '◼', spark: '·', bar: '■'
  },
  royal: {
    tl: '╔', tr: '╗', bl: '╚', br: '╝', v: '║', h: '═', h2: '─',
    pip: '❖', bullet: '➢', arrow: '➤', mark: '♛', spark: '✧', bar: '▰'
  }
}

const T = THEMES[THEME] || THEMES.neon

/* ══════════════════ HURUF GAYA ══════════════════ */

const BOLD = {
  a:'𝗮', b:'𝗯', c:'𝗰', d:'𝗱', e:'𝗲', f:'𝗳', g:'𝗴', h:'𝗵', i:'𝗶',
  j:'𝗷', k:'𝗸', l:'𝗹', m:'𝗺', n:'𝗻', o:'𝗼', p:'𝗽', q:'𝗾', r:'𝗿',
  s:'𝘀', t:'𝘁', u:'𝘂', v:'𝘃', w:'𝘄', x:'𝘅', y:'𝘆', z:'𝘇',
  0:'𝟬', 1:'𝟭', 2:'𝟮', 3:'𝟯', 4:'𝟰', 5:'𝟱', 6:'𝟲', 7:'𝟳', 8:'𝟴', 9:'𝟵'
}

const SMALL = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ', i:'ɪ',
  j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
}

const toBold  = (t = '') => String(t).toLowerCase().split('').map(c => BOLD[c]  || c).join('')
const toSmall = (t = '') => String(t).toLowerCase().split('').map(c => SMALL[c] || c).join('')

const TAG_ICON = {
  main:'🧿', info:'📡', ai:'🤖', anime:'🎴', audio:'🎚️',
  downloader:'🛰️', download:'🛰️', fun:'🎯', game:'🕹️', group:'🛡️',
  image:'🖼️', internet:'🌐', maker:'🪄', nsfw:'🔞', owner:'♛',
  panel:'📟', quotes:'💭', quran:'📜', random:'🎲', rpg:'⚔️',
  search:'🔍', sound:'📢', stalk:'🕵️', sticker:'🎨', store:'🏷️',
  tools:'🔩', voice:'🎛️', xp:'💫', other:'🧩'
}

const tagIcon = tag => TAG_ICON[String(tag).toLowerCase()] || T.mark

function formatTag (tag) {
  return String(tag)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function getGreetingLine (hour) {
  if (hour < 4)  return 'dini hari — matikan layar, istirahat dulu ' + T.spark
  if (hour < 11) return 'selamat pagi — gaskeun, hari masih panjang ' + T.spark
  if (hour < 15) return 'selamat siang — jaga ritme, jangan kehabisan baterai ' + T.spark
  if (hour < 19) return 'selamat sore — rapikan sisa kerja hari ini ' + T.spark
  return 'selamat malam — waktunya recharge ' + T.spark
}

/* ══════════════════ UTIL ══════════════════ */

async function fetchBuffer (url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(timeout)
  }
}

function runFFmpeg (args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args)
    let stderr = ''
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('error', reject)
    proc.on('close', code => {
      if (code === 0) return resolve()
      reject(new Error(`FFmpeg gagal (kode ${code})\n${stderr.slice(-1500)}`))
    })
  })
}

/* cache sederhana: kalau file tmp masih segar, dipakai ulang */
function cacheValid (file, ttl = CACHE_TTL) {
  try {
    const st = fs.statSync(file)
    return st.size > 0 && (Date.now() - st.mtimeMs) < ttl
  } catch { return false }
}

/* ══════════════════ MEDIA: GIF + THUMBNAIL ══════════════════ */

async function createGifBuffer (videoBuffer) {
  fs.mkdirSync(TMP_DIR, { recursive: true })

  if (cacheValid(TMP_GIF)) return fs.readFileSync(TMP_GIF)

  fs.writeFileSync(TMP_VIDEO, videoBuffer)

  await runFFmpeg([
    '-y', '-i', TMP_VIDEO,
    '-vf', 'fps=20,scale=480:-2:flags=lanczos',
    '-t', '12',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30',
    '-pix_fmt', 'yuv420p', '-profile:v', 'baseline', '-level', '3.0',
    '-an', '-sn', '-movflags', '+faststart',
    TMP_GIF
  ])

  if (!fs.existsSync(TMP_GIF)) throw new Error('GIF video gagal dibuat')
  return fs.readFileSync(TMP_GIF)
}

async function createVideoThumbnail (videoBuffer) {
  fs.mkdirSync(TMP_DIR, { recursive: true })

  if (cacheValid(TMP_THUMB)) return fs.readFileSync(TMP_THUMB)

  fs.writeFileSync(TMP_VIDEO, videoBuffer)

  await runFFmpeg([
    '-y', '-ss', '00:00:01', '-i', TMP_VIDEO,
    '-frames:v', '1',
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
    '-q:v', '2', TMP_THUMB
  ])

  if (!fs.existsSync(TMP_THUMB)) throw new Error('Thumbnail gagal dibuat')
  return fs.readFileSync(TMP_THUMB)
}

/* ══════════════════ AUDIO: media/chirsty.mp3 ══════════════════ */

function isAudioBuffer (buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 512) return false
  if (buf.slice(0, 3).toString('ascii') === 'ID3') return true      // mp3
  if (buf.slice(0, 4).toString('ascii') === 'OggS') return true     // ogg
  if (buf.slice(0, 4).toString('ascii') === 'fLaC') return true
  if (buf.slice(0, 4).toString('ascii') === 'RIFF') return true     // wav
  if (buf.slice(4, 8).toString('ascii') === 'ftyp') return true     // m4a/mp4
  const a = buf[0], b = buf[1]
  return a === 0xff && (b === 0xfb || b === 0xf3 || b === 0xf2 || b === 0xfa) // mp3 sync
}

/* transcode -> ogg/opus (paling aman untuk voice note WA) */
async function toVoiceNote (input) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
  fs.writeFileSync(TMP_A_IN, input)

  try {
    await runFFmpeg([
      '-y', '-i', TMP_A_IN,
      '-vn', '-ac', '1', '-ar', '48000',
      '-c:a', 'libopus', '-b:a', '64k', '-application', 'voip',
      TMP_A_OUT
    ])
    const out = fs.readFileSync(TMP_A_OUT)
    if (out.length > 1024) {
      return { audio: out, mimetype: 'audio/ogg; codecs=opus', ptt: true }
    }
  } catch (err) {
    console.error('OPUS ENCODE ERROR:', err.message)
  }

  /* fallback 2: m4a/aac */
  try {
    await runFFmpeg([
      '-y', '-i', TMP_A_IN,
      '-vn', '-ac', '1', '-ar', '44100', '-c:a', 'aac', '-b:a', '96k',
      TMP_A_OUT + '.m4a'
    ])
    const out = fs.readFileSync(TMP_A_OUT + '.m4a')
    if (out.length > 1024) return { audio: out, mimetype: 'audio/mp4', ptt: true }
  } catch (err) {
    console.error('AAC ENCODE ERROR:', err.message)
  }

  /* fallback 3: kirim apa adanya sebagai mp3 */
  return { audio: input, mimetype: 'audio/mpeg', ptt: true }
}

async function getMenuVoiceNote () {
  if (cacheValid(TMP_A_OUT)) {
    return { audio: fs.readFileSync(TMP_A_OUT), mimetype: 'audio/ogg; codecs=opus', ptt: true }
  }

  if (!MENU_AUDIO || !fs.existsSync(MENU_AUDIO)) {
    console.error(`[MENU AUDIO] file tidak ketemu: ${MENU_AUDIO}`)
    return null
  }

  const raw = fs.readFileSync(MENU_AUDIO)
  if (!isAudioBuffer(raw)) {
    console.error('[MENU AUDIO] file bukan audio valid:', MENU_AUDIO)
    return null
  }

  return toVoiceNote(raw)
}

/* ══════════════════ RAKITAN TEKS ══════════════════ */

/* kotak judul utama */
function headerBox (title, sub, width = 23) {
  const line = T.h.repeat(width)
  return [
    `${T.tl}${line}${T.tr}`,
    `   ${T.spark} ${toBold(title)} ${T.spark}`,
    `   ${T.mark} ${sub}`,
    `${T.bl}${line}${T.br}`
  ].join('\n')
}

/* blok berjudul (identitas / sistem) */
function blockBox (label, rows, width = 16) {
  return [
    `${T.tl}${T.h2} ${label}`,
    ...rows.map(r => `${T.v} ${r}`),
    `${T.bl}${T.h.repeat(width)}`
  ].join('\n')
}

const row = (key, val) => `${T.bullet} ${key.padEnd(8)} ${T.pip} ${val}`

/* ══════════════════ HANDLER ══════════════════ */

let handler = async (m, { conn, usedPrefix, command, text, isOwner }) => {
  try {
    const who   = m.sender
    const users = global.db?.data?.users || {}
    const user  = users[who] || {}

    const pushname = m.pushName || user.name || 'Kak'

    const premiumActive = isOwner || Number(user.premiumTime || 0) > Date.now()
    const limit  = premiumActive ? 'Unlimited' : (user.limit ?? 0)
    const role   = isOwner ? 'Owner' : (user.role || 'Newbie')
    const status = isOwner ? 'Owner ♛' : premiumActive ? 'Premium 💜' : 'Gratis ⚡'

    const totalexp = Number(user.totalexp || user.exp || 0).toLocaleString('id-ID')

    const now = moment().tz(global.timezone || 'Asia/Jakarta')
    const jam      = now.format('HH:mm')
    const tanggal  = now.format('ddd, DD MMM YYYY')
    const greeting = getGreetingLine(now.hours())

    /* ── ambil & olah video menu ── */
    let sourceBuffer
    try {
      sourceBuffer = await fetchBuffer(MENU_VIDEO)
    } catch (error) {
      console.error('MENU VIDEO ERROR:', error)
      return m.reply(`Video menu gagal diambil.\n\n${error.message}`)
    }

    let gifBuffer = sourceBuffer
    try {
      gifBuffer = await createGifBuffer(sourceBuffer)
    } catch (error) {
      console.error('GIF CONVERT ERROR:', error)
    }

    let thumbnailBuffer = null
    try {
      thumbnailBuffer = await createVideoThumbnail(gifBuffer)
    } catch (error) {
      console.error('THUMBNAIL ERROR:', error)
    }

    /* ── kumpulkan plugin ── */
    const plugins = Object.values(global.plugins || {}).filter(p => p && !p.disabled)

    const categories = {}
    for (const plugin of plugins) {
      const helps = Array.isArray(plugin.help) ? plugin.help
        : plugin.help ? [plugin.help] : []
      const tags = Array.isArray(plugin.tags) ? plugin.tags
        : plugin.tags ? [plugin.tags] : []

      for (let tag of tags) {
        if (!tag) continue
        tag = String(tag).toLowerCase().trim()
        if (!categories[tag]) categories[tag] = []
        categories[tag].push({ helps, prefix: !plugin.customPrefix })
      }
    }

    const countCmd = tag =>
      (categories[tag] || []).reduce(
        (t, i) => t + (Array.isArray(i.helps) ? i.helps.filter(Boolean).length : 0), 0
      )

    const menuType  = (text || '').toLowerCase().trim()
    const arrayMenu = Object.keys(categories).sort()
    const totalCmd  = arrayMenu.reduce((t, tag) => t + countCmd(tag), 0)

    /* ── BERANDA ── */
    const createHome = () => [
      headerBox('christy md', 'whatsapp assistant'),
      '',
      `${T.arrow} hai, ${pushname} ${T.pip}`,
      `   ${greeting}`,
      '',
      blockBox(`${T.mark} ${toSmall('identitas')}`, [
        row('Status', status),
        row('Role', role),
        row('Limit', limit),
        row('XP', totalexp)
      ]),
      '',
      blockBox(`${T.mark} ${toSmall('sistem')}`, [
        row('Jam', `${jam} WIB`),
        row('Tanggal', tanggal),
        row('Kategori', arrayMenu.length),
        row('Perintah', totalCmd)
      ]),
      '',
      `${T.bar} ketik *${usedPrefix}menu all* atau pakai tombol di bawah`
    ].join('\n')

    /* ── DAFTAR PER KATEGORI ── */
    const createCategoryMenu = targets => {
      const blocks = []

      for (const tag of targets) {
        if (!categories[tag]) continue

        const cmds = []
        for (const item of categories[tag]) {
          const helps = Array.isArray(item.helps) ? item.helps : []
          for (const cmd of helps) {
            if (!cmd) continue
            cmds.push(`${T.v}  ${T.pip} ${item.prefix ? usedPrefix : ''}${cmd}`)
          }
        }
        if (!cmds.length) continue

        blocks.push([
          `${T.tl}${T.h2}${T.h2} ${tagIcon(tag)} ${toSmall(formatTag(tag))} ${T.h2}${T.h2} ${countCmd(tag)} fitur`,
          ...cmds,
          `${T.bl}${T.h2.repeat(20)}`
        ].join('\n'))
      }

      return blocks.join('\n\n')
    }

    /* ── HALAMAN DETAIL ── */
    const createDetail = targets => {
      const count = targets.reduce((s, t) => s + countCmd(t), 0)
      return [
        headerBox('direktori', `${targets.length} kategori ${T.pip} ${count} perintah`, 21),
        '',
        createCategoryMenu(targets),
        '',
        `${T.bar} prefix *${usedPrefix}* ${T.pip} diracik oleh Riki`
      ].join('\n').trim()
    }

    /* ── KIRIM VOICE NOTE ── */
    const playSound = async () => {
      try {
        const voice = await getMenuVoiceNote()
        if (!voice) return
        await conn.sendMessage(m.chat, voice, { quoted: m })
      } catch (error) {
        console.error('AUDIO MENU ERROR:', error)
      }
    }

    /* ── KIRIM MENU GIF ── */
    const sendMenu = async (footer, buttons, title, optionText = 'Menu Christy') => {
      await conn.sendMessage(
        m.chat,
        {
          video: gifBuffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: '',
          footer,
          optionText,
          optionTitle: title,
          nativeFlow: buttons,
          interactiveAsTemplate: false
        },
        { quoted: m }
      )
    }

    /* ── PRATINJAU TAUTAN (fallback) ── */
    const sendLinkPreview = async bodyText => {
      let hdThumb = thumbnailBuffer

      if (!hdThumb && sharp) {
        try {
          hdThumb = await sharp(gifBuffer)
            .resize(1280, 720, { fit: 'cover' })
            .jpeg({ quality: 90 })
            .toBuffer()
        } catch {}
      }

      if (!hdThumb) {
        return conn.sendMessage(m.chat, { text: `${MENU_LINK}\n\n${bodyText}` }, { quoted: m })
      }

      try {
        const { imageMessage: image } = await prepareWAMessageMedia(
          { image: hdThumb },
          { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
        )
        if (image) { image.width = 1280; image.height = 720 }

        await conn.sendMessage(
          m.chat,
          {
            text: `${MENU_LINK}\n\n${bodyText}`,
            linkPreview: {
              'matched-text': MENU_LINK,
              title: 'Christy MD',
              description: 'Neon WhatsApp Assistant',
              previewType: 0,
              jpegThumbnail: hdThumb,
              highQualityThumbnail: image,
              linkPreviewMetadata: { linkMediaDuration: 0, socialMediaPostType: 4 }
            }
          },
          { quoted: m }
        )
      } catch (error) {
        console.error('LINK PREVIEW ERROR:', error)
        await conn.sendMessage(m.chat, { text: `${MENU_LINK}\n\n${bodyText}` }, { quoted: m })
      }
    }

    /* ══════════ BERANDA ══════════ */
    if (!menuType || (!categories[menuType] && menuType !== 'all')) {
      const rows = arrayMenu.map(tag => ({
        header: tagIcon(tag),
        title: formatTag(tag),
        description: `${countCmd(tag)} fitur`,
        id: `${usedPrefix}${command} ${tag}`
      }))

      await sendMenu(
        createHome(),
        [
          {
            text: `${T.mark} Lihat Kategori`,
            sections: [{ title: `${T.pip} ${arrayMenu.length} Kategori ${T.pip}`, rows }],
            icon: 'review'
          },
          { text: `${T.bar} Semua Perintah`, id: `${usedPrefix}${command} all`, icon: 'document' },
          { text: '♛ Owner', id: `${usedPrefix}owner`, icon: 'promotion' },
          { text: `${T.spark} Channel Resmi`, url: CHANNEL_LINK, useWebview: true, icon: 'image' }
        ],
        'Christy MD',
        'Buka Menu'
      )

      await playSound()
      return
    }

    /* ══════════ DETAIL / SEMUA ══════════ */
    const targets = menuType === 'all' ? arrayMenu : [menuType]

    const navButtons = [
      { text: `${T.mark} Beranda`, id: `${usedPrefix}${command}`, icon: 'review' },
      { text: `${T.bar} Semua Perintah`, id: `${usedPrefix}${command} all`, icon: 'document' },
      { text: `${T.spark} Channel Resmi`, url: CHANNEL_LINK, useWebview: true, icon: 'image' }
    ]

    /* muat -> tombol; kepanjangan -> tetap satu pesan utuh (tanpa halaman) */
    const detail = createDetail(targets)

    if (detail.length <= MAX_BUTTON_TEXT) {
      await sendMenu(detail, navButtons, 'Navigasi', 'Menu Christy')
    } else if (MENU_FULL_FALLBACK === 'text') {
      await conn.sendMessage(m.chat, { text: detail }, { quoted: m })
    } else {
      await sendLinkPreview(detail)
    }
  } catch (error) {
    console.error('CHRISTY MENU ERROR:', error)
    await m.reply(`Menu error: ${error.message}`)
  }
}

handler.command = /^(menu|help)$/i
handler.tags = ['main']
handler.help = ['menu']

export default handler