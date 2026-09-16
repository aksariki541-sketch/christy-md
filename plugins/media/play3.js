// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/play3.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .play3

import yts from 'yt-search'

const SEARCH_TIMEOUT = 15_000
const COVER_TIMEOUT = 15_000
const MAX_COVER_BYTES = 2_000_000
const MAX_EMBEDDED_COVER_BYTES = 180_000
const MAX_LYRIC_LINES = 90
const MAX_LYRIC_CHARS = 7_000

let sharpLoader

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.replace(/\s+/g, ' ').trim() || fallback
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function safeScriptValue(value) {
  return JSON.stringify(String(value))
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
}

function getBotNumber(conn) {
  return String(conn?.user?.id || conn?.user?.jid || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

function formatNumber(value = 0) {
  const number = Number(value) || 0
  if (number >= 1e9) return `${(number / 1e9).toFixed(1)}B`
  if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`
  if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`
  return String(number)
}

function formatDuration(totalSeconds, fallback = '-') {
  const seconds = Number(totalSeconds)
  if (!Number.isFinite(seconds) || seconds <= 0) return fallback || '-'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = Math.floor(seconds % 60)

  if (hours) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
  }

  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function extractYouTubeId(value) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.replace(/^www\./i, '')

    if (hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || ''
    if (!/(^|\.)youtube\.com$/i.test(hostname)) return ''

    if (url.pathname === '/watch') return url.searchParams.get('v') || ''
    const parts = url.pathname.split('/').filter(Boolean)
    if (['shorts', 'embed', 'live'].includes(parts[0])) return parts[1] || ''
  } catch {}

  return ''
}

async function findVideo(query) {
  const videoId = extractYouTubeId(query)

  if (videoId) {
    const video = await yts({ videoId })
    if (video?.title) {
      return {
        ...video,
        url: video.url || `https://www.youtube.com/watch?v=${videoId}`
      }
    }
  }

  const result = await yts(query)
  return result?.videos?.find(video => video?.url) || null
}

function songIdentity(video) {
  const rawTitle = cleanText(video?.title, 'Lagu tanpa judul')
  const channel = cleanText(video?.author?.name, 'Unknown Artist')
    .replace(/\s+-\s+Topic$/i, '')
    .replace(/VEVO$/i, '')
    .trim()

  let title = rawTitle
    .replace(/\s*[[(](?:official\s*)?(?:music\s*)?(?:video|audio|lyrics?|visuali[sz]er|mv)[^\])]*[\])]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  let artist = channel || 'Unknown Artist'

  const parts = title.split(/\s+-\s+/)
  if (parts.length >= 2 && parts[0].length <= 80) {
    artist = cleanText(parts.shift(), artist)
    title = cleanText(parts.join(' - '), title)
  }

  return { title, artist }
}

function normalizeMatch(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u3040-\u30ff\u3400-\u9fff]+/g, '')
}

function scoreLyrics(item, title, artist) {
  const wantedTitle = normalizeMatch(title)
  const wantedArtist = normalizeMatch(artist)
  const itemTitle = normalizeMatch(item?.trackName)
  const itemArtist = normalizeMatch(item?.artistName)
  let score = 0

  if (itemTitle === wantedTitle) score += 10
  else if (itemTitle.includes(wantedTitle) || wantedTitle.includes(itemTitle)) score += 5

  if (itemArtist === wantedArtist) score += 8
  else if (itemArtist.includes(wantedArtist) || wantedArtist.includes(itemArtist)) score += 4

  if (item?.syncedLyrics) score += 2
  if (item?.plainLyrics) score += 1
  return score
}

async function fetchLyricsQuery(query) {
  const url = new URL('https://lrclib.net/api/search')
  url.searchParams.set('q', query)

  const response = await fetch(url, {
    signal: AbortSignal.timeout(SEARCH_TIMEOUT),
    headers: {
      accept: 'application/json',
      'user-agent': 'Elaina-MD/1.0 (WhatsApp music player)'
    }
  })

  if (!response.ok) throw new Error(`LRCLIB HTTP ${response.status}`)
  const results = await response.json()
  return Array.isArray(results) ? results : []
}

async function findLyrics(title, artist) {
  let results = await fetchLyricsQuery(`${title} ${artist}`)

  // Nama channel YouTube sering beda dari nama artis di lrclib (mis. "- Topic",
  // nama alias, dsb), jadi kalau query gabungan kosong, coba lagi pakai judul saja.
  if (!results.some(item => item?.plainLyrics || item?.syncedLyrics)) {
    results = await fetchLyricsQuery(title)
  }

  return results
    .filter(item => item?.plainLyrics || item?.syncedLyrics)
    .sort((first, second) =>
      scoreLyrics(second, title, artist) - scoreLyrics(first, title, artist)
    )[0] || null
}

function lyricLines(item) {
  const synced = typeof item?.syncedLyrics === 'string'
    ? item.syncedLyrics.trim()
    : ''
  const plain = typeof item?.plainLyrics === 'string' ? item.plainLyrics : ''
  const source = synced || plain

  if (!source) {
    return [{ text: 'Lirik belum tersedia untuk lagu ini.', time: null }]
  }

  const lines = []
  let totalChars = 0

  for (const rawLine of source.split(/\r?\n/)) {
    const timed = rawLine.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/)
    const text = cleanText(timed ? timed[3] : rawLine)
    if (!text) continue

    const time = timed
      ? Number(timed[1]) * 60 + Number(timed[2])
      : null

    if (totalChars + text.length > MAX_LYRIC_CHARS) break
    lines.push({ text, time })
    totalChars += text.length
    if (lines.length >= MAX_LYRIC_LINES) break
  }

  return lines.length
    ? lines
    : [{ text: 'Lirik belum tersedia untuk lagu ini.', time: null }]
}

async function embedCover(imageUrl) {
  if (!/^https?:\/\//i.test(imageUrl || '')) return ''

  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(COVER_TIMEOUT),
    headers: {
      accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      referer: 'https://www.youtube.com/',
      'user-agent':
        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 ' +
        'Chrome/151 Mobile Safari/537.36'
    }
  })

  if (!response.ok) throw new Error(`Cover HTTP ${response.status}`)

  const contentType = String(
    response.headers.get('content-type') || 'image/jpeg'
  ).split(';')[0]
  const source = Buffer.from(await response.arrayBuffer())

  if (!contentType.startsWith('image/')) throw new Error('Cover bukan gambar')
  if (!source.length || source.length > MAX_COVER_BYTES) {
    throw new Error('Ukuran cover tidak aman')
  }

  try {
    if (!sharpLoader) {
      sharpLoader = import('sharp').then(module => module.default)
    }
    const sharp = await sharpLoader
    const compact = await sharp(source, { failOn: 'none' })
      .rotate()
      .resize(440, 440, { fit: 'cover', position: 'centre' })
      .webp({ quality: 72, effort: 4 })
      .toBuffer()

    if (compact.length > MAX_EMBEDDED_COVER_BYTES) {
      throw new Error('Cover hasil kompresi terlalu besar')
    }

    return `data:image/webp;base64,${compact.toString('base64')}`
  } catch (error) {
    if (source.length > MAX_EMBEDDED_COVER_BYTES) throw error
    return `data:${contentType};base64,${source.toString('base64')}`
  }
}

function buildCommandLink(botNumber, command, fallbackUrl) {
  return botNumber
    ? `https://wa.me/${botNumber}?text=${encodeURIComponent(command)}`
    : fallbackUrl
}

function buildLyricsMarkup(lines) {
  return lines.map((line, index) => {
    const time = Number.isFinite(line.time) ? line.time : ''
    return `<p class="lyric-line${index === 0 ? ' active' : ''}" data-time="${time}">${escapeHtml(line.text)}</p>`
  }).join('')
}

function buildSpotifyHtml({
  video,
  title,
  artist,
  album,
  cover,
  lines,
  conn,
  usedPrefix
}) {
  const botNumber = getBotNumber(conn)
  const prefix = usedPrefix || '.'
  const duration = formatDuration(video?.seconds, video?.timestamp)
  const titleInitial = escapeHtml(title.charAt(0).toUpperCase() || '♫')
  const coverMarkup = cover
    ? `<img id="coverImage" src="${escapeHtml(cover)}" alt="${escapeHtml(title)}">`
    : ''
  const lyricsMarkup = buildLyricsMarkup(lines)
  const audioCommand = `${prefix}ytmp3 ${video.url}`
  const videoCommand = `${prefix}ytmp4 ${video.url}`
  const lyricsCommand = `${prefix}lyrics ${title} ${artist}`
  const audioLink = buildCommandLink(botNumber, audioCommand, video.url)
  const videoLink = buildCommandLink(botNumber, videoCommand, video.url)
  const lyricsLink = buildCommandLink(botNumber, lyricsCommand, video.url)

  return `<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:transparent;color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
body{padding:5px;overflow:hidden}
.spotify-card{position:relative;overflow:hidden;padding:15px;background:linear-gradient(155deg,#23372b 0,#101512 34%,#090a09 100%);border:1px solid #303832;border-radius:27px;box-shadow:0 22px 55px rgba(0,0,0,.6)}
.glow{position:absolute;top:-120px;right:-100px;width:300px;height:300px;border-radius:50%;background:rgba(30,215,96,.17);filter:blur(22px);pointer-events:none}
.topbar{position:relative;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.brand{display:flex;align-items:center;gap:9px;font-size:12px;font-weight:900;letter-spacing:1.3px}
.brand-icon{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#1ed760;color:#07150c;font-size:17px;box-shadow:0 5px 15px rgba(30,215,96,.3)}
.quality{padding:5px 9px;border:1px solid #505752;border-radius:12px;color:#d9dedb;font-size:9px;font-weight:800;letter-spacing:.8px}
.search{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 68px;gap:8px;margin-bottom:14px}
.search input{min-width:0;height:42px;padding:0 14px;border:1px solid #434944;border-radius:22px;outline:0;background:rgba(8,10,9,.7);color:#fff;font-size:13px;font-weight:650}
.search button{border:0;border-radius:22px;background:#1ed760;color:#07150c;font-size:12px;font-weight:900;cursor:pointer}
.player{position:relative;display:grid;grid-template-columns:128px minmax(0,1fr);gap:15px;align-items:center}
.cover{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:1;overflow:hidden;border-radius:17px;background:linear-gradient(145deg,#1ed760,#096d2a 70%,#063b19);box-shadow:0 15px 30px rgba(0,0,0,.45);font-size:56px;font-weight:900;color:rgba(255,255,255,.9)}
.cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.song-info{min-width:0}
.now{margin-bottom:7px;color:#1ed760;font-size:9px;font-weight:900;letter-spacing:1.3px}
.title{display:-webkit-box;overflow:hidden;margin:0 0 5px;font-size:20px;line-height:1.13;font-weight:900;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.artist{overflow:hidden;margin:0 0 10px;color:#b8beb9;font-size:12px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}
.album{overflow:hidden;color:#7f8781;font-size:10px;text-overflow:ellipsis;white-space:nowrap}
.progress{margin-top:17px}
.progress-track{height:4px;overflow:hidden;border-radius:5px;background:#484d49}
.progress-fill{width:34%;height:100%;border-radius:5px;background:#fff}
.times{display:flex;justify-content:space-between;margin-top:6px;color:#8e9690;font-size:9px;font-weight:650}
.controls{display:flex;align-items:center;justify-content:center;gap:25px;margin:8px 0 13px}
.control{display:inline-flex;align-items:center;justify-content:center;border:0;background:transparent;color:#bac0bc;font-size:20px;cursor:pointer;text-decoration:none}
.play{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#fff;color:#080a09;font-size:20px;box-shadow:0 7px 20px rgba(0,0,0,.4);text-decoration:none}
.actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}
.action{display:flex;align-items:center;justify-content:center;min-width:0;padding:10px 5px;border:1px solid #39413b;border-radius:14px;background:#171b18;color:#f5f7f5;font-size:10px;font-weight:900;cursor:pointer;text-decoration:none}
.action.primary{border-color:#1ed760;background:#1ed760;color:#06150b}
.lyrics{position:relative;padding:15px;background:linear-gradient(155deg,#32a85a,#177238);border-radius:20px;box-shadow:inset 0 1px rgba(255,255,255,.14)}
.lyrics-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;font-size:13px;font-weight:900}
.lyrics-scroll{height:310px;overflow-y:auto;padding-right:7px;scroll-behavior:smooth;scrollbar-width:none}
.lyrics-scroll::-webkit-scrollbar{display:none}
.lyric-line{margin:0 0 14px;color:rgba(5,28,13,.52);font-size:19px;line-height:1.18;font-weight:900;cursor:pointer;transition:.18s ease}
.lyric-line.active{color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.14)}
.lyrics-tip{margin-top:9px;color:rgba(255,255,255,.68);font-size:9px;font-weight:700}
.footer{display:flex;justify-content:space-between;margin-top:11px;padding:0 3px;color:#777f79;font-size:9px;font-weight:800;letter-spacing:.5px}
@media(max-width:340px){.spotify-card{padding:11px}.player{grid-template-columns:105px minmax(0,1fr)}.title{font-size:17px}.lyrics-scroll{height:270px}.lyric-line{font-size:17px}}
</style>
<body>
  <main class="spotify-card">
    <div class="glow"></div>
    <header class="topbar">
      <div class="brand"><span class="brand-icon">♫</span>ELAINA MUSIC</div>
      <span class="quality">AIRICH • HQ</span>
    </header>

    <form id="searchForm" class="search">
      <input id="searchInput" value="${escapeHtml(title)}" maxlength="100" aria-label="Cari lagu lain">
      <button type="submit">Cari</button>
    </form>

    <section class="player">
      <a class="cover" href="${escapeHtml(video.url)}" target="_blank" rel="noopener noreferrer">
        <span>${titleInitial}</span>${coverMarkup}
      </a>
      <div class="song-info">
        <div class="now">NOW PLAYING</div>
        <h1 class="title">${escapeHtml(title)}</h1>
        <p class="artist">${escapeHtml(artist)}</p>
        <div class="album">${escapeHtml(album)} • ${formatNumber(video?.views)} views</div>
      </div>
    </section>

    <div class="progress">
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="times"><span>0:00</span><span>${escapeHtml(duration)}</span></div>
    </div>

    <div class="controls" aria-label="Kontrol musik">
      <a class="control" href="${escapeHtml(videoLink)}" target="_top" rel="noopener noreferrer">↶</a>
      <a class="control play" href="${escapeHtml(audioLink)}" target="_top" rel="noopener noreferrer" aria-label="Unduh audio">▶</a>
      <a class="control" href="${escapeHtml(videoLink)}" target="_top" rel="noopener noreferrer">↗</a>
    </div>

    <div class="actions">
      <a class="action primary" href="${escapeHtml(audioLink)}" target="_top" rel="noopener noreferrer">♫ AUDIO</a>
      <a class="action" href="${escapeHtml(videoLink)}" target="_top" rel="noopener noreferrer">▶ VIDEO</a>
      <a class="action" href="${escapeHtml(lyricsLink)}" target="_top" rel="noopener noreferrer">≡ LIRIK</a>
    </div>

    <section class="lyrics">
      <div class="lyrics-head"><span>Lirik</span><span>•••</span></div>
      <div id="lyricsScroll" class="lyrics-scroll">${lyricsMarkup}</div>
      <div class="lyrics-tip">Ketuk baris untuk menandainya • gulir untuk membaca</div>
    </section>

    <footer class="footer">
      <span>${escapeHtml(video?.timestamp || duration)}</span>
      <span>ᴇʟᴀɪɴᴀ - ᴍᴅ</span>
    </footer>
  </main>

<script>
(() => {
  const botNumber = ${safeScriptValue(botNumber)}
  const prefix = ${safeScriptValue(prefix)}
  const fallbackUrl = ${safeScriptValue(video.url)}

  // Tombol utama (audio/video/lirik/kontrol) sudah jadi <a href> asli di HTML,
  // jadi tetap jalan walau bagian JS di bawah ini gagal/diblokir.
  try {
    const searchForm = document.getElementById('searchForm')
    if (searchForm) {
      searchForm.addEventListener('submit', event => {
        event.preventDefault()
        const input = document.getElementById('searchInput')
        const query = input ? input.value.trim() : ''
        if (!query) return
        const command = prefix + 'play3 ' + query
        window.location.href = botNumber
          ? 'https://wa.me/' + botNumber + '?text=' + encodeURIComponent(command)
          : fallbackUrl
      })
    }
  } catch (error) {
    console.error('Play3 search form error:', error)
  }

  try {
    document.querySelectorAll('.lyric-line').forEach(line => {
      line.addEventListener('click', () => {
        document.querySelectorAll('.lyric-line').forEach(item => item.classList.remove('active'))
        line.classList.add('active')
        line.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    })
  } catch (error) {
    console.error('Play3 lyric-line error:', error)
  }

  try {
    const cover = document.getElementById('coverImage')
    if (cover) cover.addEventListener('error', () => cover.style.display = 'none')
  } catch (error) {
    console.error('Play3 cover error:', error)
  }
})()
</script>
</body>`
}

async function sendSpotifyCard(conn, m, data, usedPrefix) {
  const AIRichBuilder = global.AIRich
  if (typeof AIRichBuilder !== 'function') throw new Error('AIRich tidak tersedia')

  const html = buildSpotifyHtml({ ...data, conn, usedPrefix })
  const section = AIRichBuilder.newLayout('Single', {
    __typename: 'GenAIaeacdsnwHtmlPrimitive',
    payload: html,
    trusted_sources: [
      'wa.me',
      'www.youtube.com',
      'youtube.com',
      'youtu.be',
      'i.ytimg.com',
      'lrclib.net'
    ]
  })

  const rich = new AIRichBuilder(conn)
  rich._addContent(section, {
    messageType: 2,
    messageText: `♫ ${data.title} • ${data.artist}`
  })

  return rich.send(m.chat, {
    quoted: m,
    bypassDownload: false
  })
}

async function sendFallback(conn, m, data, usedPrefix) {
  const prefix = usedPrefix || '.'
  const lyricPreview = data.lines
    .map(line => line.text)
    .join('\n')
    .slice(0, 1_400)
  const caption = `♫ *ELAINA MUSIC*\n\n` +
    `*${data.title}*\n` +
    `${data.artist}\n` +
    `Album: ${data.album}\n` +
    `Durasi: ${formatDuration(data.video?.seconds, data.video?.timestamp)}\n\n` +
    `*Lirik*\n${lyricPreview}`

  // Bug fix: kalau thumbnail/image kosong, `image: { url: undefined }` membuat
  // Baileys crash. Jaga-jaga: tanpa gambar, kirim sebagai pesan teks biasa.
  const imageUrl = cleanText(data.video?.thumbnail || data.video?.image)
  const content = imageUrl
    ? {
      image: { url: imageUrl },
      caption,
      footer: 'ᴇʟᴀɪɴᴀ - ᴍᴅ',
      optionText: 'Pilih',
      optionTitle: 'Format lagu',
      nativeFlow: [{
        text: 'Pilih Format',
        sections: [{
          title: 'Elaina Music',
          rows: [
            {
              title: 'Audio MP3',
              description: 'Unduh lagu sebagai audio',
              id: `${prefix}ytmp3 ${data.video.url}`
            },
            {
              title: 'Video MP4',
              description: 'Unduh lagu sebagai video',
              id: `${prefix}ytmp4 ${data.video.url}`
            },
            {
              title: 'Lirik lengkap',
              description: 'Cari lirik lagu',
              id: `${prefix}lyrics ${data.title} ${data.artist}`
            }
          ]
        }]
      }]
    }
    : { text: caption }

  return conn.sendMessage(m.chat, content, { quoted: m })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const query = cleanText(text)
  if (!query) {
    return m.reply(
      `♫ *PLAY3 • ELAINA MUSIC*\n\n` +
      `Cari lagu dengan tampilan AIRich bergaya Spotify.\n\n` +
      `Contoh:\n${usedPrefix + command} sempurna andra and the backbone`
    )
  }

  await m.react('🔎')

  let video
  try {
    video = await findVideo(query)
    if (!video) {
      await m.react('❌')
      return m.reply(`❌ Lagu *${query}* tidak ditemukan.`)
    }

    const identity = songIdentity(video)
    const thumbnail = video.thumbnail || video.image || ''
    const [lyricsResult, coverResult] = await Promise.allSettled([
      findLyrics(identity.title, identity.artist),
      embedCover(thumbnail)
    ])
    if (lyricsResult.status === 'rejected') {
      console.error('Play3 lyrics fetch gagal:', lyricsResult.reason)
    }
    if (coverResult.status === 'rejected') {
      console.error('Play3 cover fetch gagal:', coverResult.reason)
    }
    const lyrics = lyricsResult.status === 'fulfilled' ? lyricsResult.value : null
    const cover = coverResult.status === 'fulfilled' ? coverResult.value : ''
    const data = {
      video,
      title: cleanText(lyrics?.trackName, identity.title),
      artist: cleanText(lyrics?.artistName, identity.artist),
      album: cleanText(lyrics?.albumName, 'YouTube Music'),
      cover,
      lines: lyricLines(lyrics)
    }

    try {
      await sendSpotifyCard(conn, m, data, usedPrefix)
    } catch (richError) {
      console.error('Play3 AIRich gagal:', richError)
      try {
        await sendFallback(conn, m, data, usedPrefix)
      } catch (fallbackError) {
        // Last resort: kalau list/image juga gagal, tetap kirim info lagu.
        console.error('Play3 fallback gagal:', fallbackError)
        await m.reply(`\u266b *${data.title}*\n${data.artist}\n${data.video.url}`)
      }
    }

    await m.react('✅')
  } catch (error) {
    console.error('Play3 error:', error)
    await m.react('❌')

    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    if (video) {
      // Video ketemu tapi pengiriman gagal — jangan bilang "gagal mencari".
      return m.reply(
        `\u274c Gagal menampilkan lagu *${video.title}*.\nCoba lagi sebentar atau langsung buka:\n${video.url}`
      )
    }
    return m.reply(
      timeout
        ? '❌ Pencarian lagu terlalu lama. Coba lagi sebentar.'
        : '❌ Gagal mencari lagu. Coba judul atau nama artis yang lebih lengkap.'
    )
  }
}

handler.command = ['play3']

export default handler
handler.category = 'Media'
handler.description = 'Play3'

