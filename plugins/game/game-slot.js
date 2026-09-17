let handler = async (m, { conn, args, usedPrefix, command }) => {
    conn.slots = conn.slots || {}
    let user = global.db.data.users[m.sender]

    if (m.chat in conn.slots)
        return m.reply('🎰 Masih ada permainan slot berlangsung!')

    conn.slots[m.chat] = true

    try {
        if (!args[0] || isNaN(args[0]) || Number(args[0]) < 0)
            return m.reply(`Gunakan:\n${usedPrefix + command} <jumlah>`)

        let bet = parseInt(args[0])

        if (user.money < bet)
            throw '💸 Uang kamu tidak cukup!'

        const symbols = ['🍊', '🍇', '🍉', '🍌', '🍍']
        const sleep = ms => new Promise(r => setTimeout(r, ms))

        user.money -= bet

        let msg = await conn.sendMessage(m.chat, {
            text: '🎰 Menyalakan mesin slot...'
        }, { quoted: m })

        const editText = async (text) => {
            await conn.relayMessage(
                m.chat,
                {
                    protocolMessage: {
                        key: msg.key,
                        type: 0xe,
                        editedMessage: {
                            conversation: text
                        }
                    }
                },
                {}
            )
        }

        let r1 = pickRandom(symbols)
        let r2 = pickRandom(symbols)
        let r3 = pickRandom(symbols)

        let loading = [
            '🎰 ▫▫▫',
            '🎰 ▪▫▫',
            '🎰 ▪▪▫',
            '🎰 ▪▪▪'
        ]

        for (let frame of loading) {
            await editText(
`${frame}

🔄 Menyiapkan mesin...`
            )
            await sleep(300)
        }

        // Semua reel berputar
        for (let i = 0; i < 10; i++) {
            await editText(
`🎰 SLOT MACHINE

${pickRandom(symbols)} | ${pickRandom(symbols)} | ${pickRandom(symbols)}

🔄 Memutar...`
            )
            await sleep(150)
        }

        // Reel kiri berhenti
        for (let i = 0; i < 8; i++) {
            await editText(
`🎰 SLOT MACHINE

${r1} | ${pickRandom(symbols)} | ${pickRandom(symbols)}

🔄 Memutar...`
            )
            await sleep(150)
        }

        // Reel tengah berhenti
        for (let i = 0; i < 6; i++) {
            await editText(
`🎰 SLOT MACHINE

${r1} | ${r2} | ${pickRandom(symbols)}

🔄 Memutar...`
            )
            await sleep(150)
        }

        // Reel kanan berhenti
        await editText(
`🎰 SLOT MACHINE

${r1} | ${r2} | ${r3}

✨ Hasil keluar!`
        )

        await sleep(1000)

        let reward = 0
        let status = '❌ KALAH'

        if (r1 === r2 && r2 === r3) {
            status = '💎 BIG JACKPOT'
            reward = bet * 4
        } else if (
            r1 === r2 ||
            r2 === r3 ||
            r1 === r3
        ) {
            status = '✨ MENANG'
            reward = bet * 2
        }

        user.money += reward

        await editText(
`🎰 HASIL SLOT

${r1} | ${r2} | ${r3}

${status}
${reward ? `+${reward}` : `-${bet}`}

💰 Saldo: ${user.money}`
        )

    } catch (e) {
        m.reply(typeof e === 'string' ? e : 'Terjadi kesalahan.')
    } finally {
        delete conn.slots[m.chat]
    }
}

handler.help = ['slot <jumlah>']
handler.tags = ['game']
handler.command = /^(slot|slots|jackpot)$/i

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}