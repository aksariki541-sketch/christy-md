import fs from 'fs'

let handler = async (m, { conn }) => {
  await conn.sendMessage(
    m.chat,
    {
      orderText: `Hai kak! 👋

❏ Script *christy md* tersedia di channel berikut.

✿ *\`Channel\`* :
https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I`,
      thumbnail: fs.readFileSync('./media/thumbnail.jpg')
    },
    { quoted: m }
  )
}

handler.help = ['sc', 'script']
handler.tags = ['info']
handler.command = /^(sc|script)$/i

export default handler