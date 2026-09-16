# Christy MD

WhatsApp Bot berbasis Node.js ESM + Baileys.

Modern · Clean · Futuristic — bot WhatsApp modular dengan **806 command aktif** yang dibangun dari
sistem plugin berbasis file. Setiap file `.js` di dalam folder `plugins/` otomatis dipindai dan
dijadikan command. Semua kode memakai ES Modules (`"type": "module"`).

> Sebagian besar fitur berjalan **tanpa API key pihak ketiga** — pengolahan teks, matematika,
> tanggal, gambar/sticker, manajemen grup, catatan, todo, dan game semuanya diproses lokal di server.

---

## Fitur Utama

### Inti
- **Login pairing code** (default, kode `CHRISTY`) atau **QR code** — tinggal ubah satu baris.
- **Auto reconnect** saat koneksi terputus, kecuali sesi logout.
- **Plugin system ESM** dengan pemindaian folder `plugins/` secara rekursif.
- **Hot reload plugin**: file yang ditambah/diubah langsung dimuat ulang lewat `fs.watch`, tanpa restart.
- **Command handler multi-prefix**: `.` `#` `!` `/` (bisa diubah dari chat dengan `.setprefix`).
- **Custom prefix plugin**: pemicu tanpa prefix — `=>` (eval), `$` (shell), dan kata kunci `bail`/`baileys`/`npm`.
- **Sistem hak akses** berlapis: Creator, Owner, Premium (data di `database/*.json`).
- **Mode bot** `public` / `self`, bisa diganti dari chat.
- **Tema tampilan terpusat** (`lib/ui.js`): banner, menu, dan semua kartu balasan memakai satu bahasa visual.
- **Status AFK** (`.afk <alasan>`): orang yang menandai/membalas pesanmu otomatis diberi tahu alasan + durasinya,
  dan status dicabut sendiri begitu kamu mengirim pesan lagi.

### Kategori Fitur

| Kategori | Command | Fitur | Cakupan |
| --- | --- | --- | --- |
| Main | 21 | 3 | Menu, info bot, statistik, identitas, runtime |
| System | 4 | 1 | Monitor server realtime (kartu HTML: CPU, RAM, disk, uptime) |
| Media & Gambar | 41 | 2 | Sticker, filter gambar, resize/compress, thumbnail, meme, konversi audio/video/GIF |
| Tools | 150 | 11 | Teks, encoding, hash, kalkulator, konversi satuan, waktu, jaringan, catatan, todo, warna |
| Group | 30 | 1 | Info grup, admin, tag, kick/promote, link, pengaturan grup |
| Fun | 34 | 2 | Dadu, koin, slot, RPS, truth/dare, roast, zodiak, game tebak angka |
| Owner | 29 | 9 | Ubah identitas/config bot, reload, broadcast, kelola owner & premium |
| **Total** | **309** | **29** | |

### Tampilan Menu

`.menu` memakai gaya **neon glass**: kotak garis, judul **bold**, label small caps, daftar perintah
**satu baris satu perintah** (lurus ke bawah, tidak dipadatkan menyamping):

```
╭━━━━━━━━━━━━━━━━━━━━━━━╮
   ⌁ 𝗰𝗵𝗿𝗶𝘀𝘁𝘆 𝗺𝗱 ⌁
   ◈  ᴍᴏᴅᴇʀɴ • ᴄʟᴇᴀɴ • ꜰᴜᴛᴜʀɪꜱᴛɪᴄ
╰━━━━━━━━━━━━━━━━━━━━━━━╯

➤ hai, Riki ✦
   selamat malam — waktunya recharge ⌁

╭─ ◈ ɪᴅᴇɴᴛɪᴛᴀꜱ
│ ▸ Status   ✦ Owner ♛
│ ▸ Mode     ✦ 🌐 Public
│ ▸ Prefix   ✦ .  #  !  /
│ ▸ Uptime   ✦ 1s
╰━━━━━━━━━━━━━━━━━━━━━━━━

╭─ ◈ ꜱɪꜱᴛᴇᴍ
│ ▸ Jam      ✦ 21:56 WITA
│ ▸ Tanggal  ✦ Rab, 16 Sep 2026
│ ▸ Kategori ✦ 7
│ ▸ Perintah ✦ 806
╰━━━━━━━━━━━━━━━━━━━━━━━━━

⌁ ᴋᴀᴛᴇɢᴏʀɪ ᴛᴇʀꜱᴇᴅɪᴀ
   ▸ 🧿 ᴍᴀɪɴ              ✦ 40 perintah
   ▸ 📡 ꜱʏꜱᴛᴇᴍ            ✦ 4 perintah
   ▸ 🛰️ ᴍᴇᴅɪᴀ & ɢᴀᴍʙᴀʀ    ✦ 133 perintah
   ▸ 🔩 ᴛᴏᴏʟꜱ             ✦ 349 perintah
   ▸ 🛡️ ɢʀᴏᴜᴘ             ✦ 56 perintah
   ▸ 🕹️ ꜰᴜɴ               ✦ 150 perintah
   ▸ ♛ ᴏᴡɴᴇʀ             ✦ 74 perintah

▰ ketik *.menu all* atau pakai tombol di bawah ✦ v1.0.0
```

`.menu <kategori>` menampilkan daftar lengkap, juga satu per baris — `✦` untuk command utama,
`▸` untuk alias:

```
╭━━━━━━━━━━━━━━━━━━━━━╮
   ⌁ 𝗱𝗶𝗿𝗲𝗸𝘁𝗼𝗿𝗶 ⌁
   ◈  ᴛᴏᴏʟꜱ ✦ 349 perintah
╰━━━━━━━━━━━━━━━━━━━━━╯

╭── 🔩 ᴛᴏᴏʟꜱ ── 349 perintah
│ ◈ Kalkulator & matematika
│   ✦ .calc
│   ▸ .math
│   ▸ .hitung
│   ▸ .percent
│   ▸ .discount
│   ▸ .prime
│   ▸ .factor
│   ▸ .fib
│   ▸ .fibonacci
│   … +7 alias lain
│
│ ◈ 8 perintah lainnya
│   ✦ .ht
│   ✦ .linkgrup
│   ✦ .opentime
╰────────────────────

▰ prefix *. * ✦ diracik oleh Riki Aksa
```

| Perintah | Yang ditampilkan |
| --- | --- |
| `.menu` | Kotak brand + sapaan + blok identitas & sistem + daftar kategori (**801 karakter / 32 baris**) |
| `.menu tools` | Kotak direktori berisi seluruh fitur kategori itu; **satu plugin = satu blok**, command & aliasnya tepat di bawah judul plugin itu |
| `.menu all` | Semua command + alias, semua plugin, satu per baris |
| `.menu naga` | Kategori tidak ada → pesan rapi berisi daftar kategori yang valid |

Tombolnya:

- **◈ Lihat Kategori** — single-select: bagian `✦ 7 kategori ✦` (memilihnya langsung mengirim `.menu <kategori>`)
  dan bagian `⌁ ᴀᴋꜱɪ ᴄᴇᴘᴀᴛ ⌁` (Ping, Statistik, Identitas, Script).
- **▰ Semua Perintah** — mengirim `.menu all`.
- **📡 Ping** — monitor server.

Di dalam `.menu <kategori>` / `.menu all`, label utamanya berubah jadi **◈ Beranda** (balik ke menu utama).

Catatan: jam, tanggal, dan sapaan mengikuti **`timezone` di `config.json`** (default `Asia/Makassar`,
ditampilkan sebagai WITA). Ubah ke `Asia/Jakarta` (WIB) atau `Asia/Jayapura` (WIT) kalau perlu.

### Plugin tambahan (menyatu di folder yang sudah ada)

Selain command bawaan, ada **300 plugin tambahan** hasil adaptasi paket plugin yang kamu kirim (Drive, base
`Nakano-Miku-MD`, lisensi GPL-3.0). Plugin itu **tidak dikumpulkan di folder terpisah** — ditempatkan langsung
di folder plugin yang sudah ada sesuai jenis fiturnya, jadi di `plugins/` tinggal terlihat rapi per fungsi.
Total command jadi **806**.

| Folder plugin | Isi adaptasi | Contoh command |
| --- | --- | --- |
| `plugins/tools/` | +119 plugin (ai, internet, search, stalk, store) | `.deepseek`, `.cekresi`, `.translate`, `.nik` |
| `plugins/fun/` | +77 (fun, game, anime, quotes, quran, random, rpg) | `.apakah`, `.akinator`, `.tetris`, `.tebakgame` |
| `plugins/media/` | +43 (downloader, sticker, maker, sound, voice, audio) | `.tiktok`, `.instagram`, `.capcut`, `.sprem` |
| `plugins/owner/` | +32 alat bantu pemilik bot | `.sendch`, `.upstik`, `.listpc`, `.opromote` |
| `plugins/group/` | +14 alat bantu grup | `.ht` (hidetag), `.polling`, `.totalchat` |
| `plugins/info/` | +12 info tambahan | `.tqto` (kredit), `.order`, `.ceksn` |
| `plugins/image/` | +3 olah gambar | `.hitamkan`, `.img2img` |

Yang perlu kamu tahu soal plugin ini:

- **Base-nya beda, jadi disesuaikan dulu.** Format `handler.command` diubah ke daftar nama (command yang
  namanya sudah dipakai dibiarkan milik command lama), properti `handler.*` yang tidak dikenal dibuang,
  kategori & deskripsi ditambahkan, dan branding base lama dibersihkan dari teks yang tampil ke pengguna.
- **Import `'baileys'` diarahkan ke `lib/baileys.js`** project ini (11 plugin) — tetap memakai fork yang sama,
  bukan menambah dependency Baileys kedua.
- **API base lama disediakan lewat `lib/compat.js`** — `conn.sendFile()`, `conn.reply()`, `m.react()`,
  `usedPrefix`, `participants`, `isAdmin`/`isBotAdmin`, `global.owner`, `Array.getRandom()`, dan sejenisnya.
- **194 plugin butuh internet**, **106 jalan tanpa internet**. Kalau endpoint pihak ketiga mati, plugin membalas
  pesan error yang jelas — bukan diam.
- **7 dependency baru**: `cheerio`, `form-data`, `similarity`, `yt-search`, `pdfkit`, `ws`, `syntax-error`
  (semuanya JavaScript murni, dipasang otomatis oleh `npm install`).
- **Kontak pemilik** di dalam plugin itu diarahkan ke nomor `creator` di `config.json`.
- **Mau menghapus?** Hapus file yang diawali komentar "Plugin adaptasi dari paket plugin Nakano-Miku-MD"
  (daftarnya ada di `PLUGINS-MANIFEST.json`) — command bawaan tetap jalan seperti biasa.

### Hal teknis yang perlu diketahui
- **Monitor server (`.ping`) menampilkan data asli** — CPU load rata-rata per core, pemakaian RAM,
  disk, swap, dan IP lokal dibaca langsung dari sistem (bukan angka acak).
- **`.meme`** menempelkan teks ke gambar lewat SVG. Butuh font sistem (`fontconfig` + DejaVu).
  Kalau server tidak punya font, bot membalas pesan error yang jelas — bukan diam saja.
- **Konversi media (`.toaudio`, `.tovideo`, `.togif`, `.mediaframe`)** memakai `ffmpeg`.
  Bot mencari binary di PATH, lalu otomatis memakai binary bawaan dependency `@ffmpeg-installer/ffmpeg`
  kalau tidak ada. Bisa juga diarahkan manual lewat env `FFMPEG_PATH`.

---

## Requirement

- **Node.js 20+** (diuji pada Node.js v20.20.2)
- **npm** 10+
- **ffmpeg** — opsional. Hanya untuk fitur konversi media; kalau tidak ada, bot otomatis memakai
  binary bawaan dependency.
- Koneksi internet untuk login WhatsApp dan fitur jaringan (`.dns`, `.fetch`, `.pubip`).

---

## Instalasi

```bash
git clone <url-repository-kamu>   # atau ekstrak folder project ini
cd christy-md
npm install
```

## Konfigurasi

Semua konfigurasi utama ada di `config.json`:

```json
{
  "botName": "Christy MD",
  "ownerName": "Riki Aksa",
  "botVersion": "1.0.0",
  "tagline": "Modern • Clean • Futuristic",
  "timezone": "Asia/Makassar",
  "creator": ["6283134600805"],
  "prefix": [".", "#", "!", "/"],
  "botMode": "public",
  "pairingCode": "CHRISTY",
  "accessDenied": {
    "owner": "Fitur ini khusus Owner.",
    "creator": "Fitur ini khusus Creator.",
    "premium": "Fitur ini khusus Premium."
  }
}
```

| Field | Keterangan |
| --- | --- |
| `botName` | Nama bot — dipakai di banner, menu, kartu ping, dan credit |
| `ownerName` | Nama creator yang tampil di menu dan credit |
| `botVersion` / `tagline` | Identitas versi & tagline di tampilan |
| `timezone` | Zona waktu untuk jam, tanggal, dan sapaan di menu (default `Asia/Makassar`) |
| `creator` | Nomor creator (akses penuh, tidak bisa dicabut lewat command) |
| `prefix` | Daftar prefix command |
| `botMode` | `public` (semua orang) atau `self` (hanya owner) |
| `pairingCode` | Kode pairing saat login (default `CHRISTY`) |
| `accessDenied` | Pesan saat user tidak punya hak akses |

Sebagian besar nilai ini bisa diubah **langsung dari WhatsApp** tanpa edit file:

```
.setname Christy MD        setowner Riki Aksa       .settagline <tagline>
.setprefix .#!             .setpairing CHRISTY      .config
```

Database JSON di folder `database/`:

- `owner.json` — daftar owner tambahan (diisi `.addowner`)
- `premium.json` — daftar user premium (diisi `.addprem`)
- `notes.json`, `todo.json`, `games.json` — dibuat otomatis oleh fitur catatan/todo/game

---

## Menjalankan Bot

```bash
npm start
```

Saat pertama kali berjalan:

1. Bot menampilkan banner identitas + ringkasan konfigurasi.
2. Bot meminta **nomor WhatsApp** (format internasional, contoh `628xxx`).
3. Bot menampilkan **PAIRING CODE** di terminal.
4. Buka WhatsApp → **Perangkat Tertaut** → **Tautkan perangkat** → **Tautkan dengan nomor telepon**,
   lalu masukkan kode tersebut.

Sesi tersimpan di folder `session/`. Selama folder itu ada, bot tidak minta login lagi.
Ingin login ulang? Hapus folder `session/` lalu jalankan bot kembali.

### Login via QR Code

```js
// index.js
const usePairingCode = false
```

---

## Struktur Folder

```
christy-md/
├── config.json            # Identitas & konfigurasi bot
├── index.js               # Entry point: koneksi, pairing/QR, banner, auto reconnect
├── handler.js             # Plugin loader + command handler (prefix, customPrefix, hak akses)
├── package.json
├── database/
│   ├── owner.json         # Owner tambahan
│   ├── premium.json       # User premium
│   └── (notes|todo|games).json   # Dibuat otomatis oleh fitur terkait
├── scripts/
│   └── check.js           # Pemeriksa project (npm run check)
├── lib/
│   ├── baileys.js         # Re-export Baileys (lihat catatan dependency)
│   ├── ui.js              # Tema tampilan: banner, header, kartu, kredit, palet warna
│   ├── media.js           # Download/konversi media untuk plugin
│   ├── store.js           # Penyimpanan JSON aman (tulis-temp lalu rename)
│   ├── converter.js       # Konversi media berbasis ffmpeg
│   ├── myfunc.js          # Helper umum + parser pesan (smsg, runtime, tanggal)
│   ├── color.js           # Helper warna log terminal
│   └── ping.html          # Template kartu server monitor
├── media/
│   ├── thumb.jpg          # Thumbnail menu (artwork Christy MD)
│   └── thumb-legacy.jpg   # Thumbnail lama, disimpan sebagai cadangan
├── plugins/
│   ├── menu/              # .menu / .help (dibangun otomatis dari plugin terdaftar)
│   ├── info/              # .info, .stats, .id, .sysinfo, dll
│   ├── ping/              # .ping (kartu monitor HTML)
│   ├── script/            # .sc
│   ├── text/              # case, encoding, transform, hash
│   ├── math/              # calc, convert
│   ├── time/              # waktu, kalender, umur, countdown
│   ├── image/             # sticker, filter, meme, info gambar
│   ├── media/             # konversi audio/video/GIF
│   ├── group/             # manajemen grup
│   ├── fun/               # hiburan & game
│   ├── notes/             # catatan
│   ├── todo/              # checklist
│   ├── tools/             # jaringan & warna
│   ├── owner/             # panel owner, add/del owner & premium
│   └── shell/             # eval & shell (khusus owner)
├── json/                  # Data pendukung beberapa plugin (tebakgame, jadwaltv)
├── CREDITS-PLUGINS.md     # Asal-usul & lisensi 300 plugin hasil adaptasi
├── PLUGINS-MANIFEST.json  # Rincian tiap plugin hasil adaptasi
├── LICENSE-nakano-miku-md.txt   # Teks lisensi GPL-3.0 paket plugin asal
└── session/               # Dibuat otomatis saat login (jangan di-commit)
```

---

## Daftar Command

Dokumen di bawah ini dihasilkan otomatis dari registry plugin, jadi selalu cocok dengan kode.

**29 baris command inti (bagian bawaan project)**

### Main

| Command | Alias | Akses | Keterangan |
| --- | --- | --- | --- |
| `.info` | .botinfo, .runtime, .uptime, .sysinfo, .stats, .plugins, .pluginlist, .id, .whoami, .groupid, .chatid, .speed, .latency, .source, .credit | semua | Informasi bot, sistem, dan statistik |
| `.menu` | .help | semua | Menu utama bot (bisa .menu <kategori>) |
| `.sc` | .script, .getsc | semua | Info script & aturan pemakaian |

### System

| Command | Alias | Akses | Keterangan |
| --- | --- | --- | --- |
| `.ping` | .pinglive, .serverinfo, .monitor | semua | Monitor server secara realtime |

### Media

| Command | Alias | Akses | Keterangan |
| --- | --- | --- | --- |
| `.sticker` | .stiker, .toimg, .toimage, .imgresize, .imgscale, .grayscale, .greyscale, .invert, .invertimg, .blur, .sharpen, .brighten, .brightness, .darken, .saturate, .sepia, .vintage, .rotate, .flip, .mirror, .compress, .imgthumb, .thumbnail, .imgtojpg, .imgtopng, .meme, .imginfo, .imageinfo, .dominant, .dominantcolor | semua | Edit gambar, sticker, filter, meme, info gambar |
| `.toaudio` | .tomp3, .tovideo, .tomp4, .tovoice, .todoc, .tofile, .togif, .mediaframe, .mediainfo | semua | Konversi audio/video/GIF & info media (butuh ffmpeg) |

### Tools

| Command | Alias | Akses | Keterangan |
| --- | --- | --- | --- |
| `.b64e` | .base64encode, .b64d, .base64decode, .urlencode, .urldecode, .morse, .unmorse, .rot13, .hex, .tohex, .unhex, .fromhex, .binary, .tobinary, .unbinary, .frombinary | semua | Encode & decode (Base64, URL, Morse, Hex, Biner, ROT13) |
| `.calc` | .math, .hitung, .percent, .discount, .prime, .factor, .fib, .fibonacci, .gcd, .lcm, .sqrt, .pow, .round, .mean, .statistik | semua | Kalkulator & matematika |
| `.ctof` | .ftoc, .kmmi, .mikm, .kglb, .lbkg, .cmtoin, .intocm, .mtokm, .kmtom, .ltoml, .mltol, .mstokmh, .kmhtoms, .gbmb, .mbgb, .bytes, .size, .kalkonversi, .convertlist | semua | Konversi satuan (suhu, jarak, berat, data) |
| `.dns` | .pinghost, .portcheck, .ip, .myip, .pubip, .publicip, .fetch, .geturl, .httpstatus, .statuscode, .resolvemx, .revdns, .reversedns | semua | Jaringan: DNS, cek koneksi, fetch URL, IP |
| `.md5` | .sha1, .sha256, .sha512, .hash, .uuid, .password, .passgen, .randnum, .randnumber, .randstr, .randtext, .lorem | semua | Hash, UUID, generator password, random |
| `.note` | .savenote, .addnote, .getnote, .lihatnote, .delnote, .hapusnote, .listnote, .notes, .clearnote, .hapussemua, .searchnote | semua | Catatan sederhana per chat/grup |
| `.randomcolor` | .warna, .hexrgb, .hexinfo, .rgbhex, .colorname | semua | Warna: acak, konversi HEX/RGB/HSL |
| `.slug` | .slugify, .camel, .pascal, .snake, .kebab, .trim, .jsonpretty, .jsonmin, .sortlines, .uniq, .dedup, .lines, .replace, .split | semua | Transformasi teks & format data |
| `.time` | .jam, .date, .tanggal, .calendar, .kalender, .timestamp, .unix, .age, .umur, .diffdate, .selisih, .countdown, .hitungmundur, .week, .minggu | semua | Waktu, tanggal, kalender, dan hitungan hari |
| `.todo` | .addtodo, .todolist, .mytodo, .tododone, .done, .tododel, .deltodo, .todoclear, .cleartodo, .todostats | semua | Checklist tugas sederhana |
| `.upper` | .lower, .capitalize, .title, .swapcase, .reverse, .revwords, .repeat, .count, .charcount | semua | Mengubah dan menghitung teks |

### Group

| Command | Alias | Akses | Keterangan |
| --- | --- | --- | --- |
| `.groupinfo` | .listadmin, .adminlist, .listmember, .anggota, .tagall, .hidetag, .linkgc, .gclink, .revoke, .resetlink, .promote, .demote, .kick, .remove, .adduser, .addmember, .leave, .keluar, .groupname, .setgcname, .groupdesc, .setdesc, .open, .groupopen, .close, .groupclose, .setppgc, .groupicon, .groupstats | semua | Manajemen grup (info, admin, tag, kick, setting) |

### Fun

| Command | Alias | Akses | Keterangan |
| --- | --- | --- | --- |
| `.dice` | .dadu, .coin, .koin, .slot, .rps, .8ball, .tanya, .truth, .dare, .roast, .compliment, .pujian, .pickup, .rate, .ship, .fact, .fakta, .joke, .lelucon, .motivasi, .quote, .kutipan, .zodiac, .zodiak, .shio, .randommember | semua | Hiburan, random, truth/dare, zodiak |
| `.tebakangka` | .guess, .tebak, .nyerah, .giveup, .gamescore, .skor | semua | Game tebak angka |

### Owner

| Command | Alias | Akses | Keterangan |
| --- | --- | --- | --- |
| `=> eval` | — | owner | Evaluasi kode JavaScript |
| `$ shell` | — | owner | Menjalankan perintah shell |
| `.addowner` | .addown | creator | Menambah owner baru |
| `.addprem` | .addpremium | creator | Menambah user premium |
| `.delowner` | .delown | creator | Menghapus owner |
| `.delprem` | .delpremium | creator | Menghapus user premium |
| `.public` | — | owner | Mengubah mode bot ke public |
| `.self` | — | owner | Mengubah mode bot ke self |
| `.setname` | .setowner, .settagline, .setprefix, .setpairing, .setconfig, .config, .getconfig, .reload, .reloadplugin, .restart, .reboot, .broadcast, .bc, .cleandb, .resetdb, .session | owner | Panel owner: ubah identitas & config bot (.setname = nama bot) |

Itu baru command inti. **497 nama command lain** dari plugin hasil adaptasi tersebar di folder plugin yang
sama — daftar lengkapnya bisa dibuka langsung di chat dengan `.menu` (ringkasan) atau `.menu all`
(semuanya), dan rincian per file ada di `PLUGINS-MANIFEST.json`.

---

## Menambah Plugin

Buat file baru di `plugins/` (boleh di sub-folder mana pun) dan export handler sebagai default:

```js
let handler = async (m, { conn, args, text, prefix, command, notifReply, plugins }) => {
    await notifReply('halo dunia', 'Judul Kartu')   // otomatis berformat kartu
}

handler.command = ['halo']            // dipanggil dengan .halo / #halo / !halo / /halo
handler.category = 'Tools'            // kategori di menu
handler.description = 'Contoh plugin' // muncul di menu & dokumentasi
handler.usage = '<nama>'              // opsional, tampil di menu
// handler.customPrefix = /^\.\?/     // opsional: pemicu tanpa prefix
// handler.owner = true               // opsional: hanya owner (atau .creator/.premium)
// handler.hidden = true              // opsional: sembunyikan dari menu

// opsional: ikut memproses SETIAP pesan, bukan hanya saat command dipanggil
// (dipakai fitur AFK untuk mencabut status & memberi tahu orang yang menandai)
handler.onMessage = async (m, { conn }) => {
    // jangan balas pesannya sendiri
    if (m.fromMe) return
    // ...
}

export default handler
```

Parameter handler: `conn` (socket Baileys), `args`, `text`, `prefix`, `command` (alias yang dipakai),
`notifReply(text, title)`, dan `plugins` (registry plugin aktif).

Helper siap pakai: `lib/ui.js` (tampilan), `lib/media.js` (gambar/audio), `lib/store.js` (penyimpanan),
`lib/myfunc.js` (runtime, tanggal, parse mention, admin grup).

Catatan soal `handler.onMessage`: handler memanggilnya untuk setiap pesan yang masuk (sebelum command
dijalankan), satu plugin satu pemanggilan per pesan. Pesan mention ada di
`m.msg.contextInfo.mentionedJid` dan pesan yang dibalas di `m.quoted` — waktu membaca database sebaiknya
di-cache (lihat `plugins/tools/afk.js`) supaya tidak membaca file di setiap pesan.

---

## Mengecek Project & Troubleshooting

### Cek kesehatan project

```bash
npm run check
```

Skrip ini memeriksa: semua file `.js` bisa di-parse, semua `.json` valid, semua import internal
menunjuk file yang benar, dan **semua nama yang di-import benar-benar ada di file tujuannya**.
Jalankan setiap kali selesai upload ke hosting/panel.

### Error: "does not provide an export named '...'"

```
SyntaxError: The requested module '../../lib/ui.js' does not provide an export named 'divider'
    at async loadPlugin (handler.js:33)
```

**Artinya:** file yang di-import belum ikut ter-update. Paling sering terjadi ketika hanya sebagian
file yang di-upload — misalnya `plugins/menu/menu.js` sudah versi baru, tapi `lib/ui.js` masih versi lama.

**Cara memperbaiki:**

1. Upload ulang **seluruh isi project** (bukan hanya file yang baru diubah), terutama folder `lib/`.
2. Jangan hapus `config.json`, `database/`, dan `session/` milikmu — timpa hanya file kode.
3. Jalankan `npm run check` untuk memastikan tidak ada yang tertinggal.
4. Jalankan ulang bot: `npm start`.

Bot juga mencetak petunjuk ini otomatis di console saat sebuah plugin gagal dimuat, dan plugin lain
tetap berjalan normal — jadi satu file yang belum ter-update tidak mematikan seluruh bot.

### Memastikan semua file ter-upload

File yang **wajib** ada di folder project:

```
config.json   index.js   handler.js   package.json
lib/          media/     plugins/     scripts/
```

Folder `lib/` berisi 8 file (`ui.js`, `media.js`, `store.js`, `baileys.js`, `myfunc.js`,
`converter.js`, `color.js`, `ping.html`). Kalau salah satu hilang atau beda versi, `npm run check`
akan menunjukkannya.

---

## Catatan tentang Dependency Baileys

`package.json` memakai alias:

```json
"@whiskeysockets/baileys": "npm:noxleyss@latest"
```

Alias ini **sengaja dipertahankan apa adanya** karena fork inilah yang menyediakan fitur
button/interactive message yang dipakai bot. Jangan mengganti paketnya kecuali kamu memang
berencana migrasi ke Baileys resmi dan menyesuaikan seluruh plugin.

Fork tersebut mencetak banner promosi miliknya sendiri ke terminal setiap kali di-import. Agar
tampilan startup tetap bersih, semua modul inti mengimpor Baileys lewat `lib/baileys.js` yang
menahan keluaran console hanya selama proses import — paket dependency-nya sendiri tidak diubah.
Kalau ingin banner paket tetap tampil:

```bash
BAILEYS_SHOW_BANNER=1 npm start
```

---

## Catatan Penggunaan

- **Jangan commit atau bagikan folder `session/`** — isinya kredensial login WhatsApp.
  `.gitignore` sudah mengecualikannya.
- Plugin `=>` (eval), `$` (shell), `.broadcast`, `.cleandb`, dan seluruh kategori Owner memberi
  akses luas ke server. Batasi jumlah owner dan jangan jalankan bot di server dengan kredensial sensitif.
- `.restart` menghentikan proses (`exit 0`). Kalau dijalankan lewat PM2/systemd, bot menyala otomatis;
  kalau manual, jalankan `npm start` lagi.
- Sebagian dependency di `package.json` (`fs`, `os`, `util`, `readline`) tidak dibutuhkan karena Node
  sudah menyediakannya sebagai modul bawaan. Dibiarkan agar struktur dependency tetap sama seperti aslinya.
- Bot ini memakai protokol WhatsApp tidak resmi (Baileys). Gunakan dengan risiko sendiri dan jangan
  dipakai untuk spam atau aktivitas yang melanggar ketentuan WhatsApp.

---

## Lisensi

MIT.
