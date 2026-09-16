// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/imgprompt.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: imgprompt→imgprompt2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .imgprompt2

// • Image to prompt 
// • Type : Plugins ESM 
// • Scrape : https://whatsapp.com/channel/0029VbAwMQz5a240uWauNY13/180
// • Author : Riki 
import axios from "axios"
import FormData from "form-data"
import fs from "fs"

let handler = async (m, { conn }) => {
  let q = m.quoted?.mimetype ? m.quoted : m
  if (!q.mimetype?.includes("image")) return conn.reply(m.chat, "🍭 Kirim atau reply gambar!", m)

  let img = await q.download?.()
  if (!img) return conn.reply(m.chat, "🍬 Gagal ambil gambar", m)

  try {
    const form = new FormData()
    form.append("file", img, "img.jpg")

    const res = await axios.post("https://be.neuralframes.com/clip_interrogate/", form, {
      headers: {
        ...form.getHeaders(),
        "Authorization": "Bearer uvcKfXuj6Ygncs6tiSJ6VXLxoapJdjQ3EEsSIt45Zm+vsl8qcLAAOrnnGWYBccx4sbEaQtCr416jxvc/zJNAlcDjLYjfHfHzPpfJ00l05h0oy7twPKzZrO4xSB+YGrmCyb/zOduHh1l9ogFPg/3aeSsz+wZYL9nlXfXdvCqDIP9bLcQMHiUKB0UCGuew2oRt",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
        "Referer": "https://www.neuralframes.com/tools/image-to-prompt"
      }
    })

    conn.reply(m.chat, res.data?.caption || res.data?.prompt || "🍬 Tidak ada prompt ditemukan", m)
  } catch (e) {
    conn.reply(m.chat, "❌ Yahh error: " + e.message, m)
  }
}

handler.command = ['imgprompt2']

export default handler
handler.category = 'Tools'
handler.description = 'Imgprompt'

