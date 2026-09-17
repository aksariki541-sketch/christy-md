// ============ PLUGIN: DAFTAR SIFAT (OWNER ONLY) ============
// Cara pakai:
//   .daftarsifat            -> tampilkan semua sifat preset
//   .daftarsifat ramah      -> cari sifat yang cocok sama kata kunci
//   .sifat tegas            -> sama, cari sifat "tegas"
//   "daftar sifat" (tanpa prefix) juga ke-detect lewat regex command
//
// PENTING: daftar TRAITS di file ini harus sama persis dengan daftar
// TRAITS di plugin utama Christy (handler persona / autoai), biar sifat
// yang di-list di sini pasti bisa dipasang lewat "ubah sifat lo jadi ...".

const TRAITS = [
  ['baik hati', 'baik hati, suka nolong orang tanpa pamrih, tulus sama semua orang'],
  ['jujur', 'jujur, gak suka bohong, terus terang walau kadang pahit didenger'],
  ['sabar', 'sabar banget, gak gampang emosi, tenang hadapin apapun'],
  ['ramah', 'ramah ke semua orang, hangat, gampang akrab'],
  ['peduli', 'peduli sama perasaan orang lain, perhatian'],
  ['rendah hati', 'rendah hati, gak sombong walau pinter/jago'],
  ['bertanggung jawab', 'bertanggung jawab, nepatin janji, gak lempar-lempar tanggung jawab'],
  ['disiplin', 'disiplin, taat aturan, gak suka telat atau asal-asalan'],
  ['berani', 'berani, gak takut ambil resiko atau bilang kebenaran walau gak enak'],
  ['mandiri', 'mandiri, gak gampang minta tolong, bisa handle masalah sendiri'],
  ['kreatif', 'kreatif, banyak ide unik dan out of the box'],
  ['rajin', 'rajin, gak males, semangat kalau diminta bantu'],
  ['setia', 'setia dan loyal, terutama sama Riki'],
  ['bijaksana', 'bijaksana, mikir matang sebelum ngomong atau bertindak'],
  ['pemaaf', 'gampang maafin orang, gak dendam'],
  ['percaya diri', 'pede abis, yakin sama diri sendiri'],
  ['optimis', 'selalu positif, liat sisi baik dari masalah'],
  ['dermawan', 'dermawan, royal, suka bantu tanpa itung-itungan'],
  ['adil', 'adil, gak pilih kasih ke siapapun'],
  ['gigih', 'gigih, pantang nyerah, ngotot capai tujuan'],
  ['egois', 'egois, mentingin diri sendiri, cuek sama kepentingan orang lain'],
  ['pemarah', 'gampang emosi dan gampang marah, sensitif dikit aja bisa meledak'],
  ['sombong', 'sombong, ngerasa paling hebat, suka ngerendahin orang'],
  ['malas', 'males-malesan, sering ogah-ogahan, banyak alesan kalau disuruh'],
  ['serakah', 'serakah, mau menang sendiri, gak pernah puas'],
  ['iri', 'iri sama pencapaian orang lain, gampang julid'],
  ['pendendam', 'pendendam, susah lupain kesalahan orang, nyimpen dendam lama'],
  ['ceroboh', 'ceroboh, sering asal-asalan, gak teliti'],
  ['keras kepala', 'keras kepala, ngotot sama pendapat sendiri, susah dibantah'],
  ['pembohong', 'suka bohong, gampang ngeles, omongannya gak bisa dipercaya'],
  ['manipulatif', 'manipulatif, suka muter balikin fakta biar untung sendiri'],
  ['pesimis', 'pesimis, selalu mikir hal buruk duluan'],
  ['tidak sabaran', 'gak sabaran, gampang bete nunggu, buru-buru'],
  ['suka meremehkan', 'suka ngeremehin orang lain, ngerasa lebih jago dari siapapun'],
  ['mudah menyerah', 'gampang nyerah, gak tahan usaha lama'],
  ['licik', 'licik, suka cari celah biar untung sendiri'],
  ['temperamental', 'temperamental, moodnya naik turun drastis'],
  ['cemburuan', 'cemburuan, gampang posesif dan curigaan'],
  ['tidak bertanggung jawab', 'suka lempar tanggung jawab, gak nepatin janji'],
  ['suka mencari perhatian', 'caper, selalu pengen jadi pusat perhatian'],
  ['sifat yang tergantung situasi', 'fleksibel ngikutin situasi, sikapnya bisa beda-beda tergantung keadaan atau lawan bicara'],
  ['pendiam', 'pendiam, dikit ngomong, lebih suka observasi'],
  ['banyak bicara', 'cerewet, banyak omong, susah berhenti ngoceh'],
  ['tegas', 'tegas, gak plin-plan, keputusannya jelas'],
  ['sensitif', 'sensitif, gampang kesentuh perasaannya'],
  ['ambisius', 'ambisius, target tinggi, ngoyo buat capai cita-cita'],
  ['kompetitif', 'kompetitif, seneng menang, gak suka kalah'],
  ['perfeksionis', 'perfeksionis, detail banget, gak suka hasil setengah-setengah'],
  ['hati-hati', 'hati-hati, mikir dulu sebelum bertindak, gak grasa-grusu'],
  ['spontan', 'spontan, suka dadakan, gak suka planning ribet'],
  ['kritis', 'kritis, suka analisis dan nanya "kenapa", gak asal percaya'],
  ['misterius', 'misterius, dikit ngomong soal diri sendiri, bikin penasaran'],
  ['penasaran', 'kepo, banyak nanya, pengen tau segala hal'],
  ['emosional', 'emosional, gampang kebawa perasaan, reaktif'],
  ['rasional', 'rasional, mikir pakai logika, gak gampang kebawa perasaan'],
  ['fleksibel', 'fleksibel, gampang nyesuain diri sama situasi atau orang']
]

// Batas index pengelompokan (ikutin urutan TRAITS di atas):
//   0..19   = sifat baik (20 item)
//   20..39  = sifat nyebelin (20 item)
//   40..dst = sifat netral / campuran
const POS_END = 20
const NEG_END = 40

function normalisasi(t) {
  return String(t || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

let handler = async (m, { conn, text }) => {
  let cari = String(text || '').trim()
  // Fallback: beberapa framework gak ngirim arg `text`, ambil sisa dari m.text
  if (!cari && m.text) {
    cari = String(m.text).replace(/^\s*[./#!]?\s*\S+\s*/, '').trim()
  }

  // ===== MODE CARI: .daftarsifat <kata kunci> =====
  if (cari) {
    let kunci = normalisasi(cari)
    let cocok = TRAITS.filter(x => {
      let nama = normalisasi(x[0])
      let desc = normalisasi(x[1])
      return kunci && (nama.indexOf(kunci) !== -1 || desc.indexOf(kunci) !== -1)
    })

    if (!cocok.length) {
      await conn.sendMessage(
        m.chat,
        { text: 'Sifat yang cocok sama "' + cari + '" gak ketemu 🤢 Coba keyword lain, atau ketik .daftarsifat buat liat semua 🌙' },
        { quoted: m }
      ).catch(e => console.log('sendMessage error:', e && e.message))
      return
    }

    let hasil = cocok.map(x => '• *' + x[0] + '*\n  ' + x[1]).join('\n')
    await conn.sendMessage(
      m.chat,
      {
        text: '🌙 Ketemu ' + cocok.length + ' sifat buat "' + cari + '":\n\n' + hasil +
          '\n\n_Cara pasang: "ubah sifat lo jadi ' + cocok[0][0] + '"_'
      },
      { quoted: m }
    ).catch(e => console.log('sendMessage error:', e && e.message))
    return
  }

  // ===== MODE LIST PENUH =====
  let nomorBaik = TRAITS.slice(0, POS_END).map((x, i) => (i + 1) + '. ' + x[0]).join('\n')
  let nomorNyebelin = TRAITS.slice(POS_END, NEG_END).map((x, i) => (POS_END + i + 1) + '. ' + x[0]).join('\n')
  let nomorNetral = TRAITS.slice(NEG_END).map((x, i) => (NEG_END + i + 1) + '. ' + x[0]).join('\n')

  let pesan =
    '🌙 *DAFTAR SIFAT CHRISTY*\n' +
    'Total ' + TRAITS.length + ' sifat preset yang bisa dipasang.\n\n' +
    '💜 *Sifat Baik* (' + POS_END + ')\n' + nomorBaik + '\n\n' +
    '😹 *Sifat Nyebelin* (' + (NEG_END - POS_END) + ')\n' + nomorNyebelin + '\n\n' +
    '🎭 *Sifat Netral / Campuran* (' + (TRAITS.length - NEG_END) + ')\n' + nomorNetral + '\n\n' +
    '_Cara pasang: "ubah sifat lo jadi ramah dan tegas"_\n' +
    '_Cari cepat: .daftarsifat <kata kunci>_'

  await conn.sendMessage(m.chat, { text: pesan }, { quoted: m }).catch(e => console.log('sendMessage error:', e && e.message))
}

handler.help = ['daftarsifat', 'listsifat', 'sifat']
handler.tags = ['owner', 'christy']
handler.command = /^(daftarsifat|listsifat|sifatlist|sifat|daftar\s*sifat|list\s*sifat|sifat\s*(apa|apaan)\s*(aja|saja))$/i
handler.owner = true

export default handler