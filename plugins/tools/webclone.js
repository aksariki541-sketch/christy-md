// plugins/tools/webclone.mjs
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `Gunakan: ${usedPrefix}${command} <url>\nContoh: ${usedPrefix}${command} https://example.com`
    );
  }

  const targetUrl = text.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    return m.reply('❌ URL tidak valid. Harus diawali http:// atau https://');
  }

  const msg = await m.reply('⏳ Sedang clone website...');

  try {
    const endpoint = `https://api.azbry.com/api/tools/webclone?url=${encodeURIComponent(targetUrl)}`;
    const { data } = await axios.get(endpoint, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
      },
      validateStatus: () => true
    });

    if (!data?.status || !data?.result?.url) {
      await conn.sendMessage(m.chat, { delete: msg.key });
      return m.reply('❌ Gagal clone website. Coba lagi nanti.');
    }

    const { creator, source, result } = data;

    const caption = `— WEBCLONE RESULT —

❀ Creator  : ${creator}
❀ Source   : ${source}
❀ Filename : ${result.filename}
❀ URL      : ${targetUrl}`;

    await conn.sendMessage(m.chat, { delete: msg.key });
    await conn.sendMessage(
      m.chat,
      {
        document: { url: result.url },
        mimetype: 'application/zip',
        fileName: result.filename,
        caption
      },
      { quoted: m }
    );
  } catch (e) {
    await conn.sendMessage(m.chat, { delete: msg.key });
    await m.reply(`❌ Error: ${e.message}`);
  }
};

handler.help = ['webclone <url>'];
handler.tags = ['tools'];
handler.command = /^(webclone|cloneweb)$/i;
handler.premium = false;
handler.register = true;

export default handler;