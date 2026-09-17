let handler = async (m) => {
  const christy = `*\`christy-md\`*

✿ *\`Status\`* : Online.
✿ *\`Info\`* : Ketik *.menu* untuk melihat semua fitur.

Lagi nemenin kamu di bawah cahaya bulan... ada yang bisa kubantu? 🌙`

  m.reply(christy)
}

handler.customPrefix = /^(tes|bot|christy|christybot|test)$/i
handler.command = new RegExp

export default handler
