/* ======================================================================
   Fulfillment & Packing: kanban, QC, manifest handover
   ====================================================================== */
(function () {
  'use strict';

  var activeModalCardId = null;
  var activeHandoverData = null;

  var handoverRegistry = {
    'manifest-jt': {
      resi: 'JT-MANIFEST-BATCH-04', courier: 'J&T Express', driver: 'Sprinter Dani Saputra',
      customer: 'Manifest Serah Terima Gudang (3 Koli)', location: 'Cipadu Hub',
      product: '3 Pesanan Terverifikasi', orderId: '#MAN-JT-04',
      weight: '1.85 kg / 3 Koli', qc: 'Semua Lolos QC Gudang'
    }
  };

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function packToast(title, desc) {
    showToast('<strong>' + esc(title) + '</strong>: ' + esc(desc), 'success');
  }

  function showPackModal(id) {
    var m = $(id);
    m.classList.remove('hidden'); m.classList.add('flex');
    setTimeout(function () { m.classList.remove('opacity-0'); }, 10);
  }

  function hidePackModal(id, after) {
    var m = $(id);
    m.classList.add('opacity-0');
    setTimeout(function () {
      m.classList.add('hidden'); m.classList.remove('flex');
      if (after) after();
    }, 200);
  }

  function updateCounters() {
    var p = $('cards-perlu-diproses').children.length;
    var s = $('cards-sedang-dipacking').children.length;
    var k = $('cards-siap-diambil').children.length;
    $('count-perlu-diproses').textContent = p;
    $('count-sedang-dipacking').textContent = s;
    $('count-siap-diambil').textContent = k;
    $('kpi-perlu-diproses').textContent = p;
    $('kpi-sedang-packing').textContent = s;
    $('kpi-siap-pickup').textContent = k;
  }

  function startPacking(cardId) {
    var card = $(cardId); if (!card) return;
    var orderId = card.getAttribute('data-order') || '#ORD';
    var wrap = card.querySelector('.pack-action');
    if (wrap) {
      wrap.innerHTML =
        '<button type="button" onclick="openVerifyModal(\'' + cardId + '\')" class="w-full h-8 rounded-lg bg-navy hover:bg-navy/90 text-white font-jakarta font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-2xs transition-all">' +
        '<span class="material-symbols-outlined text-[16px]">task_alt</span><span>Konfirmasi Packing Selesai</span></button>';
    }
    $('cards-sedang-dipacking').prepend(card);
    updateCounters();
    packToast('Pesanan Dipindahkan', orderId + ' masuk ke antrean Sedang Dipacking');
  }

  function openVerifyModal(cardId) {
    var card = $(cardId); if (!card) return;
    activeModalCardId = cardId;
    $('modal-order-id').textContent = card.getAttribute('data-order') || '-';
    $('modal-customer').textContent = card.getAttribute('data-customer') || '-';
    $('modal-product').textContent = card.getAttribute('data-product') || '-';
    $('modal-resi').textContent = card.getAttribute('data-resi') || '-';
    ['chk-product', 'chk-qc', 'chk-resi'].forEach(function (id) { $(id).checked = true; });
    showPackModal('verify-modal');
  }

  function closeVerifyModal() {
    hidePackModal('verify-modal', function () { activeModalCardId = null; });
  }

  function confirmPackingDone() {
    if (!activeModalCardId) return;
    var card = $(activeModalCardId);
    if (!card) { closeVerifyModal(); return; }

    var orderId = card.getAttribute('data-order') || '#ORD';
    var customer = card.getAttribute('data-customer') || '';
    var courier = card.getAttribute('data-courier') || 'Kurir Logistik';
    var resi = card.getAttribute('data-resi') || 'RESIAUTO';
    var product = card.getAttribute('data-product') || 'Produk Pesanan';
    var channel = inferPackChannel(card);

    var key = activeModalCardId + '-ready';
    handoverRegistry[key] = {
      resi: resi, courier: courier, driver: 'Driver Penjemputan Resmi', customer: customer,
      location: 'Area Pengiriman', product: product, orderId: orderId,
      weight: '0.40 kg / 1 Koli', qc: 'Terverifikasi QC (Budi Santoso)'
    };

    var n = document.createElement('div');
    n.id = key;
    n.className = 'pack-card bg-white rounded-xl p-3 border border-warm-border shadow-2xs hover:shadow-sm transition-shadow flex flex-col gap-2.5';
    n.setAttribute('data-channel', channel);
    n.setAttribute('data-order', orderId);
    n.setAttribute('data-customer', customer);
    n.setAttribute('data-product', product);
    n.setAttribute('data-resi', resi);
    n.setAttribute('data-courier', courier);
    n.innerHTML =
      '<div class="flex items-center justify-between">' +
        '<div class="flex items-center gap-1.5"><span class="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px]">Gudang Siap</span>' +
        '<span class="text-[11px] font-mono-code text-navy-muted font-medium">' + esc(orderId) + '</span></div>' +
        '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">verified</span> Packing Terkonfirmasi</span>' +
      '</div>' +
      '<div><span class="font-jakarta font-bold text-[13px] text-navy block">' + esc(customer) + '</span></div>' +
      '<div class="bg-sky-50 border border-sky-100 rounded-lg p-2.5 flex items-center justify-between">' +
        '<div class="flex items-center gap-2"><span class="material-symbols-outlined text-emerald-700 text-[18px]">local_shipping</span>' +
        '<div><span class="text-[12px] font-bold text-navy block">' + esc(courier) + '</span>' +
        '<span class="text-[10px] text-navy-muted font-mono-code">Resi: ' + esc(resi) + '</span></div></div>' +
        '<div class="text-right"><span class="text-[10px] text-sky-700 font-semibold block">Jadwal: Standby Pickup</span>' +
        '<span class="text-[9px] text-emerald-700 font-bold">Menunggu Kurir</span></div>' +
      '</div>' +
      '<div class="text-[10px] text-navy-muted italic flex items-center gap-1 pt-0.5"><span class="material-symbols-outlined text-[12px] text-emerald-600">done_all</span><span>Dikonfirmasi oleh Budi Santoso (Admin Gudang) • Baru saja</span></div>' +
      '<div class="pt-1 border-t border-warm-border"><div class="flex items-center gap-2">' +
        '<button type="button" onclick="packToast(\'Kurir Dipanggil\',\'Notifikasi driver pick-point telah dikirim\')" class="w-1/2 h-7 rounded-lg bg-cream-canvas hover:bg-sky-50 text-navy font-semibold text-[10px] border border-warm-border flex items-center justify-center gap-1"><span class="material-symbols-outlined text-[13px]">call</span><span>Panggil Kurir</span></button>' +
        '<button type="button" onclick="openHandoverModalById(\'' + key + '\')" class="w-1/2 h-7 rounded-lg bg-navy hover:bg-navy/90 text-white font-semibold text-[10px] flex items-center justify-center gap-1 shadow-2xs"><span class="material-symbols-outlined text-[13px]">qr_code_scanner</span><span>Manifest &amp; Handover</span></button>' +
      '</div></div>';

    $('cards-siap-diambil').prepend(n);
    card.remove();
    activeModalCardId = null;
    updateCounters();
    hidePackModal('verify-modal');
    packToast('Packing Terverifikasi', orderId + ' dipindahkan ke Siap Diambil Kurir');
  }

  function buildBarcodeSvg(code) {
    var str = String(code || '0');
    var x = 10, bars = '';
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      for (var b = 0; b < 4; b++) {
        var w = (((c >> b) & 3) + 1) * 1.6;
        bars += '<rect fill="#121D38" x="' + x.toFixed(1) + '" y="2" width="' + w.toFixed(1) + '" height="60" />';
        x += w + 2;
      }
    }
    var width = Math.max(340, Math.ceil(x + 10));
    return '<svg class="w-full h-16" viewBox="0 0 ' + width + ' 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' + bars + '</svg>';
  }

  function openHandoverModalById(key) {
    var data = handoverRegistry[key];
    if (!data) return;
    openHandoverModal(data);
  }

  function openHandoverModal(data) {
    activeHandoverData = data;
    var resi = data.resi || 'JT992817462';
    $('handover-header-sub').textContent = resi + ' - ' + (data.courier || 'J&T Express');
    $('barcode-courier-tag').textContent = data.courier || 'J&T Express';
    $('barcode-number').textContent = resi;
    $('barcode-svg-wrap').innerHTML = buildBarcodeSvg(resi);
    $('handover-customer').textContent = data.customer || '-';
    $('handover-location').textContent = data.location || '-';
    $('handover-product').textContent = data.product || '-';
    $('handover-courier').textContent = data.courier || 'J&T Express';
    $('handover-driver').textContent = data.driver || '-';
    $('handover-qc').textContent = data.qc || '-';
    $('handover-weight').textContent = data.weight || '-';

    var m = $('handover-modal'), d = $('handover-modal-dialog');
    m.classList.remove('hidden'); m.classList.add('flex');
    setTimeout(function () {
      m.classList.remove('opacity-0');
      d.classList.remove('scale-95'); d.classList.add('scale-100');
    }, 10);
  }

  function closeHandoverModal() {
    var m = $('handover-modal'), d = $('handover-modal-dialog');
    m.classList.add('opacity-0');
    d.classList.remove('scale-100'); d.classList.add('scale-95');
    setTimeout(function () {
      m.classList.add('hidden'); m.classList.remove('flex');
      activeHandoverData = null;
    }, 200);
  }

  function handleHandoverBackdropClick(event) {
    if (event.target && event.target.id === 'handover-modal') closeHandoverModal();
  }

  function confirmHandoverDone() {
    var data = activeHandoverData;
    var resi = data && data.resi ? data.resi : 'JT992817462';
    var courier = data && data.courier ? data.courier : 'Kurir';
    closeHandoverModal();
    packToast('Serah Terima Sukses!', 'Paket dengan Resi ' + resi + ' (' + courier + ') telah berhasil di-handover');
  }

  function packCreateSplit() {
    packToast('Paket Baru Dibuat', 'Pashmina & Mukena dipisahkan jadi Paket 2/3');
  }

  function packPrintManifest(courier, count) {
    packToast('Manifest ' + courier + ' Siap', 'Manifest fisik ' + count + ' paket ' + courier + ' telah dicetak.');
  }

  function packBatchPrint() {
    packToast('Batch Print Aktif', '12 thermal label dikirim ke antrean cetak.');
  }

  function packRefresh() {
    packToast('Memuat Ulang Antrean', 'Semua kanal marketplace diperbarui.');
  }

  function packUndo() {
    packToast('Undo Operasional', 'Status pesanan sebelumnya dikembalikan');
  }

  function packRedo() {
    packToast('Redo Operasional', 'Tindakan dijalankan kembali');
  }

  var activePackChannel = 'all';

  function inferPackChannel(card) {
    if (!card) return 'other';
    var existing = card.getAttribute('data-channel');
    if (existing) return existing;
    var order = (card.getAttribute('data-order') || '').toUpperCase();
    if (order.indexOf('ORD-SP-') !== -1) return 'shopee';
    if (order.indexOf('ORD-TK-') !== -1) return 'tiktok';
    if (order.indexOf('ORD-WA-') !== -1) return 'whatsapp';
    if (order.indexOf('ORD-TP-') !== -1) return 'tokopedia';
    var content = (card.textContent || '').toLowerCase();
    if (content.indexOf('tiktok shop') !== -1) return 'tiktok';
    if (content.indexOf('tokopedia') !== -1) return 'tokopedia';
    if (content.indexOf('whatsapp') !== -1) return 'whatsapp';
    if (content.indexOf('shopee') !== -1) return 'shopee';
    return 'other';
  }

  function applyPackFilters() {
    var q = String(($('pack-search') && $('pack-search').value) || '').trim().toLowerCase();
    document.querySelectorAll('#pack-board .pack-card').forEach(function (card) {
      var channel = inferPackChannel(card);
      card.setAttribute('data-channel', channel);
      var hay = (card.textContent + ' ' + (card.getAttribute('data-resi') || '') + ' ' + (card.getAttribute('data-product') || '') + ' ' + (card.getAttribute('data-order') || '')).toLowerCase();
      var matchesChannel = activePackChannel === 'all' || channel === activePackChannel;
      var matchesSearch = !q || hay.indexOf(q) !== -1;
      card.classList.toggle('hidden', !(matchesChannel && matchesSearch));
    });
  }

  function packSearch(query) {
    applyPackFilters();
  }

  function bindChannelPills() {
    var box = $('pack-channel-filters'); if (!box) return;
    var btns = box.querySelectorAll('button[data-channel]');
    // Assign channel metadata once so cards remain filterable after moving between columns.
    document.querySelectorAll('#pack-board .pack-card').forEach(function (card) {
      card.setAttribute('data-channel', inferPackChannel(card));
    });
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activePackChannel = btn.getAttribute('data-channel') || 'all';
        btns.forEach(function (b) {
          var active = b === btn;
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
          b.classList.toggle('bg-navy', active);
          b.classList.toggle('text-white', active);
          b.classList.toggle('shadow-2xs', active);
          b.classList.toggle('font-semibold', active);
          b.classList.toggle('bg-cream-canvas', !active);
          b.classList.toggle('text-navy', !active);
          b.classList.toggle('font-medium', !active);
        });
        applyPackFilters();
        var label = btn.querySelector('span:nth-child(2)') ? btn.querySelector('span:nth-child(2)').textContent.trim() : btn.querySelector('span').textContent.trim();
        if (activePackChannel === 'all') label = 'Semua Kanal';
        packToast('Filter Diterapkan', 'Menampilkan pesanan kanal ' + label + '.');
      });
    });
    applyPackFilters();
  }

  var api = {
    packToast: packToast, startPacking: startPacking,
    openVerifyModal: openVerifyModal, closeVerifyModal: closeVerifyModal,
    confirmPackingDone: confirmPackingDone,
    openHandoverModalById: openHandoverModalById, closeHandoverModal: closeHandoverModal,
    handleHandoverBackdropClick: handleHandoverBackdropClick,
    confirmHandoverDone: confirmHandoverDone,
    packCreateSplit: packCreateSplit, packPrintManifest: packPrintManifest,
    packBatchPrint: packBatchPrint, packRefresh: packRefresh,
    packUndo: packUndo, packRedo: packRedo, packSearch: packSearch
  };
  Object.keys(api).forEach(function (k) { window[k] = api[k]; });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('verify-modal').classList.contains('hidden')) closeVerifyModal();
    if (!$('handover-modal').classList.contains('hidden')) closeHandoverModal();
  });

  bindChannelPills();
  updateCounters();
})();
