/**
 * Fitur    : GitHub stalk
 * Type     : Plugins ESM
 * Creator  : Riki
 * Channel  : https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
 */

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `${usedPrefix}${command} username`

  try {
    let res = await fetch(`https://api.github.com/users/${text}`)
    let json = await res.json()

    m.reply(`👤 ${json.login}
📦 Repo: ${json.public_repos}
👥 Followers: ${json.followers}
🔗 ${json.html_url}`)
  } catch {
    throw 'Error'
  }
}

handler.help = ['ghstalk']
handler.tags = ['tools']
handler.command = /^ghstalk$/i
handler.limit = true

export default handler