// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-resize.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .resize

import Jimp from "jimp";
import uploadImage from "../../lib/nakano/uploadImage.js";

let handler = async (m, { conn, usedPrefix, args }) => {
  let towidth = parseInt(args[0]);
  let toheight = parseInt(args[1]);

  if (!towidth && !toheight) throw 'Masukkan ukuran width atau height minimal 1!';

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) throw "Mana medianya?";

  let media = await q.download(); // buffer
  if (!/image\/(png|jpe?g|gif)/.test(mime)) throw `Mime ${mime} tidak didukung`;

  let linkOriginal = await uploadImage(media);

  const image = await Jimp.read(media);
  const size = {
    before: {
      width: image.bitmap.width,
      height: image.bitmap.height
    }
  };

  const sal = await image.resize({
    w: towidth,
    h: toheight
  });

  const resizedBuffer = await image.getBuffer("image/jpeg");

  let linkResized = await uploadImage(resizedBuffer);

  const sizeAfter = {
    width: image.bitmap.width,
    height: image.bitmap.height
  };

  await conn.sendFile(m.chat, resizedBuffer, null, `*––––––『 COMPRESS RESIZE 』––––––*

*• BEFORE*
> ᴡɪᴅᴛʜ : ${size.before.width}
> ʜᴇɪɢʜᴛ : ${size.before.height}

*• AFTER*
> ᴡɪᴅᴛʜ : ${sizeAfter.width}
> ʜᴇɪɢʜᴛ : ${sizeAfter.height}

*• LINK*
> ᴏʀɪɢɪɴᴀʟ : ${linkOriginal}
> ʀᴇsɪᴢᴇᴅ : ${linkResized}`, m);
};

handler.command = ['resize']

export default handler;
handler.category = 'Tools'
handler.description = 'Tools-resize'

