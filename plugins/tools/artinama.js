// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/artinama.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .artinama

import fetch from 'node-fetch'
import request from 'request'
import * as cheerio from 'cheerio'

let handler = async (m, { text }) => {
  if (!text) throw 'Namanya siapa?'
  let nama = text
request.get({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     'http://www.primbon.com/arti_nama.php?nama1='+ nama +'&proses=+Submit%21+',
      },function(error, response, body){
          let $ = cheerio.load(body);
          var y = $.html().split('arti:')[1];
          var t = y.split('method="get">')[1];
          var f = y.replace(t ," ");
          var x = f.replace(/<br\s*[\/]?>/gi, "\n");
          var h  = x.replace(/<[^>]*>?/gm, '');
      console.log(""+ h);
      m.reply(`Arti Dari Nama ${nama} Adalah ${nama}\n\n${h}`)
  });
}
handler.command = ['artinama']

export default handler
handler.category = 'Tools'
handler.description = 'Artinama'

