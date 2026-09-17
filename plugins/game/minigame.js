/**
 * ══════════════════════════════════════════════════════════════
 *  MINIGAME — Termai Arcade (plugin Christy-MD)
 * ──────────────────────────────────────────────────────────────
 *  Sumber data : https://termai.cc/minigame  (SEMUA game)
 *  Diambil dari Raw JSON API yg dipakai halaman itu
 *  (halamannya render client-side, HTML-nya kosong):
 *    https://api.termai.cc/api/games/minigames?key=...
 *
 *  • Daftar game dikumpulkan dalam 1 TOMBOL LIST
 *    (ketuk tombol → pilih game → langsung dimainkan)
 *  • SEMUA game dikirim sebagai HTML in-chat, jadi game
 *    langsung muncul & bisa dimainkan di dalam WhatsApp.
 *    Kalau gagal render, otomatis dikirim sebagai link.
 *
 *  Perintah:
 *    .minigame list [hal]       → semua game (10/halaman)
 *    .minigame <judul> [-pN]    → cari, cth: .minigame ninja -p2
 *    .minigame category         → daftar kategori + jumlah
 *    .minigame category <nama>  → filter per kategori
 *    .minigame play <judul>     → mainkan / detail game
 *    .minigame stats            → statistik katalog
 *    .minigame refresh          → paksa update cache
 *
 *  Override API (opsional, taruh di config.js):
 *    global.minigameApiBase = 'https://api.termai.cc'
 *    global.minigameApiKey  = 'Bell409'
 * ══════════════════════════════════════════════════════════════
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sendInteractiveButtons, singleSelectButton } from '../../lib/interactiveButtons.js';

/* ── Konfigurasi ─────────────────────────────────────────────── */
const SOURCE_PAGE = 'https://termai.cc/minigame';
const API_PATH = '/api/games/minigames';
const DEFAULT_API_BASE = 'https://api.termai.cc';
const DEFAULT_API_KEY = 'Bell409'; // key publik yg tertera di halaman /minigame
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit
const PAGE_SIZE = 10;
const FETCH_TIMEOUT_MS = 30_000;
const MAX_HTML_BYTES = 3_000_000;

const apiBase = () => global.minigameApiBase || DEFAULT_API_BASE;
const apiKey = () => global.minigameApiKey || DEFAULT_API_KEY;

/* ── Cache (memori + file) ───────────────────────────────────── */
const cacheFile = resolve(process.cwd(), 'db/data/minigames.json');
const cache = { data: null, expiresAt: 0, pending: null };

function normalizeCatalog(json) {
  if (!json || Array.isArray(json) || typeof json !== 'object') {
    throw new Error('Format data minigame tidak valid');
  }
  return Object.entries(json).map(([slug, item = {}]) => ({
    ...item,
    _id: item._id || slug,
    slug: item.slug || slug,
    title: item.title || slug,
    description: item.description || item.desc || '',
    category: item.category || 'Others',
    tags: Array.isArray(item.tags) ? item.tags : []
  }));
}

async function readCacheFile() {
  try {
    return normalizeCatalog(JSON.parse(await readFile(cacheFile, 'utf8')));
  } catch {
    return null;
  }
}

async function writeCacheFile(json) {
  try {
    await mkdir(dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, JSON.stringify(json));
  } catch (err) {
    console.warn('[minigame] gagal tulis cache:', err?.message);
  }
}

async function fetchWithTimeout(url, { timeoutMs = FETCH_TIMEOUT_MS, headers } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error('Request API timeout')), timeoutMs);
  try {
    return await fetch(url, { headers, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function getApiUrl() {
  const url = new URL(API_PATH, apiBase());
  url.searchParams.set('key', apiKey());
  return url;
}

async function fetchCatalog() {
  const res = await fetchWithTimeout(getApiUrl(), {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }
  });
  if (res.status === 429 && cache.data) {
    console.warn('[minigame] 429 rate-limit → pakai cache lama');
    return cache.data;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Request gagal (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const data = normalizeCatalog(json);
  await writeCacheFile(json);
  return data;
}

async function getCatalog(force = false) {
  if (!cache.data) {
    cache.data = await readCacheFile();
    if (cache.data) cache.expiresAt = Date.now() + CACHE_TTL_MS;
  }
  if (!force && cache.data && Date.now() < cache.expiresAt) return cache.data;
  if (cache.pending) return cache.pending;
  cache.pending = (async () => {
    try {
      const data = await fetchCatalog();
      cache.data = data;
      cache.expiresAt = Date.now() + CACHE_TTL_MS;
      return data;
    } catch (err) {
      if (cache.data) {
        console.warn('[minigame] API gagal → pakai cache:', err?.message);
        return cache.data;
      }
      throw err;
    }
  })();
  try {
    return await cache.pending;
  } finally {
    cache.pending = null;
  }
}

/* ── Helper ──────────────────────────────────────────────────── */
const fmtNum = (n) => Number(n || 0).toLocaleString('id-ID');
const badge = (item) => (item.web_view ? '🌐' : '💬');

function extractPage(text) {
  const str = String(text || '');
  const m = str.match(/\s+(?:-p|hal(?:aman)?|page)\s*(\d+)\s*$/i);
  if (!m) return { text: str.trim(), page: 1 };
  return { text: str.slice(0, m.index).trim(), page: Math.max(1, Number.parseInt(m[1], 10) || 1) };
}

function searchable(item) {
  return [item.title, item.slug, item.category, item.author, item.credits, item.description, ...(item.tags || [])]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
}

function formatDetail(item) {
  const lines = [
    `*🎮 ${item.title}*`,
    '',
    item.description || 'Tidak ada deskripsi.',
    '',
    `Kategori : ${item.category || '-'}`,
    `Pembuat  : ${item.author || '-'}`
  ];
  if (item.credits) lines.push(`Credits  : ${item.credits}`);
  if (item.channel) lines.push(`Channel  : ${item.channel}`);
  if (item.tags?.length) lines.push(`Tag      : ${item.tags.join(', ')}`);
  lines.push(`Slug     : ${item.slug}`);
  return lines.join('\n');
}

/* ── Mainkan game: SELALU sebagai HTML in-chat ───────────────── */
async function sendDetail(m, client, item) {
  const text = formatDetail(item);
  if (!item.url) return m.reply(text);

  try {
    const res = await fetchWithTimeout(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const announced = Number(res.headers.get('content-length') || 0);
    if (announced && announced > MAX_HTML_BYTES) throw new Error('Ukuran game terlalu besar');
    const payload = await res.text();
    if (!payload || payload.length > MAX_HTML_BYTES) throw new Error('Ukuran game tidak valid');
    if (!client?.relayMessage) throw new Error('relayMessage tidak tersedia');

    await client.relayMessage(
      m.chat,
      {
        botForwardedMessage: {
          message: {
            richResponseMessage: {
              messageType: 1,
              submessages: [{ messageType: 2, messageText: `${item.title} — Termai Arcade` }],
              unifiedResponse: {
                data: Buffer.from(
                  JSON.stringify({
                    __typename: 'GenAIUnifiedResponse',
                    response_id: randomUUID(),
                    sections: [
                      {
                        __typename: 'GenAIUnifiedResponseSection',
                        view_model: {
                          __typename: 'GenAISingleLayoutViewModel',
                          primitive: {
                            __typename: 'FOAHtmlPrimitiveDemoDONOTUSE',
                            trusted_sources: [],
                            payload
                          }
                        }
                      }
                    ]
                  })
                ).toString('base64')
              },
              contextInfo: { isForwarded: true, forwardOrigin: 4 }
            }
          }
        }
      },
      {}
    );
  } catch (err) {
    console.warn('[minigame] kirim HTML gagal, kirim link:', err?.message);
    await m.reply(`${text}\n\n🔗 Mainkan: ${item.url}`);
  }
}

/* ── Daftar game dalam 1 TOMBOL LIST (+ fallback teks) ───────── */
async function pagedReply(m, client, { items, page, prefix, heading, pageCmd }) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const slice = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const start = (safePage - 1) * PAGE_SIZE;

  const sections = [
    {
      title: '🎮 Daftar Minigame',
      rows: slice.map((item, i) => ({
        title: `${start + i + 1}. ${item.title}`,
        description: `${badge(item)} ${item.category} • ${item.author || 'Termai'}`,
        id: `${prefix}minigame play ${item.slug}`
      }))
    }
  ];
  if (totalPages > 1) {
    const nav = [];
    if (safePage > 1) {
      nav.push({ title: '⬅ Halaman sebelumnya', description: `Ke halaman ${safePage - 1}`, id: pageCmd(safePage - 1) });
    }
    if (safePage < totalPages) {
      nav.push({ title: '➡ Halaman berikutnya', description: `Ke halaman ${safePage + 1}`, id: pageCmd(safePage + 1) });
    }
    sections.push({ title: '📄 Navigasi', rows: nav });
  }

  const pageInfo = totalPages > 1 ? ` • Hal ${safePage}/${totalPages}` : '';
  try {
    await sendInteractiveButtons(client, m.chat, {
      body: `${heading}\nTotal: ${fmtNum(items.length)} game${pageInfo}`,
      footer: `Ketuk tombol di bawah untuk memilih game${pageInfo}`,
      header: { title: '', subtitle: '', hasMediaAttachment: false },
      buttons: singleSelectButton(sections, '🎮 Pilih Minigame'),
      quoted: m
    });
  } catch (err) {
    console.warn('[minigame] tombol list gagal, pakai teks:', err?.message);
    const lines = slice.map((item, i) => {
      const n = start + i + 1;
      return `*${n}. ${item.title}*\n${badge(item)} ${item.category} • Oleh: ${item.author || '-'}\n▶ ${prefix}minigame play ${item.slug}`;
    });
    const nav =
      totalPages > 1
        ? `\n\n📄 Halaman ${safePage}/${totalPages}\n` +
          (safePage < totalPages ? `➡ ${pageCmd(safePage + 1)}` : 'Akhir daftar ✅') +
          (safePage > 1 ? `\n⬅ ${pageCmd(safePage - 1)}` : '')
        : '';
    await m.reply(`${heading}\nTotal: ${fmtNum(items.length)} game\n\n${lines.join('\n\n')}${nav}`);
  }
}

/* ── Handler (konvensi Christy-MD) ───────────────────────── */
const handler = async (m, { conn, sock, text, usedPrefix }) => {
  const client = conn || sock;
  const prefix = usedPrefix || '.';
  const raw = String(text || '').trim();
  const usage =
    `*🎮 MINIGAME — Termai Arcade*\n` +
    `Sumber: ${SOURCE_PAGE}\n\n` +
    `• ${prefix}minigame list [hal]\n` +
    `• ${prefix}minigame <judul> [-pN]\n` +
    `• ${prefix}minigame category\n` +
    `• ${prefix}minigame category <nama>\n` +
    `• ${prefix}minigame play <judul/slug>\n` +
    `• ${prefix}minigame stats\n` +
    `• ${prefix}minigame refresh\n\n` +
    `Contoh: ${prefix}minigame ninja`;

  if (!raw || /^(?:help|--help|menu)$/i.test(raw)) return m.reply(usage);

  await m.reply(global.wait || '⏳ Tunggu sebentar...');

  try {
    // — refresh paksa —
    if (/^(?:refresh|update|-r|--refresh|muat-ulang)$/i.test(raw)) {
      const data = await getCatalog(true);
      return m.reply(
        `✅ Data minigame diperbarui (${fmtNum(data.length)} game).\n` +
          `Ketik ${prefix}minigame list untuk melihat daftar.`
      );
    }

    const catalog = await getCatalog();

    // — statistik —
    if (/^(?:stats?|statistik)$/i.test(raw)) {
      const counts = {};
      for (const g of catalog) counts[g.category] = (counts[g.category] || 0) + 1;
      const perCat = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([c, n]) => `• ${c}: ${fmtNum(n)}`)
        .join('\n');
      return m.reply(
        `*📊 STATS MINIGAME*\n\n` +
          `Total game : ${fmtNum(catalog.length)}\n` +
          `Semua game langsung dimainkan di chat 💬\n\n` +
          `*Per kategori:*\n${perCat}\n\n` +
          `Sumber: ${SOURCE_PAGE}`
      );
    }

    // — kategori —
    const catArg = raw.match(/^(?:category|kategori|cat)(?:\s+(.*))?$/is);
    if (catArg) {
      const { text: name, page } = extractPage(catArg[1] || '');
      if (!name) {
        const counts = {};
        for (const g of catalog) counts[g.category] = (counts[g.category] || 0) + 1;
        const list = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([c, n]) => `• ${c} (${fmtNum(n)})`)
          .join('\n');
        return m.reply(
          `*📁 KATEGORI MINIGAME*\n\n${list}\n\n` +
            `Lihat isi: ${prefix}minigame category <nama>\n` +
            `Contoh: ${prefix}minigame category psp`
        );
      }
      const key = name.toLowerCase();
      let result = catalog.filter((g) => String(g.category).toLowerCase() === key);
      if (!result.length) result = catalog.filter((g) => String(g.category).toLowerCase().includes(key));
      if (result.length) {
        return pagedReply(m, client, {
          items: result,
          page,
          prefix,
          heading: `*📁 KATEGORI: ${result[0].category}*`,
          pageCmd: (n) => `${prefix}minigame category ${name} -p${n}`
        });
      }
      // bukan nama kategori → lanjut sebagai pencarian biasa
    }

    // — list semua —
    const listArg = raw.match(/^(?:list|all|semua)(?:\s+(\d+))?$/i);
    if (listArg) {
      const page = Math.max(1, Number.parseInt(listArg[1] || '1', 10));
      return pagedReply(m, client, {
        items: catalog,
        page,
        prefix,
        heading: '*🎮 DAFTAR MINIGAME*',
        pageCmd: (n) => `${prefix}minigame list ${n}`
      });
    }

    // — play by judul/slug —
    const playArg = raw.match(/^(?:play|main(?:kan)?|info|detail|open|buka)\s+(.+)$/is);
    if (playArg) {
      const target = playArg[1].trim().toLowerCase();
      const item =
        catalog.find((g) => g.slug.toLowerCase() === target || String(g._id).toLowerCase() === target) ||
        catalog.find((g) => g.title.toLowerCase() === target) ||
        catalog.find((g) => searchable(g).includes(target));
      if (!item) return m.reply(`Minigame "${playArg[1].trim()}" tidak ditemukan.`);
      return sendDetail(m, client, item);
    }

    // — cari —
    const { text: keyword, page } = extractPage(raw);
    const key = keyword.toLowerCase();
    const found = catalog.filter((g) => searchable(g).includes(key));
    if (!found.length) return m.reply(`Minigame "${keyword}" tidak ditemukan.`);
    if (found.length === 1 && page === 1) return sendDetail(m, client, found[0]);
    return pagedReply(m, client, {
      items: found,
      page,
      prefix,
      heading: `*🔎 HASIL: ${keyword}*`,
      pageCmd: (n) => `${prefix}minigame ${keyword} -p${n}`
    });
  } catch (err) {
    console.error('[minigame error]', err);
    await m.reply(`Gagal mengambil data minigame.\n${global.eror || ''}\n${err?.message || err}`);
  }
};

handler.help = ['minigame <judul> | list | category | play | stats | refresh'];
handler.tags = ['game'];
handler.category = 'game';
handler.description = 'Cari & mainkan semua minigame Termai Arcade langsung di chat (termai.cc/minigame)';
handler.command = ['minigame', 'minigames'];

export default handler;
