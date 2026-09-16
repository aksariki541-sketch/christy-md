// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/_totalchat-listener.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : listener murni -> handler.onMessage

import fs from 'fs'



const dbPath = './lib/nakano/chat.json'



/* ================= INIT DB ================= */

const ensureDB = () => {

    if (!fs.existsSync('./lib')) {

        fs.mkdirSync('./lib', { recursive: true })

    }

    if (!fs.existsSync(dbPath)) {

        fs.writeFileSync(dbPath, JSON.stringify({}))

    }

}



/* ================= LOAD ================= */

const loadDB = () => {

    try {

        ensureDB()

        return JSON.parse(fs.readFileSync(dbPath))

    } catch {

        return {}

    }

}



/* ================= SAVE ================= */

const saveDB = (data) => {

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))

}



/* ================= LISTENER ================= */

async function before(m) {

    if (!m.isGroup) return

    if (!m.sender) return

    if (m.key.fromMe) return



    let db = loadDB()



    if (!db[m.chat]) db[m.chat] = {}

    if (!db[m.chat][m.sender]) db[m.chat][m.sender] = 0



    db[m.chat][m.sender] += 1



    saveDB(db)

}

// Dibungkus jadi plugin Christy MD: hook asli "handler.before" (dipanggil untuk
// setiap pesan di base lama) dipetakan ke hook "handler.onMessage".
const handler = async (m, ctx) => before(m, {
    conn: ctx.conn, sock: ctx.sock, plugins: ctx.plugins,
    args: ctx.args, text: ctx.text, usedPrefix: ctx.usedPrefix,
    isAdmin: ctx.isAdmin, isBotAdmin: ctx.isBotAdmin,
    isOwner: ctx.isOwner, isCreator: ctx.isCreator, isPremium: ctx.isPremium, isPrems: ctx.isPrems,
    participants: ctx.participants, groupMetadata: ctx.groupMetadata,
    user: ctx.user
})
handler.onMessage = handler

export default handler
handler.category = 'Tools'
handler.description = 'Totalchat-listener'

