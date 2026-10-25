var $ = function (id) {
  return document.getElementById(id);
};

var tab = "ov",
  mode = "in",
  sel = 0,
  qty = 1,
  msg = "",
  ms = 0,
  po = false,
  sup = 0,
  showSup = false,
  ch = "Semua",
  iv = "st",
  opn = {},
  nd = 0,
  sim = false;

var P = [
  { n: "Kopi Arabika", s: 30, t: 24, u: 20, min: 20, exp: "8 bulan", b: "B-0412" },
  { n: "Mie Instan", s: 120, t: 8, u: 20, min: 40, exp: "5 bulan", b: "B-0388" },
  { n: "Biskuit", s: 60, t: -12, u: 20, min: 30, exp: "3 bulan", b: "B-0401" },
  { n: "Gula", s: 30, t: 3, u: 10, min: 15, exp: "1 tahun", b: "B-0350" },
  { n: "Susu UHT", s: 18, t: 5, u: 12, min: 20, exp: "20 hari", b: "B-0921" }
];

var H = [
  { k: "in", p: "Kopi Arabika", q: 20, w: "Hari ini, 10.32" },
  { k: "out", p: "Kopi Arabika", q: 5, w: "Hari ini, 11.15" }
];

var M = [
  {
    w: "Rina",
    ch: "Shopee",
    t: "Barang yang saya terima rusak dan terlambat.",
    c: "r",
    m: "draft",
    d: "Halo Kak Rina, mohon maaf atas pengalaman yang kurang menyenangkan. Boleh kirim foto barang yang rusak? Kami akan segera proses penggantian atau pengembalian dana.",
    sent: false
  },
  {
    w: "Nur",
    ch: "WhatsApp",
    t: "Kak, pesan Susu UHT 30 pcs ya.",
    c: "s",
    m: "draft",
    d: "Halo Kak Nur, stok Susu UHT saat ini {S} pcs. Kami bisa kirim {S} pcs sekarang dan sisanya setelah restock minggu depan. Bagaimana, Kak?",
    sent: false
  },
  {
    w: "Dedi",
    ch: "Tokopedia",
    t: "Packaging-nya bagus, tapi mungkin ukurannya bisa dibuat lebih kecil.",
    c: "g",
    m: "draft",
    d: "Terima kasih Kak Dedi atas masukannya. Kami catat untuk evaluasi ukuran kemasan ke depannya.",
    sent: false
  },
  {
    w: "Sari",
    ch: "WhatsApp",
    t: "Kak, kopi arabika masih ada?",
    c: "",
    m: "auto",
    d: "AUTOSTOK",
    sent: true
  },
  {
    w: "Andi",
    ch: "TikTok Shop",
    t: "Resi pesanan saya nomor berapa?",
    c: "",
    m: "auto",
    d: "Resi pesanan Kakak: TKP-882190. Status: dalam pengiriman.",
    sent: true
  }
];

var SUP = [
  { n: "CV Jaya Abadi", pr: 45000, moq: 20, lt: 3, ok: 96, k: "Kopi & Teh" },
  { n: "PT Mitra Kusuka", pr: 47500, moq: 10, lt: 4, ok: 91, k: "Kopi & Minuman" },
  { n: "UD Sumber Pangan", pr: 8500, moq: 40, lt: 2, ok: 94, k: "Mie & Biskuit" }
];

var NODES = [
  { n: "Pesan WhatsApp masuk", s: "Trigger", c: "c", d: "Memicu alur setiap ada pesan baru dari WhatsApp.", r: "Gratis", ms: 100 },
  { n: "Baca maksud pesan", s: "AI", c: "i", d: "AI membaca pesan dan mengambil nama produk dan jumlah.", r: "Rp200", ms: 820 },
  { n: "Cek stok", s: "Sistem", c: "c", d: "Mengambil angka stok dari database. AI tidak menghitung angka.", r: "Gratis", ms: 140 },
  { n: "Stok cukup?", s: "Sistem", c: "c", d: "Jika stok cukup, lanjut cetak resi. Jika kurang, susun draf untuk pembeli.", r: "Gratis", ms: 40 },
  { n: "Draf ke pembeli", s: "AI", c: "i", d: "AI menyusun draf balasan yang ramah untuk pembeli.", r: "Rp400", ms: 60 },
  { n: "Kamu setujui", s: "Manusia", c: "h", d: "Draf baru dikirim setelah kamu klik Kirim.", r: "Gratis", ms: 0 }
];

var MENU = [
  ["ov", "Overview"],
  ["ib", "Inbox"],
  ["inv", "Inventori"],
  ["rs", "Restock"],
  ["au", "Otomasi"]
];

function ins(n) {
  var x = 0;
  H.forEach(function (h) {
    if (h.p === n && h.k === "in") x += h.q;
  });
  return x;
}

function outs(n) {
  var x = 0;
  H.forEach(function (h) {
    if (h.p === n && h.k === "out") x += h.q;
  });
  return x;
}

function stock(i) {
  return P[i].s + ins(P[i].n) - outs(P[i].n);
}

function classify(t) {
  t = t.toLowerCase();

  var b = 0, a = 0;
  var q = /\?|masih ada|resi|jam buka|stok/.test(t);

  [
    "rusak", "terlambat", "lama banget", "kecewa",
    "salah kirim", "tidak sesuai", "basi", "busuk",
    "jelek", "bocor"
  ].forEach(function (x) {
    if (t.indexOf(x) > -1) b++;
  });

  [
    "saran", "sebaiknya", "mungkin", "bisa dibuat",
    "tolong tambah", "lebih baik", "kalau ada",
    "semoga", "usul"
  ].forEach(function (x) {
    if (t.indexOf(x) > -1) a++;
  });

  return b > a ? "r" : a > 0 ? "g" : q ? "" : "g";
}

function rec(p) {
  return p.t >= 15
    ? { l: "HIGH DEMAND", c: "g", q: Math.round(p.u * 1.5), a: "Naikkan" }
    : p.t >= 0
      ? { l: "MEDIUM DEMAND", c: "a", q: p.u, a: "Pertahankan" }
      : { l: "LOW DEMAND", c: "r", q: Math.round(p.u * 0.5), a: "Kurangi" };
}

function bd(c) {
  return c === "g"
    ? '<span class="badge b-g">ADVICE</span>'
    : c === "r"
      ? '<span class="badge b-r">COMPLAIN</span>'
      : c === "s"
        ? '<span class="badge b-a">STOK KURANG</span>'
        : '<span class="badge b-p">PERTANYAAN</span>';
}

function low() {
  var x = 0;
  P.forEach(function (p, i) {
    if (stock(i) < p.min) x++;
  });
  return x;
}

function pending() {
  return M.filter(function (x) {
    return x.m === "draft" && !x.sent;
  }).length;
}

function rp(n) {
  return "Rp" + n.toLocaleString("id-ID");
}

function now() {
  var d = new Date();
  return "Hari ini, " +
    ("0" + d.getHours()).slice(-2) + "." +
    ("0" + d.getMinutes()).slice(-2);
}

/* SIDEBAR */

function sd() {
  $("side").innerHTML =
    '<div class="logo"><i>N</i>NataHub</div>' +
    MENU.map(function (x) {
      return '<button data-t="' + x[0] + '" aria-current="' +
        (tab === x[0] ? "page" : "false") + '">' +
        x[1] +
        (x[0] === "ib" && pending()
          ? '<span class="dot">' + pending() + '</span>'
          : "") +
        '</button>';
    }).join("") +
    '<button class="ai" data-t="kq" aria-current="' +
    (tab === "kq" ? "page" : "false") +
    '"><div class="lbl">Sisa kuota AI</div><b style="font-size:18px">Rp 43.000</b></button>';

  [].forEach.call($("side").querySelectorAll("button"), function (b) {
    b.onclick = function () {
      tab = b.dataset.t;
      msg = "";
      draw();
    };
  });
}

/* OVERVIEW */

function ov() {
  var ev = H.slice().reverse().map(function (h) {
    return '<li><div>' +
      (h.note || (h.k === "in" ? "Stok masuk" : "Stok keluar")) +
      ': ' + (h.k === "in" ? "+" : "−") + h.q + ' ' + h.p +
      '</div><span>' + h.w + '</span></li>';
  }).join("");

  return '<h1>Selamat pagi, ' + U.name.split(" ")[0] + '</h1>' +
    '<p class="sub">Semua toko dan chat kamu ada di satu tempat.</p>' +

    '<div class="stats">' +
      '<div class="card"><div class="lbl">Pesanan hari ini</div><div class="big">38</div></div>' +
      '<div class="card"><div class="lbl">Stok sinkron</div><div class="big up">99,4%</div></div>' +
      '<div class="card"><div class="lbl">Pesan perlu disetujui</div><div class="big ' + (pending() ? "down" : "") + '">' + pending() + '</div></div>' +
      '<div class="card"><div class="lbl">Stok menipis</div><div class="big" style="' + (low() ? "color:var(--a)" : "color:var(--g)") + '">' + low() + '</div></div>' +
    '</div>' +

    '<div class="two">' +
      '<div class="card"><h2>Yang perlu kamu lakukan</h2>' +

        (po ? "" :
          '<div class="act g"><div><span class="badge b-g">SARAN</span><b>Setujui draf PO Kopi</b><span class="lbl">Kopi laku 24% lebih cepat dari biasanya.</span></div><button class="btn" data-go="rs">Lihat</button></div>') +

        (pending()
          ? '<div class="act r"><div><span class="badge b-r">PERLU DISETUJUI</span><b>' + pending() + ' draf balasan menunggu</b><span class="lbl">Komplain, masukan, dan stok kurang.</span></div><button class="btn ghost" data-go="ib">Buka</button></div>'
          : "") +

        (low()
          ? '<div class="act a"><div><span class="badge b-a">STOK MENIPIS</span><b>' + low() + ' produk di bawah minimum</b><span class="lbl">Susu UHT kedaluwarsa 20 hari lagi.</span></div><button class="btn ghost" data-go="inv">Cek</button></div>'
          : "") +
      '</div>' +

      '<div class="card"><h2>Aktivitas terbaru</h2><ul class="tl">' +
        '<li><div>Stok disinkronkan ke 3 marketplace</div><span>Barusan</span></li>' +
        '<li><div>Resi dicetak otomatis (12 pesanan)</div><span>09.40</span></li>' +
        '<li><div>AI membalas 2 pertanyaan stok dan resi</div><span>09.15</span></li>' +
        ev +
      '</ul></div>' +
    '</div>';
}

/* INBOX */

function ib() {
  var chs = ["Semua", "WhatsApp", "Shopee", "Tokopedia", "TikTok Shop"];
  var m = M[ms];
  var right;
  var pn = /kopi/i.test(m.t) ? 0 : /susu/i.test(m.t) ? 4 : -1;
  var d = m.d.replace(/\{S\}/g, stock(4));

  if (m.m === "auto") {
    var r = d === "AUTOSTOK"
      ? "Masih ada, Kak. Stok Kopi Arabika saat ini " + stock(0) + " pcs."
      : d;

    right =
      '<span class="badge b-g">AUTOMATION MODE</span>' +
      '<div class="bub">' + m.t + '</div>' +
      '<div class="bub me">' + r + '</div>' +
      '<div class="lbl">Dibalas otomatis. Angka diambil dari database stok, bukan ditebak AI.</div>';
  } else {
    right =
      '<span class="badge b-a">DRAFT MODE</span> ' + bd(m.c) +
      '<div class="bub">' + m.t + '</div>' +
      (m.sent
        ? '<div class="bub me">' + d + '</div><div class="lbl">Balasan terkirim.</div>'
        : '<div class="lbl" style="margin-bottom:6px">Draf balasan dari AI. Edit kalau perlu.</div>' +
          '<textarea id="dr">' + d + '</textarea>' +
          '<button class="btn full" id="snd" style="margin-top:10px">Kirim balasan</button>');
  }

  if (pn > -1) {
    right += '<div class="toast" style="margin:14px 0 0">Stok real-time: <b>' +
      P[pn].n + ' ' + stock(pn) + ' pcs</b> (minimum ' + P[pn].min + ')</div>';
  }

  return '<h1>Inbox</h1>' +
    '<p class="sub">Semua pesan masuk dalam satu layar. AI membalas yang pasti, kamu menyetujui yang perlu sentuhan.</p>' +

    '<div class="stats" style="grid-template-columns:repeat(3,1fr)">' +
      '<div class="card"><div class="lbl">Waktu respons AI</div><div class="big">2,1 dtk</div></div>' +
      '<div class="card"><div class="lbl">Akurasi stok</div><div class="big up">99,4%</div></div>' +
      '<div class="card"><div class="lbl">Perlu disetujui</div><div class="big">' + pending() + '</div></div>' +
    '</div>' +

    '<div class="two">' +
      '<div class="card">' +
        '<div class="seg" style="overflow-x:auto">' +
          chs.map(function (c) {
            return '<button data-ch="' + c + '" aria-pressed="' + (c === ch) + '">' + c + '</button>';
          }).join("") +
        '</div>' +

        M.map(function (x, i) {
          if (ch !== "Semua" && x.ch !== ch) return "";

          return '<button class="msg" data-i="' + i + '" aria-pressed="' + (i === ms) + '">' +
            '<div class="row"><b>' + x.w + ' <span class="lbl">· ' + x.ch + '</span></b>' +
            (x.sent
              ? '<span class="badge b-g">TERKIRIM</span>'
              : bd(x.c)) +
            '</div><p>' + x.t + '</p></button>';
        }).join("") +

        '<div style="margin-top:14px">' +
          '<textarea id="nt" style="height:64px" placeholder="Coba tulis pesan customer baru"></textarea>' +
          '<button class="btn ghost full" id="na" style="margin-top:8px">Terima pesan</button>' +
        '</div>' +
      '</div>' +

      '<div class="card">' + right + '</div>' +
    '</div>';
}

/* INVENTORI */

function inv() {
  var tabs =
    '<div class="seg" style="max-width:320px">' +
      '<button data-iv="st" aria-pressed="' + (iv === "st") + '">Stok</button>' +
      '<button data-iv="op" aria-pressed="' + (iv === "op") + '">Stock Opname</button>' +
    '</div>';

  var head =
    '<h1>Inventori</h1>' +
    '<p class="sub">Stok dihitung dari barang masuk dan keluar, lalu disinkronkan ke semua toko.</p>' +
    tabs;

  if (iv === "op") {
    var chg = 0;

    var rows = P.map(function (x, i) {
      var f = opn[i] === undefined ? stock(i) : opn[i];
      var df = f - stock(i);

      if (df) chg++;

      return '<tr><td><b>' + x.n + '</b></td>' +
        '<td>' + stock(i) + '</td>' +
        '<td><input type="number" min="0" data-op="' + i + '" value="' + f + '" aria-label="Jumlah fisik ' + x.n + '"></td>' +
        '<td class="' + (df > 0 ? "up" : df < 0 ? "down" : "") + '">' +
        (df > 0 ? "+" : "") + df + '</td></tr>';
    }).join("");

    return head +
      (msg ? '<div class="toast">' + msg + '</div>' : "") +
      '<div class="card"><h2>Hitung stok fisik</h2>' +
        '<p class="lbl" style="margin-top:-6px">Bawa HP ke gudang, isi jumlah yang kamu hitung. Selisih langsung terlihat.</p>' +
        '<table><tr><th>Produk</th><th>Sistem</th><th>Fisik</th><th>Selisih</th></tr>' + rows + '</table>' +
        '<button class="btn full" id="sop" style="margin-top:14px"' + (chg ? "" : " disabled") + '>' +
        'Simpan hasil opname' + (chg ? " (" + chg + " selisih)" : "") +
        '</button></div>';
  }

  var p = P[sel];
  var cur = stock(sel);

  return head +
    '<div class="eq">' +
      '<div class="card">' +
        '<div class="seg">' +
          '<button data-m="in" aria-pressed="' + (mode === "in") + '">Stok Masuk</button>' +
          '<button data-m="out" aria-pressed="' + (mode === "out") + '">Stok Keluar</button>' +
        '</div>' +

        (msg ? '<div class="toast">' + msg + '</div>' : "") +

        '<label class="lbl" for="sp">Produk (simulasi scan)</label>' +
        '<select id="sp" style="margin-top:6px">' +
          P.map(function (x, i) {
            return '<option value="' + i + '"' + (i === sel ? " selected" : "") + '>' + x.n + '</option>';
          }).join("") +
        '</select>' +

        '<div class="qty"><button id="mn" aria-label="Kurangi">−</button><span>' + qty + '</span><button id="pl" aria-label="Tambah">+</button></div>' +

        '<button class="btn full" id="sv">' +
          (mode === "in" ? "Simpan stok masuk" : "Simpan stok keluar") +
        '</button>' +

        '<div class="calc">Stok ' + p.n + ': <b style="color:var(--ink)">' + cur + '</b> = awal ' +
          p.s + ' + masuk ' + ins(p.n) + ' − keluar ' + outs(p.n) + '</div>' +

        (mode === "out"
          ? '<div class="calc">FIFO: diambil dari batch ' + p.b + ' (kedaluwarsa ' + p.exp + ').</div>'
          : "") +
      '</div>' +

      '<div>' +
        '<div class="card mb"><h2>Stok saat ini</h2>' +
          '<table><tr><th>Produk</th><th>Stok</th><th>Batch terdekat</th></tr>' +
            P.map(function (x, i) {
              var l = stock(i) < x.min;

              return '<tr><td><b>' + x.n + '</b></td>' +
                '<td>' + stock(i) + (l ? ' <span class="badge b-a">MENIPIS</span>' : '') + '</td>' +
                '<td' + (x.exp === "20 hari" ? ' style="color:var(--a)"' : '') + '>' + x.b + ' · ' + x.exp + '</td></tr>';
            }).join("") +
          '</table>' +
        '</div>' +

        '<div class="card"><h2>Riwayat</h2>' +
          H.slice().reverse().map(function (h) {
            return '<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)">' +
              '<div><span class="badge b-' + (h.k === "in" ? "g" : "r") + '">' +
                (h.note ? "OPNAME" : h.k === "in" ? "STOCK IN" : "STOCK OUT") +
              '</span> <b style="margin-left:8px">' + (h.k === "in" ? "+" : "−") + h.q + ' ' + h.p + '</b></div>' +
              '<span class="lbl">' + h.w + '</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</div>';
}

/* RESTOCK */

function rs() {
  var s = P.slice().sort(function (a, b) {
    return b.t - a.t;
  });

  var k = rec(P[0]);
  var sp = SUP[sup];
  var q = Math.max(k.q, sp.moq);

  return '<h1>Restock</h1>' +
    '<p class="sub">Beli sesuai lakunya produk, jangan jumlah yang sama untuk semua.</p>' +

    '<div class="card mb" style="border-left:3px solid var(--g)">' +
      '<div class="row"><div><span class="badge b-g">DRAF PURCHASE ORDER</span>' +
      '<div style="font-size:17px;font-weight:800;margin:8px 0 4px">Kopi Arabika, ' + q + ' pcs</div>' +
      '<span class="lbl">' + sp.n + ' · ' + rp(sp.pr) + '/pcs · Pengiriman ' + sp.lt + ' hari · Total ' + rp(q * sp.pr) + '</span>' +
      '</div>' +
      (po
        ? '<span class="badge b-g">DISETUJUI</span>'
        : '<button class="btn" id="po">Setujui PO</button>') +
      '</div>' +

      (po
        ? '<div class="lbl" style="margin-top:10px">PO dikirim ke supplier lewat WhatsApp.</div>'
        : '<div class="lbl" style="margin:12px 0 0">AI membandingkan supplier. Pilih yang kamu mau:</div>' +
          SUP.slice(0, 2).map(function (x, i) {
            return '<button class="opt" data-sup="' + i + '" aria-pressed="' + (i === sup) + '">' +
              '<b>' + x.n + '</b> ' +
              (i === 0 ? '<span class="badge b-g">DISARANKAN AI</span>' : '') +
              '<br><span class="lbl">' + rp(x.pr) + ' · MOQ ' + x.moq + ' · ' + x.lt + ' hari · tepat waktu ' + x.ok + '%</span>' +
            '</button>';
          }).join("")) +
    '</div>' +

    '<div class="card mb"><h2>Purchase Trend</h2>' +
      '<table><tr><th>Produk</th><th>Tren</th><th>Status</th><th>Biasa beli</th><th>Saran beli</th></tr>' +
        s.map(function (p) {
          var r = rec(p);

          return '<tr><td><b>' + p.n + '</b></td>' +
            '<td class="' + (p.t >= 0 ? "up" : "down") + '">' + (p.t >= 0 ? "↑ " : "↓ ") + Math.abs(p.t) + '%</td>' +
            '<td><span class="badge b-' + r.c + '">' + r.l + '</span></td>' +
            '<td>' + p.u + ' pcs</td>' +
            '<td><b>' + r.q + ' pcs</b> <span class="lbl">' + r.a + '</span></td></tr>';
        }).join("") +
      '</table>' +
    '</div>' +

    '<button class="btn ghost" id="ss">' +
      (showSup ? "Sembunyikan supplier" : "Lihat semua supplier") +
    '</button>' +

    (showSup
      ? '<div class="card" style="margin-top:14px"><h2>Daftar supplier</h2>' +
        '<table><tr><th>Nama</th><th>Kategori</th><th>MOQ</th><th>Lead time</th><th>Tepat waktu</th></tr>' +
        SUP.map(function (x) {
          return '<tr><td><b>' + x.n + '</b></td><td>' + x.k + '</td><td>' + x.moq +
            ' pcs</td><td>' + x.lt + ' hari</td><td>' + x.ok + '%</td></tr>';
        }).join("") +
        '</table><div class="lbl" style="margin-top:12px">PO berjalan: PO-2026-0377 · UD Sumber Pangan · Mie Instan 20 pcs · Dalam pengiriman</div></div>'
      : "");
}

/* OTOMASI */

function au() {
  var n = NODES[nd];
  var tot = 0;

  NODES.forEach(function (x) {
    tot += x.ms;
  });

  var con = sim
    ? '<div class="card" style="margin-top:16px"><h2>Hasil simulasi</h2><ul class="tl">' +
      NODES.map(function (x, i) {
        return '<li><div>' + (i + 1) + '. ' + x.n + '</div><span>' + x.ms + ' ms</span></li>';
      }).join("") +
      '<li><b>Total</b><b>' + tot + ' ms · Biaya Rp600</b></li></ul></div>'
    : "";

  return '<h1>Otomasi</h1>' +
    '<p class="sub">Susun alur kerja seperti puzzle. Tanpa coding. Klik satu langkah untuk melihat detailnya.</p>' +

    '<div class="card mb"><h2>Pesanan marketplace</h2>' +
      '<div class="flow">' +
        '<div class="node c">Pesanan masuk<small>Trigger</small></div><span class="arr">→</span>' +
        '<div class="node c">Kurangi stok<small>Sistem</small></div><span class="arr">→</span>' +
        '<div class="node c">Cetak resi<small>Sistem</small></div>' +
      '</div>' +

      '<div class="row"><h2 style="margin:0">Pesanan WhatsApp</h2><button class="btn" id="sm">Simulasikan alur</button></div>' +

      '<div class="flow" style="margin-top:14px">' +
        NODES.map(function (x, i) {
          return (i ? '<span class="arr">→</span>' : "") +
            '<button class="node ' + x.c + '" data-n="' + i + '" aria-pressed="' + (i === nd) + '">' +
            x.n + '<small>' + x.s + '</small></button>';
        }).join("") +
      '</div>' +

      '<div class="act"><div><b style="margin-top:0">' + n.n + '</b><span class="lbl">' + n.d + '</span></div><span class="badge b-p">' + n.r + '</span></div>' +

      '<div class="chips">' +
        '<span class="badge b-p">Sistem: tanpa biaya AI</span>' +
        '<span class="badge b-a">AI: bayar per pakai</span>' +
        '<span class="badge b-g">Manusia: kamu yang putuskan</span>' +
      '</div>' +
    '</div>' + con;
}

/* KUOTA AI */

function kq() {
  var bars = [3, 5, 9, 14, 12, 8, 6, 10, 7];
  var mx = 14;

  return '<h1>Kuota AI</h1>' +
    '<p class="sub">Bayar AI seperlunya. Fitur biasa tetap gratis.</p>' +

    '<div class="two mb">' +
      '<div class="card"><div class="row"><div><div class="lbl">Paket Core UMKM</div>' +
        '<div class="big" style="margin-top:2px">Rp 99.000<span class="lbl"> / bulan</span></div></div>' +
        '<span class="badge b-g">AKTIF</span></div>' +
        '<div class="lbl" style="margin-top:14px">Kuota AI terpakai Rp17.000 dari Rp60.000</div>' +
        '<div class="bar"><i style="width:28%"></i></div>' +
        '<div class="lbl">Sisa Rp43.000</div>' +
      '</div>' +

      '<div class="card"><h2>Pesanan per kanal (38)</h2>' +
        [["Shopee", 16], ["Tokopedia", 12], ["TikTok Shop", 8], ["WhatsApp", 2]].map(function (x) {
          return '<div class="row lbl"><span>' + x[0] + '</span><span>' + x[1] + '</span></div>' +
            '<div class="bar"><i style="width:' + x[1] / 16 * 100 + '%"></i></div>';
        }).join("") +
      '</div>' +
    '</div>' +

    '<div class="card mb"><h2>Rincian pemakaian AI</h2>' +
      '<table><tr><th>Fitur</th><th>Pemakaian</th><th>Biaya</th></tr>' +
        '<tr><td>Baca maksud pesan</td><td>43x</td><td>Rp8.600</td></tr>' +
        '<tr><td>Draf balasan</td><td>18x</td><td>Rp7.200</td></tr>' +
        '<tr><td>Rekomendasi restock</td><td>4x</td><td>Rp1.200</td></tr>' +
      '</table>' +
    '</div>' +

    '<div class="card mb"><h2>Aktivitas hari ini (per jam)</h2>' +
      '<div class="cols">' +
        bars.map(function (b) {
          return '<div style="height:' + b / mx * 100 + '%"></div>';
        }).join("") +
      '</div>' +
      '<div class="row lbl" style="margin-top:6px"><span>08.00</span><span>16.00</span></div>' +
    '</div>' +

    '<div class="card"><h2>Log aktivitas</h2>' +
      '<table><tr><th>Waktu</th><th>Aksi</th><th>Oleh</th><th>Biaya</th></tr>' +
        '<tr><td>10.32</td><td>Stok Kopi disinkronkan ke 3 toko</td><td><span class="badge b-p">SISTEM</span></td><td>Gratis</td></tr>' +
        '<tr><td>10.15</td><td>Resi dicetak untuk 12 pesanan</td><td><span class="badge b-p">SISTEM</span></td><td>Gratis</td></tr>' +
        '<tr><td>09.58</td><td>Draf balasan komplain dibuat</td><td><span class="badge b-a">AI</span></td><td>Rp400</td></tr>' +
        '<tr><td>09.40</td><td>Draf PO Kopi disusun</td><td><span class="badge b-a">AI</span></td><td>Rp300</td></tr>' +
      '</table>' +
    '</div>';
}

/* LOGIN & REGISTER */

var scr = "login";
var lg = { e: "", p: "" };
var sp = false;
var reg = { name: "", email: "", store: "" };
var err = "";

var U = {
  name: "Budi Santoso",
  store: "Toko Sentra Cipadu",
  shops: ["Shopee", "Tokopedia", "TikTok Shop"]
};

var SH = [
  ["Shopee", "Auto-sync stok & chat"],
  ["Tokopedia", "Auto-sync stok & chat"],
  ["TikTok Shop", "Auto-sync pesanan"]
];

var shopSel = {
  "Shopee": true,
  "Tokopedia": true,
  "TikTok Shop": false
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function selShops() {
  return SH.map(function (x) {
    return x[0];
  }).filter(function (n) {
    return shopSel[n];
  });
}

function stp(n) {
  var L = ["Akun & Bisnis", "Hubungkan Toko", "Selesai & Mulai"];

  return '<div class="stp">' +
    L.map(function (l, i) {
      var c = i + 1 < n ? "done" : i + 1 === n ? "on" : "";

      return '<div class="s ' + c + '"><b>' +
        (i + 1 < n ? "✓" : i + 1) +
        '</b><span>' + l + '</span></div>';
    }).join("") +
    '</div>';
}

function enter() {
  U = reg.name
    ? { name: reg.name, store: reg.store, shops: selShops() }
    : { name: "Budi Santoso", store: "Toko Sentra Cipadu", shops: ["Shopee", "Tokopedia", "TikTok Shop"] };

  scr = "app";
  tab = "ov";
  err = "";
  draw();
}

function auth() {
  var lo = scr === "login";
  var b = "";

  var hd =
    '<div class="ah">' +
      '<div class="logo" style="padding:0"><i>N</i>NataHub</div>' +
      '<div class="lbl">' +
        (lo
          ? 'Belum punya akun? <button class="lk" data-sc="r1">Daftar Bisnis</button>'
          : 'Sudah punya akun? <button class="lk" data-sc="login">Masuk</button>') +
      '</div>' +
    '</div>';

  if (lo) {
    b =
      '<div class="acard">' +
        '<div class="alogo">N</div>' +
        '<h2 class="at">Masuk ke akun</h2>' +
        '<p class="lbl ac" style="margin:0 0 4px">Pusat kendali bisnis kamu</p>' +

        '<label for="le">Email bisnis atau nomor WhatsApp</label>' +
        '<input type="text" id="le" placeholder="owner@tokokamu.co.id" value="' + esc(lg.e) + '">' +

        '<label for="lp">Kata sandi</label>' +
        '<div class="pw">' +
          '<input type="' + (sp ? "text" : "password") + '" id="lp" value="' + esc(lg.p) + '">' +
          '<button class="lk" id="tp" type="button">' + (sp ? "Sembunyikan" : "Tampilkan") + '</button>' +
        '</div>' +

        '<label class="chk"><input type="checkbox" checked> Ingat saya di perangkat ini</label>' +
        '<div class="err">' + err + '</div>' +
        '<button class="btn full" id="li">Masuk ke NataHub</button>' +

        '<p class="lbl ac" style="margin:16px 0 0">Belum punya akun? <button class="lk" data-sc="r1">Daftar Bisnis (14 hari gratis)</button></p>' +
        '<p class="lbl ac" style="margin:14px 0 0">Terhubung langsung ke Shopee · Tokopedia · TikTok Shop</p>' +
      '</div>';

  } else if (scr === "r1") {
    b = stp(1) +
      '<div class="acard">' +
        '<h2 class="at">Mulai dalam hitungan detik</h2>' +
        '<p class="lbl ac" style="margin:0">Cukup 3 data singkat untuk menyiapkan asisten bisnis kamu.</p>' +

        '<label for="rn">Nama lengkap <i>*</i></label>' +
        '<input type="text" id="rn" placeholder="Budi Santoso" value="' + esc(reg.name) + '">' +

        '<label for="re">Email bisnis <i>*</i></label>' +
        '<input type="email" id="re" placeholder="budi@tokokamu.co.id" value="' + esc(reg.email) + '">' +

        '<label for="rs">Nama toko / bisnis <i>*</i></label>' +
        '<input type="text" id="rs" placeholder="Toko Kopi Nusantara" value="' + esc(reg.store) + '">' +

        '<div class="err">' + err + '</div>' +
        '<button class="btn full" id="n1">Lanjut ke toko →</button>' +
      '</div>';

  } else if (scr === "r2") {
    b = stp(2) +
      '<div class="acard">' +
        '<h2 class="at">Hubungkan toko kamu</h2>' +
        '<p class="lbl ac" style="margin:0">Pilih platform yang ingin dipantau dan diotomasi.</p>' +

        '<div class="shops">' +
          SH.map(function (x) {
            return '<button class="shop" data-shop="' + x[0] + '" aria-pressed="' + !!shopSel[x[0]] + '">' +
              '<span><b>' + x[0] + '</b><small>' + x[1] + '</small></span>' +
              (shopSel[x[0]] ? '<span class="tick">✓</span>' : '') +
            '</button>';
          }).join("") +
        '</div>' +

        '<div class="err">' + err + '</div>' +
        '<div class="btns">' +
          '<button class="btn ghost" id="bk1">← Kembali</button>' +
          '<button class="btn" id="n2">Lanjut ke langkah 3 →</button>' +
        '</div>' +
      '</div>';

  } else {
    b = stp(3) +
      '<div class="acard">' +
        '<h2 class="at">Siap mengotomasi bisnis kamu!</h2>' +
        '<p class="lbl ac" style="margin:0">Akun sudah dikonfigurasi. NataHub siap memantau toko kamu.</p>' +

        '<div class="sum">' +
          '<div class="row"><span class="lbl">Status asisten</span><span class="badge b-g">AKTIF</span></div>' +
          '<div class="row"><span class="lbl">Toko terhubung</span><span>' + selShops().join(", ") + '</span></div>' +
          '<div class="row"><span class="lbl">Bisnis terdaftar</span><b>' + esc(reg.store) + '</b></div>' +
          '<div class="row"><span class="lbl">Mode pengawasan</span><span>Otomatis dengan persetujuan manual</span></div>' +
        '</div>' +

        '<p class="lbl" style="margin:0 0 4px">✓ Stok dan katalog disinkronkan otomatis<br>✓ Draf balasan dan PO menunggu persetujuan kamu</p>' +

        '<div class="btns">' +
          '<button class="btn ghost" id="bk2">← Kembali</button>' +
          '<button class="btn" id="go">Mulai pakai NataHub →</button>' +
        '</div>' +
      '</div>';
  }

  var ft = lo
    ? '<div class="af"><span>Enkripsi SSL 256-bit aktif</span><span>Kebijakan Privasi · Syarat &amp; Ketentuan · Pusat Bantuan</span></div>'
    : '<p class="lbl ac" style="padding:0 18px 20px;margin:0">Dengan mendaftar, kamu menyetujui <b>Syarat &amp; Ketentuan</b> serta <b>Kebijakan Privasi Data</b> NataHub.</p>';

  return '<div class="auth-shell">' +

    '<section class="auth-visual" aria-label="Tentang NataHub">' +

      '<div class="hero-brand">' +
        '<img class="hero-logo-image" src="NataHub%20Purple%20Ribbon%20Logo.png" alt="NataHub logo">' +
      '</div>' +

      '<div class="hero-content">' +
        '<div class="hero-eyebrow"><span></span> OPERASIONAL BISNIS DALAM SATU RUANG</div>' +
        '<h1>Bisnis bergerak.<br><em>Kamu tetap pegang kendali.</em></h1>' +
        '<p>Persediaan, percakapan pelanggan, dan rencana restock tersusun dalam satu workspace yang lebih rapi.</p>' +

        '<div class="hero-tiles">' +
          '<div class="hero-tile"><span>01 / STOK</span><b>Inventory terpantau</b><small>Lihat stok dan kebutuhan restock.</small></div>' +
          '<div class="hero-tile"><span>02 / CHAT</span><b>Inbox lebih terarah</b><small>Prioritaskan pesan yang penting.</small></div>' +
          '<div class="hero-tile"><span>03 / FLOW</span><b>Otomasi terkendali</b><small>Persetujuan tetap di tanganmu.</small></div>' +
        '</div>' +
      '</div>' +

      '<div class="hero-console" aria-hidden="true">' +
        '<div class="console-top"><i></i><i></i><i></i><span>BUSINESS OVERVIEW / DEMO</span></div>' +
        '<div class="console-grid">' +
          '<div class="console-mini"><span>Inventory health</span><strong>99.4% <em>↑ stabil</em></strong><div class="console-spark"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>' +
          '<div class="console-mini"><span>Pesanan hari ini</span><strong>38 <em>+12%</em></strong><div class="console-stock"><span>Status operasional</span><b>Terpantau</b></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="hero-foot"><span>DIBUAT UNTUK OPERASIONAL HARIAN</span><span>© NataHub 2026</span></div>' +
    '</section>' +

    '<section class="auth-content">' + hd +
      '<div class="ab">' + b + '</div>' + ft +
    '</section>' +

  '</div>';
}

function bindAuth() {
  var g = function (i, f) {
    if ($(i)) $(i).onclick = f;
  };

  var v = function (i, f) {
    if ($(i)) {
      $(i).oninput = function () {
        f($(i).value);
      };
    }
  };

  [].forEach.call(document.querySelectorAll("[data-sc]"), function (b) {
    b.onclick = function () {
      scr = b.dataset.sc;
      err = "";
      draw();
    };
  });

  v("le", function (x) { lg.e = x; });
  v("lp", function (x) { lg.p = x; });
  v("rn", function (x) { reg.name = x; });
  v("re", function (x) { reg.email = x; });
  v("rs", function (x) { reg.store = x; });

  g("tp", function () {
    sp = !sp;
    draw();
  });

  g("li", function () {
    if (!lg.e.trim() || !lg.p) {
      err = "Isi email atau nomor WhatsApp dan kata sandi.";
      draw();
      return;
    }

    enter();
  });

  g("n1", function () {
    if (!reg.name.trim() || !reg.store.trim() || reg.email.indexOf("@") < 1) {
      err = "Lengkapi nama, email yang valid, dan nama toko.";
      draw();
      return;
    }

    err = "";
    scr = "r2";
    draw();
  });

  [].forEach.call(document.querySelectorAll("[data-shop]"), function (b) {
    b.onclick = function () {
      shopSel[b.dataset.shop] = !shopSel[b.dataset.shop];
      err = "";
      draw();
    };
  });

  g("bk1", function () {
    scr = "r1";
    err = "";
    draw();
  });

  g("n2", function () {
    if (!selShops().length) {
      err = "Pilih minimal satu toko.";
      draw();
      return;
    }

    err = "";
    scr = "r3";
    draw();
  });

  g("bk2", function () {
    scr = "r2";
    draw();
  });

  g("go", enter);
}

/* RENDER & INTERAKSI DASHBOARD */

function draw() {
  var ap = scr === "app";

  $("auth").hidden = ap;
  $("side").hidden = !ap;
  $("shell").hidden = !ap;

  if (!ap) {
    $("auth").innerHTML = auth();
    bindAuth();
    return;
  }

  $("chips").innerHTML = U.shops.map(function (s) {
    return '<span class="sync">' + s + '</span>';
  }).join("");

  $("stn").textContent = U.store;

  $("kl").onclick = function () {
    scr = "login";
    lg = { e: "", p: "" };
    sp = false;
    err = "";
    draw();
  };

  sd();

  $("m").innerHTML = ({
    ov: ov,
    ib: ib,
    inv: inv,
    rs: rs,
    au: au,
    kq: kq
  })[tab]();

  var g = function (i, f) {
    if ($(i)) $(i).onclick = f;
  };

  var all = function (s, f) {
    [].forEach.call(document.querySelectorAll(s), f);
  };

  all("[data-go]", function (b) {
    b.onclick = function () {
      tab = b.dataset.go;
      draw();
    };
  });

  all(".msg", function (b) {
    b.onclick = function () {
      ms = +b.dataset.i;
      draw();
    };
  });

  all("[data-ch]", function (b) {
    b.onclick = function () {
      ch = b.dataset.ch;
      draw();
    };
  });

  all("[data-iv]", function (b) {
    b.onclick = function () {
      iv = b.dataset.iv;
      msg = "";
      draw();
    };
  });

  all("[data-sup]", function (b) {
    b.onclick = function () {
      sup = +b.dataset.sup;
      draw();
    };
  });

  all("[data-n]", function (b) {
    b.onclick = function () {
      nd = +b.dataset.n;
      draw();
    };
  });

  all("[data-op]", function (b) {
    b.onchange = function () {
      opn[+b.dataset.op] = Math.max(0, +b.value || 0);
      draw();
    };
  });

  g("snd", function () {
    M[ms].d = $("dr").value;
    M[ms].sent = true;
    draw();
  });

  g("na", function () {
    var t = $("nt").value.trim();

    if (!t) return;

    var c = classify(t);

    M.unshift({
      w: "Customer baru",
      ch: "WhatsApp",
      t: t,
      c: c,
      m: c ? "draft" : "auto",
      d: c === "r"
        ? "Mohon maaf atas ketidaknyamanannya. Boleh kami minta detail masalahnya agar segera kami bantu?"
        : c === "g"
          ? "Terima kasih atas masukannya, kami catat untuk evaluasi."
          : "Terima kasih sudah bertanya, tim kami akan segera membantu.",
      sent: !c
    });

    ms = 0;
    ch = "Semua";
    draw();
  });

  g("po", function () {
    po = true;
    draw();
  });

  g("ss", function () {
    showSup = !showSup;
    draw();
  });

  g("sm", function () {
    sim = true;
    draw();
  });

  g("sop", function () {
    var w = now();

    P.forEach(function (p, i) {
      if (opn[i] !== undefined && opn[i] !== stock(i)) {
        var df = opn[i] - stock(i);

        H.push({
          k: df > 0 ? "in" : "out",
          p: p.n,
          q: Math.abs(df),
          w: w,
          note: "Koreksi opname"
        });
      }
    });

    opn = {};
    msg = "Hasil opname tersimpan. Stok sudah dikoreksi dan disinkronkan.";
    draw();
  });

  all(".seg [data-m]", function (b) {
    b.onclick = function () {
      mode = b.dataset.m;
      msg = "";
      draw();
    };
  });

  if ($("sp")) {
    $("sp").onchange = function () {
      sel = +$("sp").value;
      qty = 1;
      msg = "";
      draw();
    };
  }

  g("mn", function () {
    if (qty > 1) {
      qty--;
      draw();
    }
  });

  g("pl", function () {
    qty++;
    draw();
  });

  g("sv", function () {
    var p = P[sel];

    if (mode === "out" && qty > stock(sel)) {
      msg = "Stok " + p.n + " hanya " + stock(sel) + ". Kurangi jumlah keluar.";
      draw();
      return;
    }

    H.push({
      k: mode,
      p: p.n,
      q: qty,
      w: now()
    });

    msg = "Tersimpan dan disinkronkan ke marketplace. Stok " +
      p.n + " sekarang " + stock(sel) + ".";

    qty = 1;
    draw();
  });
}

draw();
