// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/warnet.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .warnet

/*
By Alecia Md
wa.me/6287842203625
Grup/saluran: https://chat.whatsapp.com/BuORXg43p6T0cjEedoGUWO
*/
let handler = async (m, { conn, text }) => {
    let user = global.db.data.users[m.sender];

    if (!user) {
        await conn.reply(m.chat, '⚠️ Kamu belum terdaftar! Ketik `.daftar` untuk mendaftar.', m);
        return;
    }

    const games = [
        { name: '👾 Game Petualangan', cost: 50000, playTime: 10 }, // 10 menit
        { name: '🎮 Game Balap', cost: 70000, playTime: 15 }, // 15 menit
        { name: '🧩 Puzzle Challenge', cost: 30000, playTime: 5 }, // 5 menit
        { name: '🎲 Board Game', cost: 40000, playTime: 8 }, // 8 menit
        { name: '🏆 Game Olahraga', cost: 60000, playTime: 12 }, // 12 menit
        { name: '🕹️ Game Klasik', cost: 20000, playTime: 6 }, // 6 menit
        { name: '⚔️ RPG Fantasi', cost: 80000, playTime: 20 }, // 20 menit
        { name: '🎯 Battle Royale', cost: 90000, playTime: 15 }, // 15 menit
        { name: '🌍 Simulator Perkotaan', cost: 100000, playTime: 30 }, // 30 menit
        { name: '🚀 Game Ruang Angkasa', cost: 85000, playTime: 25 }, // 25 menit
        { name: '🧟‍♂️ Game Zombie', cost: 75000, playTime: 20 }, // 20 menit
        { name: '👨‍👩‍👦‍👦 Game Keluarga', cost: 40000, playTime: 10 }, // 10 menit
        { name: '🏇 Game Balapan Kuda', cost: 60000, playTime: 12 }, // 12 menit
        { name: '🥇 Game E-Sport', cost: 95000, playTime: 15 }, // 15 menit
        { name: '🎤 Karaoke Online', cost: 30000, playTime: 5 }, // 5 menit
        { name: '👨‍🚀 Simulator Astronot', cost: 120000, playTime: 40 }, // 40 menit
        { name: '🌌 Game Petualangan Luar Angkasa', cost: 110000, playTime: 35 }, // 35 menit
        { name: '🧙‍♂️ Game RPG Dungeons', cost: 90000, playTime: 25 }, // 25 menit
        { name: '🎩 Game Sulap', cost: 35000, playTime: 8 }, // 8 menit
        { name: '⚽ Game Sepak Bola', cost: 60000, playTime: 15 }, // 15 menit
        { name: '🏋️‍♂️ Game Fitness', cost: 45000, playTime: 10 }, // 10 menit
        { name: '🎵 Game Musik', cost: 30000, playTime: 5 }, // 5 menit
        { name: '🧝‍♂️ Game Fantasi', cost: 80000, playTime: 20 }, // 20 menit
        { name: '👩‍🔬 Game Simulator Ilmuwan', cost: 70000, playTime: 18 }, // 18 menit
        { name: '🚗 Game Balap Mobil', cost: 75000, playTime: 12 }, // 12 menit
        { name: '🏞️ Game Petualangan Alam', cost: 65000, playTime: 15 }, // 15 menit
        { name: '🏰 Game Membangun Kerajaan', cost: 90000, playTime: 25 }, // 25 menit
        { name: '🦸‍♂️ Game Superhero', cost: 95000, playTime: 30 }, // 30 menit
        { name: '📚 Game Edukasi', cost: 20000, playTime: 10 }, // 10 menit
        { name: '🔍 Game Detektif', cost: 40000, playTime: 15 }, // 15 menit
        { name: '🌆 Game Strategi Perkotaan', cost: 80000, playTime: 20 }, // 20 menit
        { name: '🧛‍♂️ Game Horor', cost: 75000, playTime: 20 }, // 20 menit
        { name: '🎉 Game Pesta', cost: 50000, playTime: 10 } // 10 menit
    ];

    // Menampilkan daftar permainan jika tidak ada input
    if (!text) {
        let gameList = games.map((game, i) =>
            `${i + 1}. ${game.name} - 💰 Biaya: ${game.cost} 💰, ⏳ Waktu: ${game.playTime} menit`
        ).join('\n');

        let menu = `
🖥️ *Daftar Permainan di Warnet* 🖥️

Ketik nomor permainan yang ingin kamu pilih untuk bermain:

${gameList}
`;

        // Mengirim pesan menu
        await conn.reply(m.chat, menu, m);
        return;
    }

    // Validasi input permainan
    let selectedGame = parseInt(text) - 1;

    if (!isNaN(selectedGame) && selectedGame >= 0 && selectedGame < games.length) {
        let game = games[selectedGame];

        // Cek apakah uang pengguna cukup
        if (user.money >= game.cost) {
            // Cek apakah pengguna sedang bermain
            if (user.isPlaying) {
                await conn.reply(m.chat, `⏳ Kamu sedang bermain ${user.currentGame.name}. Tunggu ${user.currentGame.playTime} menit sebelum memilih permainan lain.`, m);
                return;
            }

            // Kurangi uang pengguna
            user.money -= game.cost;

            // Set status bermain
            user.isPlaying = true;
            user.currentGame = game;

            // Kirim pesan saat mulai bermain
            await conn.reply(m.chat, `🖥️ Kamu mulai bermain ${game.name}. Waktu bermain: ${game.playTime} menit.\n💰 Biaya: ${game.cost} 💰.\n🎮 Selamat bermain!`, m);

            // Atur waktu bermain sesuai durasi permainan
            setTimeout(() => {
                user.isPlaying = false;
                user.currentGame = null;

                // Berikan imbalan setelah bermain
                let reward = Math.floor(Math.random() * 50000) + 20000; // Imbalan acak antara 20.000 dan 70.000
                user.money += reward; // Tambahkan uang ke pengguna

                // Mengirim pesan setelah waktu bermain selesai
                conn.reply(m.chat, `🎮 Waktu bermainmu di ${game.name} telah selesai!\n💰 Kamu mendapatkan imbalan: ${reward} 💰. Total uang sekarang: ${user.money} 💰.`, m);
            }, game.playTime * 60000); // Konversi menit ke milidetik
        } else {
            await conn.reply(m.chat, `❌ Uang kamu tidak cukup untuk memainkan ${game.name}. Kamu butuh ${game.cost} 💰.`, m);
        }
    } else {
        await conn.reply(m.chat, '❌ Pilihan permainan tidak valid. Silakan coba lagi dengan mengetik nomor permainan yang sesuai.', m);
    }
};

// Menandai command, tags, dan help untuk warnet
handler.command = ['warnet']

export default handler;
handler.category = 'Fun'
handler.description = 'Warnet'

