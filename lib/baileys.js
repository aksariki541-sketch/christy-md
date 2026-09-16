// lib/baileys.js
//
// Semua modul inti project ini mengambil Baileys dari file ini, bukan langsung dari
// '@whiskeysockets/baileys'.
//
// Alasan: paket Baileys yang dipakai project ini (alias npm di package.json) mencetak
// banner promosi miliknya sendiri ke console pada saat pertama kali di-import
// (lihat node_modules/@whiskeysockets/baileys/lib/index.js). Banner tersebut berisi
// nama developer pihak ketiga sehingga tidak relevan dengan identitas project ini.
//
// Yang dilakukan file ini hanya menahan keluaran console SELAMA proses import paket
// berlangsung, lalu dikembalikan seperti semula. Paket dependency-nya sendiri tidak
// diubah sedikit pun, dan alias dependency di package.json tetap dipertahankan.
//
// Ingin banner paket tetap tampil? Jalankan dengan env BAILEYS_SHOW_BANNER=1.

const silencePackageBanner = process.env.BAILEYS_SHOW_BANNER !== '1'

let baileys

if (silencePackageBanner) {
    const originalLog = console.log
    console.log = () => {}
    try {
        baileys = await import('@whiskeysockets/baileys')
    } finally {
        console.log = originalLog
    }
} else {
    baileys = await import('@whiskeysockets/baileys')
}

export const {
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
    jidDecode,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    makeWASocket,
    jidNormalizedUser,
    getContentType,
    areJidsSameUser,
    generateWAMessage,
    generateWAMessageFromContent,
    generateWAMessageContent,
    getImageProcessingLibrary,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    downloadMediaMessage,
    toBuffer,
    delay,
    proto
} = baileys

export default baileys
