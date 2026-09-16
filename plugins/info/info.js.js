// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/info.js.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cara, .tutor

/* ============================================================
 INFO • CARA • TUTOR
 Command baru untuk bot Christy MD
 - .info -> Info bot & kategori fitur
 - .cara -> Cara cepat memakai bot (daftar, menu, contoh)
 - .tutor -> Tutorial lengkap cara pakai fitur per kategori

 Cara pasang:
 Taruh file ini di folder plugins/info/ lalu restart bot.

 Credit : Christy MD (Riki) - Base Nao-MD (ShirokamiRyzen)
 ============================================================ */

let handler = async (m, { usedPrefix, command }) => {
 // Ambil data dari config.js (dengan fallback supaya aman)
 const ownerNum = (global.owner && global.owner[0] && global.owner[0][0]) || '628xxxxxxxxxx'
 const ownerName = (global.owner && global.owner[0] && global.owner[0][1]) || 'Owner'
 const botName = global.namebot || 'Christy MD'
 const botVersion = global.version || '11.0.0'

 if (command === 'info') {
 const teks = `┌── 「 ɪɴꜰᴏ ʙᴏᴛ 」 ─────────
│
│ 🤖 ${botName}
│ 📌 Version : ${botVersion}
│ 👑 Owner : ${ownerName}
│ 📱 Contact : wa.me/${ownerNum}
│ 🧩 Prefix : "." atau "/"
│ 🗂️ Base : Nao-MD (ShirokamiRyzen)
│
├── 「 ᴋᴀᴛᴇɢᴏʀɪ ꜰɪᴛᴜʀ 」 ────
│
│ 🤖 AI & Chat 🎮 Game & Fun
│ 📥 Downloader ⚔️ RPG
│ 🖼️ Sticker & Image 👥 Grup
│ 🔎 Search & Info 🎵 Musik
│ 🛠️ Tools & Maker 👑 Owner
│
│ 📋 Daftar perintah lengkap :
│ ${usedPrefix}menu → menu utama
│ ${usedPrefix}menu all → semua perintah
│ ${usedPrefix}menu <nama kategori>
│
│ ❓ Cara pakai bot : ${usedPrefix}cara
│ 📖 Tutorial fitur : ${usedPrefix}tutor
│
└── 「 ${botName} 」 ─────────`
 return m.reply(teks)
 }

 if (command === 'cara') {
 const teks = `┌── 「 ᴄᴀʀᴀ ᴄᴇᴘᴀᴛ ᴘᴀᴋᴀɪ 」 ─────
│
│ 1️⃣ DAFTAR DULU (sekali saja)
│ ${usedPrefix}daftar Nama,Umur
│ Contoh : ${usedPrefix}daftar ${ownerName},18
│
│ 2️⃣ LIHAT MENU / DAFTAR PERINTAH
│ ${usedPrefix}menu
│ ${usedPrefix}menu all
│ ${usedPrefix}menu game
│
│ 3️⃣ CONTOH FITUR POPULER
│ 🎨 Stiker teks
│ ${usedPrefix}brat halo
│ ${usedPrefix}qc <teks kamu>
│ 🖼️ Foto → Stiker
│ kirim/reply foto lalu ketik :
│ ${usedPrefix}sticker
│ 🔄 Stiker → Gambar
│ reply stiker : ${usedPrefix}toimg
│ 📥 Download TikTok
│ ${usedPrefix}tiktok <link> / ${usedPrefix}tt <link>
│ 📥 Download IG
│ ${usedPrefix}ig <link>
│ 🎵 Putar & download lagu
│ ${usedPrefix}play <judul lagu>
│ ${usedPrefix}spotify <judul lagu>
│ 🤖 Chat AI
│ ${usedPrefix}ai <pertanyaan>
│ ${usedPrefix}gpt <pertanyaan>
│ 🎮 Game
│ ${usedPrefix}tebakgambar
│ ${usedPrefix}susunkata
│ ${usedPrefix}truth / ${usedPrefix}dare
│
│ 💡 Lengkap + tips : ketik ${usedPrefix}tutor
│ 📚 Info bot : ketik ${usedPrefix}info
│
└── 「 ${botName} 」 ─────────`
 return m.reply(teks)
 }

 if (command === 'tutor') {
 const teks = `┌── 「 ᴛᴜᴛᴏʀɪᴀʟ ᴘᴀᴋᴀɪ ʙᴏᴛ 」 ────
│
│ ▎SEBELUM MULAI
│ • Semua perintah pakai prefix "." atau "/"
│ • Daftar dulu : ${usedPrefix}daftar Nama,Umur
│ (kalau belum daftar, bot akan menyuruh daftar)
│
│ ▎1. STICKER & GAMBAR
│ • Foto/Video/GIF jadi stiker :
│ kirim media + caption ${usedPrefix}sticker NamaPack|Author
│ atau cukup ${usedPrefix}s
│ • Stiker teks : ${usedPrefix}brat <teks> / ${usedPrefix}qc <teks>
│ • Stiker jadi gambar : reply stiker → ${usedPrefix}toimg
│ • Hapus background : kirim foto → ${usedPrefix}removebg
│ • Upscale gambar : kirim foto → ${usedPrefix}upscale
│
│ ▎2. DOWNLOADER & MUSIK
│ • TikTok : ${usedPrefix}tiktok <link> (alias ${usedPrefix}tt)
│ • IG : ${usedPrefix}ig <link>
│ • YouTube : ${usedPrefix}ytmp4 <link> (video) / ${usedPrefix}ytmp3 <link> (audio)
│ • Cari judul : ${usedPrefix}play <judul> atau ${usedPrefix}spotify <judul>
│ • Lainnya : ${usedPrefix}mediafire <link>, ${usedPrefix}soundcloud, ${usedPrefix}aio
│
│ ▎3. AI & CHATBOT
│ • ${usedPrefix}ai / ${usedPrefix}gemini <pertanyaan>
│ • ${usedPrefix}gpt <pertanyaan>
│ • ${usedPrefix}bard <pertanyaan>
│ • ${usedPrefix}createimg <deskripsi> → bikin gambar AI
│
│ ▎4. GAME & HIBURAN
│ • ${usedPrefix}tebakgambar, ${usedPrefix}susunkata, ${usedPrefix}caklontong
│ • ${usedPrefix}truth / ${usedPrefix}dare / ${usedPrefix}truthordare
│ • ${usedPrefix}family100, ${usedPrefix}kuis
│ • ${usedPrefix}slot, ${usedPrefix}tictactoe
│
│ ▎5. RPG (untuk grup)
│ Aktifkan dulu : ${usedPrefix}enable rpg
│ Lalu coba : ${usedPrefix}bank, ${usedPrefix}kerja,
│ ${usedPrefix}inventory, ${usedPrefix}adventure, ${usedPrefix}berburu
│
│ ▎6. GRUP (khusus admin)
│ • Sambutan anggota : ${usedPrefix}setwelcome <teks>
│ • Anti link : ${usedPrefix}antilink --on (mati: --off)
│ • Hidetag : ${usedPrefix}hidetag <teks>
│ • Info grup : ${usedPrefix}groupinfo
│ • Kelola : ${usedPrefix}kick @orang, ${usedPrefix}add 62xxx,
│ ${usedPrefix}promote / ${usedPrefix}demote @orang
│
│ ▎7. TIPS AGAR BOT TIDAK LEMOT
│ • Jangan spam — beri jeda 2-3 detik antar perintah
│ • Cek koneksi : ${usedPrefix}ping
│ • Cek profil & limit : ${usedPrefix}profile
│ • Lapor error ke owner : ${usedPrefix}lapor <pesan>
│ • Lihat semua perintah : ${usedPrefix}menu all
│
│ 📚 Daftar cepat : ${usedPrefix}cara | ℹ️ Info : ${usedPrefix}info
│
└── 「 ${botName} v${botVersion} 」 ────`
 return m.reply(teks)
 }
}

handler.command = ['cara', 'tutor']
handler.category = 'Main'
handler.description = 'Info.Js'

export default handler