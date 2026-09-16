# Kredit & Asal Plugin Tambahan

Ada **300 plugin tambahan** yang diadaptasi dari paket plugin yang kamu kirim (file Drive,
base `Nakano-Miku-MD`, lisensi **GPL-3.0**). Plugin-plugin itu **tidak dikumpulkan di folder terpisah** —
semuanya ditempatkan langsung di folder plugin yang sudah ada, mengikuti jenis fiturnya.

## Sebaran folder (folder asal paket → folder plugin di project ini)

| Folder asal paket | Ditempatkan di | Jumlah | Butuh internet |
| --- | --- | --- | --- |
| `ai/` | `plugins/tools/` | 29 | 29 |
| `anime/` | `plugins/fun/` | 16 | 16 |
| `audio/` | `plugins/media/` | 2 | 1 |
| `downloader/` | `plugins/media/` | 24 | 23 |
| `fun/` | `plugins/fun/` | 30 | 6 |
| `game/` | `plugins/fun/` | 16 | 4 |
| `group/` | `plugins/group/` | 14 | 1 |
| `image/` | `plugins/image/` | 3 | 3 |
| `info/` | `plugins/info/` | 9 | 5 |
| `internet/` | `plugins/tools/` | 19 | 19 |
| `main/` | `plugins/info/` | 3 | 0 |
| `maker/` | `plugins/media/` | 5 | 5 |
| `owner/` | `plugins/owner/` | 32 | 5 |
| `quotes/` | `plugins/fun/` | 3 | 3 |
| `quran/` | `plugins/fun/` | 2 | 2 |
| `random/` | `plugins/fun/` | 8 | 8 |
| `rpg/` | `plugins/fun/` | 2 | 0 |
| `search/` | `plugins/tools/` | 7 | 7 |
| `sound/` | `plugins/media/` | 3 | 3 |
| `stalk/` | `plugins/tools/` | 5 | 5 |
| `sticker/` | `plugins/media/` | 5 | 4 |
| `tools/` | `plugins/tools/` | 59 | 42 |
| `voice/` | `plugins/media/` | 4 | 3 |

**Total**: 300 plugin, 497 nama command. 194 butuh internet, 106 jalan tanpa internet.

Rekap per folder tujuan:

- `plugins/fun/` — 77 plugin (39 di antaranya butuh internet)
- `plugins/group/` — 14 plugin (1 di antaranya butuh internet)
- `plugins/image/` — 3 plugin (3 di antaranya butuh internet)
- `plugins/info/` — 12 plugin (5 di antaranya butuh internet)
- `plugins/media/` — 43 plugin (39 di antaranya butuh internet)
- `plugins/owner/` — 32 plugin (5 di antaranya butuh internet)
- `plugins/tools/` — 119 plugin (102 di antaranya butuh internet)

## Yang diubah saat adaptasi

1. `handler.command` dari regex/array ditulis ulang menjadi daftar nama command (handler project ini
   hanya mendaftarkan command non-regex); nama yang sudah dipakai command lama dilewati.
2. Properti `handler.*` yang tidak dikenal (`tags`, `help`, `limit`, `register`, `hit`, `xp`, dst.) dibuang;
   ditambahkan `handler.category` + `handler.description` supaya ikut tampil di `.menu`.
3. `import { … } from 'baileys'` diarahkan ke `lib/baileys.js` project ini (11 plugin).
4. `import cheerio from 'cheerio'` → `import * as cheerio from 'cheerio'`.
5. Path berkas relatif (`./media/...`, `./json/...`) dihitung dari akar project.
6. Branding base lama dibersihkan; nomor kontak asing diarahkan ke nomor `creator` di `config.json`.
7. API yang tidak ada di project ini disediakan lewat `lib/compat.js` (`conn.sendFile()`, `conn.reply()`,
   `m.react()`, `participants`, `usedPrefix`, `isAdmin`/`isBotAdmin`, `global.owner`, `ArrayList.getRandom()`, dst.).

Catatan: file berikut diberi awalan `drive-` karena namanya sudah dipakai plugin bawaan:

- `plugins/tools/drive-roblox.js`

## Dependency yang ditambahkan khusus untuk plugin ini

`cheerio`, `form-data`, `similarity`, `yt-search`, `pdfkit`, `ws`, `syntax-error` — semuanya paket JavaScript
(tanpa native build), dipasang otomatis oleh `npm install`.

## Catatan lisensi

- Plugin-plugin ini berasal dari paket berlisensi **GPL-3.0** — teks lisensinya disertakan di
  `LICENSE-nakano-miku-md.txt`, atribusi penulis asli tetap ada di header tiap file.
- Karena itu bagian plugin hasil adaptasi mengikuti GPL-3.0. Kalau tidak ingin membawanya, hapus file-file
  yang diawali komentar "Plugin adaptasi dari paket plugin Nakano-Miku-MD" (daftarnya ada di
  `PLUGINS-MANIFEST.json`) — command bawaan tetap jalan penuh.

## Rincian tiap file

Daftar lengkap (file asal → file tujuan, command, kategori, butuh internet atau tidak)
ada di `PLUGINS-MANIFEST.json`.
