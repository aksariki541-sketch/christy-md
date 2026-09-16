// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/mining.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .mining

const cooldown = 300000
let handler = async (m, { usedPrefix }) => {
    try {
        // Inisialisasi user DB kalau belum ada
        let user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {
            money: 0,
            health: 100,
            lastkerja: 0,
            lastsda: 0,
            lastrampok: 0,
            lastmining: 0,
            exp: 0,
            pickaxe: 1,
            pickaxedurability: 100,
            trash: 0,
            string: 0,
            rock: 0,
            iron: 0,
            emerald: 0,
            common: 0,
            uncommon: 0,
            mythic: 0,
            legendary: 0,
            gold: 0,
            diamond: 0
        }

        let timers = cooldown - (new Date - user.lastmining)
        if (user.health < 80) return m.reply(`ʏᴏᴜʀ ʜᴇᴀʟᴛʜ ɪs ʙᴇʟᴏᴡ 80﹗\nᴩʟᴇᴀsᴇ ʜᴇᴀʟ ❤ ғɪʀsᴛ ᴛᴏ *ᴍɪɴɪɴɢ* ᴀɢᴀɪɴ.`.trim())
        if (user.pickaxe == 0) return m.reply('Mau mining ga punya pickaxe 🗿')
        if (new Date - user.lastmining <= cooldown) return m.reply(`
You're already mining!! Please wait *🕐${clockString(timers)}*
`.trim())

        const rewards = reward(user)
        let text = 'You\'ve been mining and lost'
        for (const lost in rewards.lost) if (user[lost]) {
            const total = Array.isArray(rewards.lost[lost]) ? rewards.lost[lost].getRandom() : rewards.lost[lost]
            user[lost] -= total * 1
            if (total) text += `\n*${global.rpg.emoticon(lost)}${lost}:* ${total}`
        }
        text += '\n\nBut you got'
        for (const rewardItem in rewards.reward) if (rewardItem in user) {
            const total = Array.isArray(rewards.reward[rewardItem]) ? rewards.reward[rewardItem].getRandom() : rewards.reward[rewardItem]
            user[rewardItem] += total * 1
            if (total) text += `\n*${global.rpg.emoticon(rewardItem)}${rewardItem}:* ${total}`
        }
        m.reply(text.trim())
        user.lastmining = new Date * 1
    } catch (e) {
        throw 'Terjadi Kesalahan...'
    }
}
handler.command = ['mining']
handler.group = true
export default handler

function reward(user = {}) {
    return {
        reward: {
            exp: [100, 200, 300],
            trash: [50, 75, 100],
            string: [10, 20, 30],
            rock: [10, 15, 20],
            iron: [5, 10, 15],
            emerald: [0, 1, 2],
            common: [1, 5, 10],
            uncommon: [0, 2, 4],
            mythic: [0, 1, 2],
            legendary: [0, 0, 1],
            gold: [0, 1, 2],
            diamond: [0, 1, 2],
        },
        lost: {
            health: [10, 20, 30],
            pickaxedurability: [5, 10, 15]
        }
    }
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
handler.category = 'Fun'
handler.description = 'Mining'

