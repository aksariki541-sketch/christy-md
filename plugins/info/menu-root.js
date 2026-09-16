// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/menu.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: menu→menu2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .menu2

/*
creator : riki
Christy MD
Menu HTML — pola kirim sama persis game-dino (biar work di WA)
*/

'use strict'

import { randomUUID } from 'crypto'

const BANNER = 'https://c.termai.cc/a199/0Dw0j.jpg'

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

function collect(plugins) {
  const cats = {}
  for (const p of plugins || []) {
    if (!p || p.disabled) continue
    const helps = Array.isArray(p.help) ? p.help.filter(Boolean) : p.help ? [p.help] : []
    if (!helps.length) continue
    const tags = Array.isArray(p.tags) ? p.tags.filter(Boolean) : p.tags ? [p.tags] : ['other']
    for (let t of tags) {
      t = String(t).toLowerCase().trim()
      if (!t) continue
      if (!cats[t]) cats[t] = []
      cats[t].push({
        helps,
        limit: !!p.limit,
        premium: !!p.premium,
        owner: !!p.owner,
        admin: !!p.admin,
        prefix: !p.customPrefix
      })
    }
  }
  return cats
}

function count(list = []) {
  return list.reduce((n, x) => n + (x.helps?.length || 0), 0)
}

function clock(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = n => String(n).padStart(2, '0')
  return `${p(h)}:${p(m)}:${p(sec)}`
}

/* =========================================================
 * HTML sederhana (inline style, mirip game-dino)
 * ========================================================= */

function buildHtml({
  botname, role, limit, level, exp, money,
  cats, menuType, prefix, total, version, uptime, owner, name
}) {
  const keys = Object.keys(cats).sort((a, b) => count(cats[b]) - count(cats[a]))
  const isDetail = !!(menuType && (cats[menuType] || menuType === 'all'))
  const targets = menuType === 'all' ? keys : isDetail ? [menuType] : []

  let body = ''

  if (!isDetail) {
    body = keys.map(tag => {
      const n = count(cats[tag])
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;margin:0 0 7px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:12px">
<div style="display:flex;gap:10px;align-items:center;min-width:0">
<div style="width:34px;height:34px;border-radius:10px;background:rgba(244,114,182,.18);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:16px">${icon(tag)}</div>
<div style="min-width:0">
<div style="font:700 13px Arial;color:#fff">${esc(titleCase(tag))}</div>
<div style="font:600 10px monospace;color:rgba(255,255,255,.45);margin-top:2px">${n} command</div>
</div></div>
<div style="font:700 10px monospace;color:#7dd3fc;white-space:nowrap">${esc(prefix)}menu ${esc(tag)}</div>
</div>`
    }).join('')

    body += `<div style="margin-top:10px;padding:12px;border-radius:12px;background:rgba(34,211,238,.08);border:1px solid rgba(125,211,252,.22);font:600 11px monospace;color:#bae6fd;line-height:1.5">
Ketik untuk buka kategori:<br>
<span style="color:#fff">${esc(prefix)}menu downloader</span><br>
<span style="color:#fff">${esc(prefix)}menu all</span><br>
<span style="color:#fff">${esc(prefix)}menu owner</span>
</div>`
  } else {
    const max = menuType === 'all' ? 20 : 150
    for (const tag of targets) {
      const rows = []
      for (const item of cats[tag] || []) {
        for (const cmd of item.helps) {
          const pre = item.prefix ? prefix : ''
          const flag = [
            item.premium ? 'Ⓟ' : '',
            item.limit ? 'Ⓛ' : '',
            item.owner ? 'Ⓞ' : '',
            item.admin ? 'Ⓐ' : ''
          ].filter(Boolean).join('')
          rows.push({ cmd: pre + cmd, flag })
        }
      }
      const list = rows.slice(0, max).map(r =>
        `<div style="display:flex;justify-content:space-between;gap:8px;padding:8px 10px;margin:0 0 5px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);border-radius:10px">
<span style="font:700 12px monospace;color:#e0f2fe;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.cmd)}</span>
<span style="font:800 10px Arial;color:#f9a8d4">${esc(r.flag)}</span>
</div>`
      ).join('')
      const more = rows.length > max
        ? `<div style="text-align:center;padding:6px;font:600 10px monospace;color:rgba(255,255,255,.4)">+${rows.length - max} lainnya</div>`
        : ''

      body += `<div style="margin:0 0 10px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04)">
<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 12px;background:linear-gradient(90deg,rgba(244,114,182,.16),rgba(34,211,238,.08));border-bottom:1px solid rgba(255,255,255,.1)">
<div style="font:800 13px Arial;color:#fff">${icon(tag)} ${esc(titleCase(tag))}</div>
<div style="font:800 10px monospace;color:#e2e8f0;padding:4px 8px;border-radius:999px;background:rgba(0,0,0,.28)">${rows.length}</div>
</div>
<div style="padding:8px">${list || '<div style="padding:8px;color:#888;font:600 11px monospace">kosong</div>'}${more}</div>
</div>`
    }
  }

  const headTitle = isDetail
    ? (menuType === 'all' ? 'ALL MENU' : titleCase(menuType).toUpperCase())
    : 'MAIN MENU'

  const up = clock(uptime)

  // struktur HTML mirip game-dino: body transparan + card tunggal
  return `<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;box-sizing:border-box;margin:0}</style>
<body style="margin:0;background:transparent;font-family:Arial,Helvetica,sans-serif;color:#eee">
<div style="width:100%;max-width:430px;margin:auto;padding:12px;box-sizing:border-box">
<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)">

<div style="padding:16px 16px 14px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;gap:12px;align-items:center">
<img src="${BANNER}" onerror="this.style.display='none'" style="width:48px;height:48px;border-radius:12px;object-fit:cover;border:1px solid rgba(255,255,255,.2);background:#111">
<div style="flex:1;min-width:0">
<div style="font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)">Christy MD · v${esc(version)}</div>
<div style="font-size:18px;font-weight:bold;color:#fff;margin-top:2px">${esc(botname)}</div>
</div>
<div style="text-align:right">
<div style="font-size:10px;color:rgba(255,255,255,.4)">UPTIME</div>
<div style="font-size:14px;font-weight:bold;color:#7dd3fc;font-family:monospace">${up}</div>
</div>
</div>

<div style="padding:14px 16px 6px">
<div style="font-size:11px;letter-spacing:1.2px;color:rgba(255,255,255,.45);text-transform:uppercase">${esc(isDetail ? 'detail' : `hai ${name || 'user'}`)}</div>
<div style="font-size:22px;font-weight:bold;color:#fff;margin-top:4px">${esc(headTitle)}</div>
<div style="font-size:12px;color:rgba(255,255,255,.55);margin-top:4px;font-family:monospace">owner ${esc(owner)} · prefix ${esc(prefix)}</div>
</div>

<div style="display:flex;gap:8px;padding:10px 16px 14px">
<div style="flex:1;text-align:center;padding:10px 6px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:10px;color:rgba(255,255,255,.4)">KATEGORI</div>
<div style="font-size:16px;font-weight:bold;color:#fff;margin-top:3px">${keys.length}</div>
</div>
<div style="flex:1;text-align:center;padding:10px 6px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:10px;color:rgba(255,255,255,.4)">FITUR</div>
<div style="font-size:16px;font-weight:bold;color:#fff;margin-top:3px">${total}</div>
</div>
<div style="flex:1;text-align:center;padding:10px 6px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:10px;color:rgba(255,255,255,.4)">MODE</div>
<div style="font-size:16px;font-weight:bold;color:#fff;margin-top:3px">${isDetail ? 'LIST' : 'HOME'}</div>
</div>
</div>

<div style="display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 14px">
<div style="flex:1;min-width:40%;padding:9px 10px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4);letter-spacing:1px">ROLE</div>
<div style="font:700 12px monospace;color:#fff;margin-top:3px">${esc(role)}</div>
</div>
<div style="flex:1;min-width:40%;padding:9px 10px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4);letter-spacing:1px">LIMIT</div>
<div style="font:700 12px monospace;color:#fff;margin-top:3px">${esc(String(limit))}</div>
</div>
<div style="flex:1;min-width:40%;padding:9px 10px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4);letter-spacing:1px">LEVEL / XP</div>
<div style="font:700 12px monospace;color:#fff;margin-top:3px">${esc(String(level))} · ${esc(String(exp))}</div>
</div>
<div style="flex:1;min-width:40%;padding:9px 10px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
<div style="font-size:9px;color:rgba(255,255,255,.4);letter-spacing:1px">MONEY</div>
<div style="font:700 12px monospace;color:#fff;margin-top:3px">${esc(String(money))}</div>
</div>
</div>

<div style="padding:0 16px 6px;font-size:10px;letter-spacing:1.2px;color:rgba(255,255,255,.4);text-transform:uppercase">${isDetail ? 'Commands' : 'Categories'}</div>
<div style="padding:0 16px 16px">${body}</div>

<div style="padding:10px 16px 14px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;font:600 10px monospace;color:rgba(255,255,255,.35)">
<span>Ⓟ prem · Ⓛ limit · Ⓞ owner · Ⓐ admin</span>
<span>Christy md</span>
</div>

</div>
</div>
</body>`
}

/* =========================================================
 * KIRIM — copy struktur game-dino (yang proven work)
 * ========================================================= */

async function sendGameStyleHtml(conn, chat, html, label = 'MENU') {
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
          // metadata yang sama dipakai game-dino di bot ini
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
              {
                messageType: 2,
                messageText: label
              }
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

    const plugins = Object.values(global.plugins || {}).filter(p => p && !p.disabled)
    const cats = collect(plugins)
    const keys = Object.keys(cats)
    const total = keys.reduce((n, t) => n + count(cats[t]), 0)
    const menuType = (text || '').toLowerCase().trim()

    if (menuType && menuType !== 'all' && !cats[menuType]) {
      await m.reply(
        `Kategori *${menuType}* tidak ada.\n\nContoh:\n${usedPrefix}menu\n${usedPrefix}menu all\n${usedPrefix}menu downloader\n\nAda: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}`
      )
      await m.react('❌').catch(() => {})
      return
    }

    const html = buildHtml({
      botname,
      role,
      limit,
      level: user.level || 0,
      exp: user.totalexp || user.exp || 0,
      money: user.money || 0,
      cats,
      menuType,
      prefix: usedPrefix,
      total,
      version,
      uptime: process.uptime() * 1000,
      owner,
      name
    })

    await sendGameStyleHtml(
      conn,
      m.chat,
      html,
      menuType ? `MENU · ${menuType.toUpperCase()}` : 'MENU'
    )

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[MENU]', e)
    await m.react('❌').catch(() => {})

    // fallback teks biar tetap work kalau HTML gagal total
    try {
      const plugins = Object.values(global.plugins || {}).filter(p => p && !p.disabled)
      const cats = collect(plugins)
      const keys = Object.keys(cats).sort()
      const list = keys
        .map(t => `• ${titleCase(t)} (${count(cats[t])}) → ${usedPrefix}menu ${t}`)
        .join('\n')
      await m.reply(
        `🎮 *MENU*\n\nHTML card gagal, fallback teks:\n\n${list}\n\n${usedPrefix}menu all`
      )
    } catch {
      await m.reply('Menu error: ' + (e?.message || e))
    }
  }
}

handler.command = ['menu2']

export default handler
handler.category = 'Main'
handler.description = 'Menu'

