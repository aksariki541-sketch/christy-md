/**
 * ══════════════════════════════════════════════════════════════
 *  interactiveButtons.js
 *  Helper pesan tombol interaktif (native flow) untuk fork
 *  Baileys yang dipakai Christy-MD (@itsliaaa/baileys).
 *
 *  Ekspor:
 *   • singleSelectButton(sections, buttonTitle)
 *       Membentuk SATU tombol list (single_select).
 *   • sendInteractiveButtons(conn, chat, opts)
 *       Mengirim pesan list interaktif lewat conn.sendMessage.
 *
 *  Format sections:
 *   [
 *     {
 *       title: 'Judul Section',
 *       rows: [ { title, description, id } ]
 *     }
 *   ]
 *
 *  Contoh pemakaian:
 *   await sendInteractiveButtons(conn, m.chat, {
 *     body: 'Pilih salah satu',
 *     footer: global.wm,
 *     buttons: singleSelectButton(sections, '🎮 Pilih Menu'),
 *     quoted: m
 *   })
 * ══════════════════════════════════════════════════════════════
 */

function normalizeRows(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((r) => {
    const id = r?.id ?? r?.rowId ?? r?.row_id ?? '';
    return {
      header: r?.header || '',
      title: r?.title || '',
      description: r?.description || '',
      // sertakan dua nama field agar kompatibel dengan
      // berbagai versi parser native flow (id / rowId).
      id,
      rowId: id
    };
  });
}

/**
 * Bangun tombol list "single_select".
 * @param {Array|Object} sections daftar section + rows
 * @param {string} buttonTitle teks tombol pembuka list
 * @returns {Array<{name:string, buttonParamsJson:string}>}
 */
export function singleSelectButton(sections = [], buttonTitle = 'Pilih') {
  const list = (Array.isArray(sections) ? sections : [sections])
    .filter(Boolean)
    .map((sec) => ({
      title: sec?.title || '',
      rows: normalizeRows(sec?.rows)
    }));

  return [
    {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: buttonTitle,
        sections: list
      })
    }
  ];
}

/**
 * Kirim pesan tombol interaktif.
 * @param {import('baileys').WASocket} conn
 * @param {string} chat id chat tujuan
 * @param {object} opts
 * @param {string} [opts.body] isi pesan (alias: text)
 * @param {string} [opts.footer] footer pesan
 * @param {object} [opts.header] { title, subtitle, hasMediaAttachment }
 * @param {Array}  [opts.buttons] hasil singleSelectButton() / native flow lain
 * @param {object} [opts.quoted] pesan yang di-quote
 */
export async function sendInteractiveButtons(conn, chat, opts = {}) {
  const {
    body,
    text,
    footer = global.wm || '',
    title,
    header,
    buttons = [],
    quoted,
    ...extra
  } = opts;

  if (!conn || typeof conn.sendMessage !== 'function') {
    throw new Error('conn.sendMessage tidak tersedia');
  }

  const content = {
    text: text || body || '',
    footer: footer || global.wm || '',
    title: title || header?.title || '',
    interactiveButtons: Array.isArray(buttons) ? buttons : [buttons],
    ...extra
  };

  return conn.sendMessage(chat, content, { quoted });
}

export default { sendInteractiveButtons, singleSelectButton };
