// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/tutupjam-bukajam.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: bukajam→bukajam2, tutupjam→tutupjam2, jadwal→jadwal2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bukajam2, .tutupjam2, .jadwal2

const schedules = global.groupSchedules || (global.groupSchedules = {})

setInterval(async () => {
  try {
    if (!global.conn || !global.db?.data?.chats) return

    const now = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta'
      })
    )

    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    for (const jid in global.db.data.chats) {
      const chat = global.db.data.chats[jid]
      if (!chat) continue

      try {
        if (chat.openTime === current) {
          const key = `${jid}_open_${current}`

          if (!schedules[key]) {
            schedules[key] = true

            await global.conn.groupSettingUpdate(
              jid,
              'not_announcement'
            )

            await global.conn.sendMessage(jid, {
              text: '✅ Grup telah dibuka.\nSekarang semua peserta dapat mengirim pesan.'
            })

            setTimeout(() => delete schedules[key], 60000)
          }
        }

        if (chat.closeTime === current) {
          const key = `${jid}_close_${current}`

          if (!schedules[key]) {
            schedules[key] = true

            await global.conn.groupSettingUpdate(
              jid,
              'announcement'
            )

            await global.conn.sendMessage(jid, {
              text: '✅ Grup telah ditutup.\nSekarang hanya admin yang dapat mengirim pesan.'
            })

            setTimeout(() => delete schedules[key], 60000)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  } catch (e) {
    console.error(e)
  }
}, 60000)

let handler = async (m, { text, command }) => {
  if (!global.db.data.chats[m.chat])
    global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]

  if (command === 'jadwal') {
    return m.reply(`
📅 *JADWAL OTOMATIS GRUP*

🔓 Buka Grup : ${chat.openTime || 'Belum diatur'}
🔒 Tutup Grup : ${chat.closeTime || 'Belum diatur'}
`.trim())
  }

  let [jm, mnt] = text.split(':')

  if (!jm || !mnt) {
    return m.reply(`Contoh:\n.${command} 18:00`)
  }

  jm = parseInt(jm)
  mnt = parseInt(mnt)

  if (isNaN(jm) || jm < 0 || jm > 23)
    return m.reply('❗ Jam harus antara 0 - 23')

  if (isNaN(mnt) || mnt < 0 || mnt > 59)
    return m.reply('❗ Menit harus antara 0 - 59')

  const waktu = `${String(jm).padStart(2, '0')}:${String(mnt).padStart(2, '0')}`

  if (command === 'bukajam') {
    chat.openTime = waktu
    return m.reply(`✅ Jadwal buka grup berhasil diatur ke ${waktu} WIB`)
  }

  if (command === 'tutupjam') {
    chat.closeTime = waktu
    return m.reply(`✅ Jadwal tutup grup berhasil diatur ke ${waktu} WIB`)
  }
}


handler.command = ['bukajam2', 'tutupjam2', 'jadwal2']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
handler.category = 'Group'
handler.description = 'Tutupjam-bukajam'

