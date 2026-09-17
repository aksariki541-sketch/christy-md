/**
 * =============================================================
 *  NAME       : THANKS TO / CREDITS (RICH HTML)
 *  AUTHOR     : RIKI NAKANO MIKU
 *  BASE       : Style card dari script Catur 2D (Hirara Rich Message)
 * =============================================================
 *  NOTE:
 *  - Tidak pakai prepareWAMessageMedia / jpegThumbnail lagi.
 *  - Thumbnail di-inject langsung ke HTML sebagai data URI base64.
 *  - Payload HTML dikirim sebagai GenAIaeacdsnwHtmlPrimitive (base64).
 *  - Full DOM HTML5 + SVG Vector Icon (Zero Emoji).
 *  - Watermark Terenkripsi: BY RIKI NAKANO MIKU
 * =============================================================
 */

import fs from 'fs'

/* -------------------------------------------------------------
 *  Thumbnail -> base64 data URI (opsional, aman kalau file hilang)
 * ----------------------------------------------------------- */
let thumbUri = ''
try {
	thumbUri = 'data:image/jpeg;base64,' + fs.readFileSync('./media/thumbnail.jpg').toString('base64')
} catch {
	thumbUri = ''
}

/* -------------------------------------------------------------
 *  HTML PAYLOAD
 * ----------------------------------------------------------- */
const htmlPayload = `<style>
* { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; box-sizing: border-box; }
body { margin: 0; background: #070a12; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #fff; overflow-x: hidden; }

.wrap { width: 100%; max-width: 440px; margin: auto; padding: 8px; }
.card { background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }

/* Hero */
.hero { position: relative; padding: 16px 14px 14px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); background: radial-gradient(120% 90% at 50% 0%, rgba(59,130,246,0.28) 0%, rgba(15,23,42,0.4) 60%, rgba(2,6,23,0) 100%); }
.thumb { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 14px; border: 1px solid rgba(255,255,255,0.16); box-shadow: 0 12px 30px rgba(0,0,0,0.55); display: block; margin-bottom: 12px; }
.logo-badge { width: 58px; height: 58px; margin: 0 auto 10px; border-radius: 18px; display: flex; align-items: center; justify-content: center; background: linear-gradient(140deg, #3b82f6 0%, #8b5cf6 55%, #ec4899 100%); box-shadow: 0 10px 26px rgba(59,130,246,0.45); }
.brand-sub { font-size: 8.5px; letter-spacing: 1.6px; color: #94a3b8; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 5px; margin-bottom: 4px; }
.brand-title { font-size: 22px; font-weight: 900; letter-spacing: -0.6px; color: #f8fafc; display: flex; align-items: center; justify-content: center; gap: 7px; text-shadow: 0 2px 12px rgba(0,0,0,0.55); }
.brand-desc { font-size: 11px; color: #94a3b8; margin-top: 5px; line-height: 1.5; }
.badge-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; margin-top: 11px; }
.badge { font-size: 8px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 9px; border-radius: 999px; color: #cbd5e1; background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.14); display: flex; align-items: center; gap: 4px; }
.badge.on { color: #bfdbfe; border-color: rgba(59,130,246,0.5); background: rgba(59,130,246,0.16); }

/* Section */
.section { padding: 12px 12px 4px; }
.sec-head { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; }
.sec-bar { width: 3px; height: 14px; border-radius: 3px; background: linear-gradient(180deg, #3b82f6, #8b5cf6); }
.sec-title { font-size: 10px; font-weight: 900; letter-spacing: 1.4px; color: #e2e8f0; text-transform: uppercase; }

/* Row item */
.item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 13px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.09); margin-bottom: 7px; }
.item.hi { background: linear-gradient(120deg, rgba(59,130,246,0.22) 0%, rgba(139,92,246,0.16) 100%); border-color: rgba(59,130,246,0.42); box-shadow: 0 6px 18px rgba(59,130,246,0.18); }
.avatar { flex: 0 0 auto; width: 34px; height: 34px; border-radius: 11px; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.85); border: 1px solid rgba(255,255,255,0.14); color: #93c5fd; }
.item.hi .avatar { color: #fff; background: rgba(59,130,246,0.35); border-color: rgba(147,197,253,0.55); }
.meta { flex: 1 1 auto; min-width: 0; }
.name { font-size: 12.5px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.2px; }
.role { font-size: 9.5px; color: #94a3b8; margin-top: 2px; font-weight: 600; letter-spacing: 0.3px; }
.tag { font-size: 7.5px; font-weight: 900; letter-spacing: 0.7px; text-transform: uppercase; padding: 3px 7px; border-radius: 999px; color: #fde68a; background: rgba(250,204,21,0.14); border: 1px solid rgba(250,204,21,0.35); }

/* Footer */
.foot { padding: 14px 12px 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); background: linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(30,41,59,0.65) 100%); }
.foot-title { font-size: 12px; font-weight: 900; letter-spacing: 1.6px; color: #f8fafc; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 6px; }
.foot-sub { font-size: 9.5px; color: #94a3b8; margin-top: 6px; letter-spacing: 0.6px; }
.mark { font-size: 7.5px; color: #475569; margin-top: 10px; letter-spacing: 1.3px; font-weight: 800; text-transform: uppercase; }
@keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(59,130,246,0.5); } 50% { box-shadow: 0 0 20px rgba(139,92,246,0.85); } }
.card { animation: glow 3.6s ease-in-out infinite; }
</style>

<body>
<div class="wrap">
  <div class="card">

    <div class="hero">
      ${thumbUri ? `<img class="thumb" src="${thumbUri}" alt="Christy MD">` : `<div class="logo-badge">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </div>`}
      <div class="brand-sub">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
        CREDITS &amp; SPECIAL THANKS
      </div>
      <div class="brand-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#facc15"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
        CHRISTY MD
      </div>
      <div class="brand-desc">Terima kasih untuk semua pihak yang sudah<br>membantu perkembangan bot ini</div>
      <div class="badge-row">
        <span class="badge on">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          WHATSAPP BOT
        </span>
        <span class="badge">BAILEYS</span>
        <span class="badge">NODE.JS</span>
      </div>
    </div>

    <div class="section">
      <div class="sec-head">
        <div class="sec-bar"></div>
        <div class="sec-title">Developer</div>
      </div>
      <div class="item hi">
        <div class="avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="meta">
          <div class="name">Riki</div>
          <div class="role">Developer &bull; Owner</div>
        </div>
        <span class="tag">Owner</span>
      </div>
      <div class="item">
        <div class="avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M8 13h.01M16 13h.01M9 16.5h6"/></svg>
        </div>
        <div class="meta">
          <div class="name">ChatGPT</div>
          <div class="role">AI Assistant</div>
        </div>
        <span class="tag">AI</span>
      </div>
    </div>

    <div class="section">
      <div class="sec-head">
        <div class="sec-bar"></div>
        <div class="sec-title">Service</div>
      </div>
      <div class="item">
        <div class="avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10a6 6 0 1 0-12 0"/><path d="M5 10h14v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/></svg>
        </div>
        <div class="meta">
          <div class="name">Penyedia Layanan API</div>
          <div class="role">Endpoint &bull; Scraper &bull; Utility</div>
        </div>
      </div>
      <div class="item">
        <div class="avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></svg>
        </div>
        <div class="meta">
          <div class="name">Penyedia Server / VPS</div>
          <div class="role">Hosting &bull; Panel &bull; Runtime</div>
        </div>
      </div>
    </div>

    <div class="section" style="padding-bottom: 10px;">
      <div class="sec-head">
        <div class="sec-bar"></div>
        <div class="sec-title">Special Thanks</div>
      </div>
      <div class="item">
        <div class="avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="meta">
          <div class="name">Semua Supporter</div>
          <div class="role">Yang selalu mendukung project ini</div>
        </div>
      </div>
      <div class="item">
        <div class="avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </div>
        <div class="meta">
          <div class="name">Semua User Christy MD</div>
          <div class="role">Pengguna setia bot ini</div>
        </div>
      </div>
    </div>

    <div class="foot">
      <div class="foot-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#facc15"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
        THANK YOU FOR SUPPORT
      </div>
      <div class="foot-sub">CHRISTY MD &bull; RIKI</div>
      <div class="mark">BY RIKI NAKANO MIKU</div>
    </div>

  </div>
</div>
</body>`;

/* -------------------------------------------------------------
 *  FALLBACK TEKS (kalau rich message gagal dikirim)
 * ----------------------------------------------------------- */
const teks = `
╭━━━━━━━━━━━━━━━━━━╮
       *CHRISTY MD*
   ✦ DEVELOPER & CREDITS ✦
╰━━━━━━━━━━━━━━━━━━╯

┌─「 DEVELOPER 」
│
│ ❯ Riki
│    Developer • Owner
│
│ ❯ ChatGPT
│    AI Assistant
│
└──────────────────

┌─「 SERVICE 」
│
│ ❯ Penyedia Layanan API
│ ❯ Penyedia Server / VPS
│
└──────────────────

┌─「 SPECIAL THANKS 」
│
│ ❯ Semua Supporter
│ ❯ Semua User Christy MD
│
└──────────────────

╭━━━━━━━━━━━━━━━━━━╮
   *THANK YOU FOR SUPPORT*
      CHRISTY MD • RIKI
╰━━━━━━━━━━━━━━━━━━╯
`.trim()

const handler = async (m, { conn, sock }) => {
	const client = conn || sock

	/* payload HTML -> base64 */
	const encoded = Buffer.from(JSON.stringify({
		"response_id": "tqto-" + Date.now(),
		"sections": [
			{
				"view_model": {
					"primitive": {
						"__typename": "GenAIaeacdsnwHtmlPrimitive",
						"payload": htmlPayload,
						"trusted_sources": [
							"hirara.dev"
						]
					},
					"__typename": "GenAISingleLayoutViewModel"
				}
			}
		]
	})).toString('base64')

	try {
		await client.relayMessage(
			m.chat,
			{
				messageContextInfo: {
					deviceListMetadata: {},
					deviceListMetadataVersion: 2,
					botMetadata: {
						messageDisclaimerText: "",
						botResponseId: "tqto-" + Date.now(),
						verificationMetadata: {
							proofs: [
								{
									version: 1,
									useCase: 1,
									signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
									certificateChain: [
										"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"
									]
								}
							]
						}
					}
				},
				botForwardedMessage: {
					message: {
						richResponseMessage: {
							messageType: 1,
							submessages: [
								{
									messageType: 2,
									messageText: "Christy MD • Credits"
								}
							],
							unifiedResponse: {
								data: encoded
							},
							contextInfo: {
								forwardingScore: 1,
								isForwarded: true,
								forwardedAiBotMessageInfo: {
									botJid: "867051314767696@bot"
								},
								forwardOrigin: 4
							}
						}
					}
				}
			},
			{ quoted: m }
		)
	} catch (e) {
		/* fallback kalau relayMessage error (misal fork tidak support rich message) */
		await client.sendMessage(m.chat, {
			text: teks
		}, { quoted: m })
	}
}

handler.help = ['tqto']
handler.tags = ['info']
handler.category = 'info'
handler.description = 'Developer, credits, service & special thanks (Rich HTML Card)'
handler.command = /^(tqto|thanks|credit|credits)$/i

export default handler