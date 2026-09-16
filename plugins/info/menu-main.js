// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/menu.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: menu→menu3
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .menu3

/*
creator : riki
Christy MD
Menu HTML — pola game-dino
- ambil SEMUA command (help + command regex/array)
- list padat biar muat di kartu WA
- pagination: .menu anime , .menu anime 2
*/

'use strict'

import { randomUUID } from 'crypto'

const BANNER = 'https://c.termai.cc/a199/0Dw0j.jpg'
const PER_PAGE = 40 // command per halaman detail (biar HTML tidak kepotong WA)

const ICONS = {
  main: '🏠', info: 'ℹ️', ai: '🧠', anime: '🌸', audio: '🎧',
  downloader: '📥', download: '📥', fun: '🎉', game: '🎮', group: '👥',
  image: '🖼️', internet: '🌐', maker: '✨', nsfw: '🔞', owner: '👑',
  panel: '🖥️', quotes: '💬', quran: '📖', random: '🎲', rpg: '⚔️',
  search: '🔎', sound: '🔊', stalk: '👤', sticker: '🎨', store: '🛒',
  tools: '🔧', voice: '🎙️', xp: '⭐', other: '📌'
}

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function titleCase(tag = '') {
  return String(tag).replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function icon(tag = '') {
  return ICONS[String(tag).toLowerCase()] || '🎵'
}

function clock(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = n => String(n).padStart(2, '0')
  return `${p(h)}:${p(m)}:${p(sec)}`
}

/** normalisasi 1 nama command dari help string */
function cleanCmd(raw = '') {
  let s = String(raw).trim()
  if (!s) return ''
  // buang keterangan usage: "animeinfo <anime>" / "ongoing [hari]" / "menu | help"
  s = s.split('|')[0].trim()
  s = s.replace(/<[^>]+>/g, '').replace(/\[[^\]]+\]/g, '').trim()
  s = s.split(/\s+/)[0] || ''
  s = s.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9_-].*$/, '')
  return s.toLowerCase()
}

/** ambil daftar command dari 1 plugin */
function extractCommands(plugin) {
  const out = new Set()

  const push = v => {
    const c = cleanCmd(v)
    if (c && c.length >= 1 && c.length <= 40) out.add(c)
  }

  // help: string | array | same-ref as command
  const help = plugin.help
  if (Array.isArray(help)) help.forEach(push)
  else if (typeof help === 'string') push(help)

  const command = plugin.command
  if (Array.isArray(command)) {
    command.forEach(push)
  } else if (command instanceof RegExp) {
    // /^(play|play2)$/i  atau  /^menu$/i
    const src = String(command.source || '')
    const group = src.match(/^\^?\(([\s\S]+?)\)\$?$/)
    if (group) {
      group[1].split('|').forEach(part => {
        const plain = part
          .replace(/\\([.^$|*+?()\[\]{}\\\/])/g, '$1')
          .replace(/[\[\]().?+*^$]/g, '')
          .trim()
        push(plain)
      })
    } else {
      const single = src
        .replace(/^\^/, '')
        .replace(/\$$/, '')
        .replace(/\\([.^$|*+?()\[\]{}\\\/])/g, '$1')
        .replace(/[\[\]().?+*^$]/g, '')
        .trim()
      push(single)
    }
  } else if (typeof command === 'string') {
    push(command)
  }

  return [...out]
}

/**
 * Bangun map:
 * cats[tag] = [{ cmd, limit, premium, owner, admin, prefix }, ...]  UNIQUE by cmd
 */
function buildCatalog(plugins) {
  const cats = {}
  const seen = {} // tag -> Set(cmd)

  for (const p of plugins || []) {
    if (!p || p.disabled) continue

    const tags = Array.isArray(p.tags)
      ? p.tags.filter(Boolean)
      : p.tags
        ? [p.tags]
        : []
    if (!tags.length) continue

    const cmds = extractCommands(p)
    if (!cmds.length) continue

    const meta = {
      limit: !!p.limit,
      premium: !!p.premium,
      owner: !!p.owner || !!p.rowner,
      admin: !!p.admin,
      prefix: !p.customPrefix
    }

    for (let tag of tags) {
      tag = String(tag).toLowerCase().trim()
      if (!tag) continue
      if (!cats[tag]) cats[tag] = []
      if (!seen[tag]) seen[tag] = new Set()

      for (const cmd of cmds) {
        if (seen[tag].has(cmd)) continue
        seen[tag].add(cmd)
        cats[tag].push({ cmd, ...meta })
      }
    }
  }

  // sort tiap kategori A-Z
  for (const tag of Object.keys(cats)) {
    cats[tag].sort((a, b) => a.cmd.localeCompare(b.cmd))
  }

  return cats
}

function flags(item) {
  return [
    item.premium ? 'Ⓟ' : '',
    item.limit ? 'Ⓛ' : '',
    item.owner ? 'Ⓞ' : '',
    item.admin ? 'Ⓐ' : ''
  ]
    .filter(Boolean)
    .join('')
}

/** hitung total command + total halaman untuk 1 kategori / all */
function pageMeta(cats, menuType, page = 1) {
  const keys = Object.keys(cats)
  let rows = []

  if (!menuType) {
    return { totalCmd: 0, totalPages: 1, page: 1, isDetail: false }
  }

  if (menuType === 'all') {
    const map = new Map()
    for (const tag of keys) {
      for (const item of cats[tag] || []) {
        if (!map.has(item.cmd)) map.set(item.cmd, item)
      }
    }
    rows = [...map.values()]
  } else {
    rows = cats[menuType] || []
  }

  const totalCmd = rows.length
  const totalPages = Math.max(1, Math.ceil(totalCmd / PER_PAGE))
  const cur = Math.min(Math.max(1, page || 1), totalPages)
  return { totalCmd, totalPages, page: cur, isDetail: true }
}

/**
 * Kirim tombol pindah halaman (nativeFlow) di bawah kartu HTML
 * format tombol sama seperti plugin yande / play di bot ini
 */
async function sendPageButtons(conn, m, {
  usedPrefix,
  menuType,
  page,
  totalPages,
  totalCmd,
  cats
}) {
  if (!menuType) {
    // HOME — tombol buka kategori populer + all
    const keys = Object.keys(cats).sort(
      (a, b) => (cats[b]?.length || 0) - (cats[a]?.length || 0)
    )
    const top = keys.slice(0, 6)
    const rows = [
      {
        title: '📚 All Menu',
        description: 'Semua command',
        id: `${usedPrefix}menu all`
      },
      ...top.map(tag => ({
        title: `${icon(tag)} ${titleCase(tag)}`,
        description: `${cats[tag]?.length || 0} command`,
        id: `${usedPrefix}menu ${tag}`
      }))
    ]

    await conn.sendMessage(
      m.chat,
      {
        text: `🎮 *Menu Navigation*\nPilih kategori di bawah, atau ketik:\n${usedPrefix}menu <kategori>`,
        footer: 'Christy MD',
        optionText: 'Pilih',
        optionTitle: 'Kategori',
        nativeFlow: [
          {
            text: '📂 Buka Kategori',
            sections: [
              {
                title: 'Kategori Menu',
                rows
              }
            ]
          }
        ]
      },
      { quoted: m }
    )
    return
  }

  // DETAIL — prev / next / home
  const base =
    menuType === 'all'
      ? `${usedPrefix}menu all`
      : `${usedPrefix}menu ${menuType}`

  const buttons = []

  if (page > 1) {
    buttons.push({
      text: `⬅️ Prev (${page - 1})`,
      id: `${base} ${page - 1}`
    })
  }

  if (page < totalPages) {
    buttons.push({
      text: `➡️ Next (${page + 1})`,
      id: `${base} ${page + 1}`
    })
  }

  buttons.push({
    text: '🏠 Home',
    id: `${usedPrefix}menu`
  })

  // kalau banyak halaman, tambah list lompat halaman
  const pageRows = []
  for (let i = 1; i <= totalPages && i <= 20; i++) {
    pageRows.push({
      title: `Halaman ${i}`,
      description:
        i === page
          ? `Sedang dibuka · ${totalCmd} cmd`
          : `Buka halaman ${i}`,
      id: i === 1 ? base : `${base} ${i}`
    })
  }

  const nativeFlow = [
    ...buttons.map(b => ({ text: b.text, id: b.id })),
    ...(totalPages > 1
      ? [
          {
            text: '📄 Loncat Halaman',
            sections: [
              {
                title: `${titleCase(menuType)} · ${totalPages} halaman`,
                rows: pageRows
              }
            ]
          }
        ]
      : [])
  ]

  await conn.sendMessage(
    m.chat,
    {
      text:
        `📄 *${titleCase(menuType)}* · halaman *${page}/${totalPages}*\n` +
        `Total *${totalCmd}* command\n\n` +
        (page < totalPages
          ? `Tekan *Next* untuk lanjut, atau:\n${base} ${page + 1}`
          : `Ini halaman terakhir.`),
      footer: 'Christy MD · menu navigation',
      optionText: 'Navigasi',
      optionTitle: 'Pindah Halaman',
      nativeFlow
    },
    { quoted: m }
  )
}

/* =========================================================
 * HTML — compact list (muat banyak command)
 * ========================================================= */

function buildHtml({
  botname, role, limit, level, exp, money,
  cats, menuType, page, prefix, version, uptime, owner, name
}) {
  const keys = Object.keys(cats).sort(
    (a, b) => (cats[b]?.length || 0) - (cats[a]?.length || 0)
  )
  const total = keys.reduce((n, t) => n + (cats[t]?.length || 0), 0)

  const isAll = menuType === 'all'
  const isDetail = !!(menuType && (cats[menuType] || isAll))

  let body = ''
  let headTitle = 'MAIN MENU'
  let sub = `hai ${name || 'user'}`
  let pageInfo = ''

  if (!isDetail) {
    // HOME — semua kategori + jumlah REAL
    body = keys
      .map(tag => {
        const n = cats[tag]?.length || 0
        return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;margin:0 0 6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px">
<div style="display:flex;gap:8px;align-items:center;min-width:0">
<div style="width:30px;height:30px;border-radius:9px;background:rgba(244,114,182,.18);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:14px">${icon(tag)}</div>
<div style="min-width:0">
<div style="font:700 12px Arial;color:#fff">${esc(titleCase(tag))}</div>
<div style="font:600 10px monospace;color:rgba(255,255,255,.45)">${n} command</div>
</div></div>
<div style="font:700 10px monospace;color:#7dd3fc;white-space:nowrap">${esc(prefix)}menu ${esc(tag)}</div>
</div>`
      })
      .join('')

    body += `<div style="margin-top:8px;padding:10px;border-radius:10px;background:rgba(34,211,238,.08);border:1px solid rgba(125,211,252,.22);font:600 11px monospace;color:#bae6fd;line-height:1.45">
Buka kategori:<br>
<span style="color:#fff">${esc(prefix)}menu anime</span><br>
<span style="color:#fff">${esc(prefix)}menu anime 2</span> <span style="color:rgba(255,255,255,.45)">(halaman)</span><br>
<span style="color:#fff">${esc(prefix)}menu all</span>
</div>`
  } else {
    // DETAIL — gabung command
    let rows = []
    const targets = isAll ? keys : [menuType]
    headTitle = isAll ? 'ALL MENU' : titleCase(menuType).toUpperCase()
    sub = isAll ? 'semua kategori' : `kategori ${titleCase(menuType)}`

    for (const tag of targets) {
      for (const item of cats[tag] || []) {
        rows.push({
          ...item,
          tag,
          label: item.prefix ? prefix + item.cmd : item.cmd
        })
      }
    }

    // unique global for "all"
    if (isAll) {
      const map = new Map()
      for (const r of rows) {
        if (!map.has(r.cmd)) map.set(r.cmd, r)
      }
      rows = [...map.values()].sort((a, b) => a.cmd.localeCompare(b.cmd))
    }

    const totalCmd = rows.length
    const totalPages = Math.max(1, Math.ceil(totalCmd / PER_PAGE))
    const cur = Math.min(Math.max(1, page || 1), totalPages)
    const start = (cur - 1) * PER_PAGE
    const slice = rows.slice(start, start + PER_PAGE)

    pageInfo = `hal ${cur}/${totalPages} · ${totalCmd} cmd`

    // list padat: 1 baris kecil per command (muat ~40+)
    const list = slice
      .map(r => {
        const f = flags(r)
        return `<div style="display:flex;justify-content:space-between;gap:6px;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,.06)">
<span style="font:700 11px/1.35 monospace;color:#e0f2fe;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.label)}</span>
<span style="font:700 9px Arial;color:#f9a8d4;white-space:nowrap">${esc(f)}</span>
</div>`
      })
      .join('')

    let nav = ''
    if (totalPages > 1) {
      nav = `<div style="margin-top:8px;padding:10px;border-radius:10px;background:rgba(244,114,182,.1);border:1px solid rgba(244,114,182,.25);font:600 11px monospace;color:#fbcfe8;line-height:1.5">
Halaman <b style="color:#fff">${cur}</b>/<b style="color:#fff">${totalPages}</b> · <b style="color:#fff">${totalCmd}</b> command<br>
<span style="color:#fff">Gunakan tombol ⬅️ Prev / ➡️ Next di bawah</span>
</div>`
    }

    body = `${isAll ? '' : `<div style="margin-bottom:8px;font:700 10px monospace;color:rgba(255,255,255,.45)">← ${esc(prefix)}menu</div>`}
<div style="border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04)">
<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 10px;background:linear-gradient(90deg,rgba(244,114,182,.16),rgba(34,211,238,.08));border-bottom:1px solid rgba(255,255,255,.1)">
<div style="font:800 12px Arial;color:#fff">${isAll ? '📚' : icon(menuType)} ${esc(headTitle)}</div>
<div style="font:700 9px monospace;color:#e2e8f0">${esc(pageInfo)}</div>
</div>
<div>${list || '<div style="padding:12px;color:#888;font:600 11px monospace">kosong</div>'}</div>
</div>
${nav}`
  }

  const up = clock(uptime)

  return `<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;box-sizing:border-box;margin:0}</style>
<body style="margin:0;background:transparent;font-family:Arial,Helvetica,sans-serif;color:#eee">
<div style="width:100%;max-width:430px;margin:auto;padding:12px;box-sizing:border-box">
<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)">

<div style="padding:14px 14px 12px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;gap:10px;align-items:center">
<img src="${BANNER}" onerror="this.style.display='none'" style="width:46px;height:46px;border-radius:12px;object-fit:cover;border:1px solid rgba(255,255,255,.2);background:#111">
<div style="flex:1;min-width:0">
<div style="font-size:10px;letter-spacing:1.4px;color:rgba(255,255,255,.45)">Christy MD · v${esc(version)}</div>
<div style="font-size:17px;font-weight:bold;color:#fff;margin-top:2px">${esc(botname)}</div>
</div>
<div style="text-align:right">
<div style="font-size:9px;color:rgba(255,255,255,.4)">UPTIME</div>
<div style="font-size:13px;font-weight:bold;color:#7dd3fc;font-family:monospace">${up}</div>
</div>
</div>

<div style="padding:12px 14px 4px">
<div style="font-size:10px;letter-spacing:1.1px;color:rgba(255,255,255,.45);text-transform:uppercase">${esc(sub)}</div>
<div style="font-size:20px;font-weight:bold;color:#fff;margin-top:3px">${esc(headTitle)}</div>
<div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:3px;font-family:monospace">owner ${esc(owner)} · ${esc(prefix)}</div>
</div>

<div style="display:flex;gap:7px;padding:10px 14px 12px">
<div style="flex:1;text-align:center;padding:8px 4px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4)">KATEGORI</div>
<div style="font-size:15px;font-weight:bold;color:#fff;margin-top:2px">${keys.length}</div>
</div>
<div style="flex:1;text-align:center;padding:8px 4px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4)">FITUR</div>
<div style="font-size:15px;font-weight:bold;color:#fff;margin-top:2px">${total}</div>
</div>
<div style="flex:1;text-align:center;padding:8px 4px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4)">MODE</div>
<div style="font-size:15px;font-weight:bold;color:#fff;margin-top:2px">${isDetail ? 'LIST' : 'HOME'}</div>
</div>
</div>

<div style="display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 12px">
<div style="flex:1;min-width:42%;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4)">ROLE</div>
<div style="font:700 12px monospace;color:#fff;margin-top:2px">${esc(role)}</div>
</div>
<div style="flex:1;min-width:42%;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4)">LIMIT</div>
<div style="font:700 12px monospace;color:#fff;margin-top:2px">${esc(String(limit))}</div>
</div>
<div style="flex:1;min-width:42%;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4)">LEVEL / XP</div>
<div style="font:700 12px monospace;color:#fff;margin-top:2px">${esc(String(level))} · ${esc(String(exp))}</div>
</div>
<div style="flex:1;min-width:42%;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4)">MONEY</div>
<div style="font:700 12px monospace;color:#fff;margin-top:2px">${esc(String(money))}</div>
</div>
</div>

<div style="padding:0 14px 14px">${body}</div>

<div style="padding:9px 14px 12px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;font:600 9px monospace;color:rgba(255,255,255,.35)">
<span>Ⓟ prem · Ⓛ limit · Ⓞ owner · Ⓐ admin</span>
<span>Christy md</span>
</div>

</div></div></body>`
}

/* =========================================================
 * SEND — pola game-dino
 * ========================================================= */

async function sendCard(conn, chat, html, label = 'MENU') {
  const responseId = randomUUID()

  await conn.relayMessage(
    chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: responseId,
          verificationMetadata: {
            proofs: [
              {
                version: 1,
                useCase: 1,
                signature:
                  'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==',
                certificateChain: [
                  'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg',
                  'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=='
                ]
              }
            ]
          }
        }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              { messageType: 2, messageText: label }
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: responseId,
                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: html,
                          trusted_sources: []
                        },
                        __typename: 'GenAISingleLayoutViewModel'
                      }
                    }
                  ]
                })
              ).toString('base64')
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: '867051314767696@bot'
              },
              forwardOrigin: 4
            }
          }
        }
      }
    },
    {}
  )
}

/* =========================================================
 * HANDLER
 * ========================================================= */

const handler = async (m, { conn, usedPrefix, text, isOwner }) => {
  try {
    await m.react('🎮').catch(() => {})

    const user = global.db?.data?.users?.[m.sender] || {}
    const botname = global.namebot || conn.user?.name || 'Christy MD'
    const owner = global.nameown || 'Riki'
    const version = global.version || '11.0.0'
    const name = m.pushName || m.name || 'user'

    const limit =
      isOwner || user.premiumTime >= 1 || user.premium
        ? '∞'
        : user.limit ?? 0
    const role = isOwner
      ? 'Owner'
      : user.premiumTime >= 1 || user.premium
        ? 'Premium'
        : user.role || 'Member'

    const plugins = Object.values(global.plugins || {}).filter(
      p => p && !p.disabled
    )
    const cats = buildCatalog(plugins)
    const keys = Object.keys(cats)

    // parse: "anime" | "anime 2" | "all" | "all 3" | "2"
    const raw = (text || '').trim().toLowerCase()
    const parts = raw.split(/\s+/).filter(Boolean)
    let menuType = ''
    let page = 1

    if (parts.length === 1) {
      if (/^\d+$/.test(parts[0])) {
        // ignore lone number on home
        menuType = ''
      } else {
        menuType = parts[0]
      }
    } else if (parts.length >= 2) {
      if (/^\d+$/.test(parts[parts.length - 1])) {
        page = Math.max(1, parseInt(parts[parts.length - 1], 10) || 1)
        menuType = parts.slice(0, -1).join(' ')
      } else {
        menuType = parts.join(' ')
      }
    }

    if (menuType && menuType !== 'all' && !cats[menuType]) {
      // coba fuzzy: tag yang mengandung
      const hit = keys.find(k => k.includes(menuType) || menuType.includes(k))
      if (hit) menuType = hit
      else {
        await m.reply(
          `Kategori *${menuType}* tidak ada.\n\nContoh:\n${usedPrefix}menu\n${usedPrefix}menu anime\n${usedPrefix}menu anime 2\n${usedPrefix}menu all\n\nAda: ${keys.slice(0, 12).join(', ')}${keys.length > 12 ? '...' : ''}`
        )
        await m.react('❌').catch(() => {})
        return
      }
    }

    const meta = pageMeta(cats, menuType, page)
    page = meta.page

    const html = buildHtml({
      botname,
      role,
      limit,
      level: user.level || 0,
      exp: user.totalexp || user.exp || 0,
      money: user.money || 0,
      cats,
      menuType,
      page,
      prefix: usedPrefix,
      version,
      uptime: process.uptime() * 1000,
      owner,
      name
    })

    const label = menuType
      ? `MENU · ${menuType.toUpperCase()}${page > 1 ? ` · ${page}` : ''}`
      : 'MENU'

    // 1) kartu HTML
    await sendCard(conn, m.chat, html, label)

    // 2) tombol pindah halaman / kategori
    try {
      await sendPageButtons(conn, m, {
        usedPrefix,
        menuType,
        page,
        totalPages: meta.totalPages,
        totalCmd: meta.totalCmd,
        cats
      })
    } catch (btnErr) {
      console.error('[MENU BUTTON]', btnErr)
      // fallback teks kalau tombol gagal
      if (menuType && meta.totalPages > 1) {
        const base =
          menuType === 'all'
            ? `${usedPrefix}menu all`
            : `${usedPrefix}menu ${menuType}`
        let tip = `📄 Halaman ${page}/${meta.totalPages}`
        if (page > 1) tip += `\n⬅️ ${base} ${page - 1}`
        if (page < meta.totalPages) tip += `\n➡️ ${base} ${page + 1}`
        tip += `\n🏠 ${usedPrefix}menu`
        await m.reply(tip)
      }
    }

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[MENU]', e)
    await m.react('❌').catch(() => {})
    try {
      const plugins = Object.values(global.plugins || {}).filter(
        p => p && !p.disabled
      )
      const cats = buildCatalog(plugins)
      const keys = Object.keys(cats).sort()
      const list = keys
        .map(t => `• ${titleCase(t)} (${cats[t].length}) → ${usedPrefix}menu ${t}`)
        .join('\n')
      await m.reply(`🎮 *MENU* (fallback)\n\n${list}\n\n${usedPrefix}menu anime 2`)
    } catch {
      await m.reply('Menu error: ' + (e?.message || e))
    }
  }
}

handler.command = ['menu3']

export default handler
handler.category = 'Main'
handler.description = 'Menu'

