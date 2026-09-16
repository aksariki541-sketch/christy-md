// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/trackip.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .trackip, .iptrack

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} google.com
${usedPrefix + command} openai.com`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/tools/trackip?target=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Gagal melacak IP.')
    }

    const r = data.result

    const caption = `   *Track IP*

✿ IP : ${r.ip}
✿ Country : ${r.country} (${r.country_code})
✿ Region : ${r.region_name} (${r.region})
✿ City : ${r.city}
✿ ZIP : ${r.zip}
✿ Timezone : ${r.timezone}
✿ ISP : ${r.isp}
✿ Organization : ${r.org}
✿ AS : ${r.as}
✿ Latitude : ${r.latitude}
✿ Longitude : ${r.longitude}`

    await m.react('✅')
    m.reply(caption)
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.command = ['trackip', 'iptrack']

export default handler
handler.category = 'Tools'
handler.description = 'Trackip'

