/* Login & daftar: gerbang masuk sebelum dashboard.
   Dibungkus IIFE; hanya window.NataAuth.logout() yang dibuka ke luar. */
(function () {
  var $ = function (id) {
    return document.getElementById(id);
  };

  var LOGO = "NataHub%20Purple%20Ribbon%20Logo.png";

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

  function logoLogin() {
    return '<div class="alogo">' +
      '<span class="logo-img-crop login-symbol">' +
        '<img src="' + LOGO + '" alt="NataHub">' +
      '</span>' +
    '</div>';
  }

  function auth() {
    var lo = scr === "login";
    var b = "";

    var hd =
      '<div class="ah">' +
        '<div class="logo" style="padding:0">' +
          '<span class="logo-img-crop"><img src="' + LOGO + '" alt="NataHub"></span>' +
          '<span>NataHub</span>' +
        '</div>' +
        '<div class="lbl">' +
          (lo
            ? 'Belum punya akun? <button class="lk" data-sc="r1">Daftar Bisnis</button>'
            : 'Sudah punya akun? <button class="lk" data-sc="login">Masuk</button>') +
        '</div>' +
      '</div>';

    if (lo) {
      b =
        '<div class="acard">' +
          logoLogin() +
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
          '<img class="hero-logo-image" src="' + LOGO + '" alt="NataHub logo">' +
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

  function initials(name) {
    var p = String(name).trim().split(/\s+/);
    return ((p[0] || "").charAt(0) + (p[1] || "").charAt(0)).toUpperCase() || "NH";
  }

  function showApp() {
    $("auth").hidden = true;
    $("app-root").hidden = false;

    if (U && reg.name) {
      currentUser.name = U.name;
      currentUser.initials = initials(U.name);
      $("profile-name").textContent = U.name;
      $("profile-initials").textContent = currentUser.initials;
      $("active-store-name").textContent = U.store;

      var first = document.querySelector("#store-dropdown button");
      if (first) {
        var label = first.querySelector("div > div");
        if (label) label.textContent = U.store;
        first.setAttribute("onclick", "selectStore(" + JSON.stringify(U.store) + ")");
      }
    }

    navigateTo("workflow-canvas");
    fitCanvasToViewport();
    window.scrollTo(0, 0);
  }

  function enter() {
    if (reg.name) {
      U = { name: reg.name, store: reg.store, shops: selShops() };
    }

    err = "";
    showApp();
  }

  function draw() {
    $("app-root").hidden = true;
    $("auth").hidden = false;
    $("auth").innerHTML = auth();
    bindAuth();
  }

  window.NataAuth = {
    logout: function () {
      scr = "login";
      lg = { e: "", p: "" };
      sp = false;
      err = "";
      draw();
      window.scrollTo(0, 0);
    }
  };

  draw();
})();
