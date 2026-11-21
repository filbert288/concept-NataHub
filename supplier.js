/* ======================================================================
   Supplier & Restock: supplier, rating, PO, AI matchmaker
   ====================================================================== */
(function () {
  'use strict';

  // Penyimpanan supplier: disimpan di localStorage browser agar tidak hilang saat refresh.
  // Untuk produksi, ganti loadSuppliers/persistSuppliers dengan panggilan API ke database.
  const SUPPLIER_STORAGE_KEY = 'natahub.suppliers.v1';

  const defaultSuppliers = [
    { id: 'sup-1', nama: 'CV Tekstil Jaya Bandung', spesialisasi: 'Gamis Ceruty & Silk', kota: 'Bandung', leadTime: '2–3 Hari', moq: 50, wa: '+62 812-2091-4410', skorAwal: 98, hargaPerPcs: 112000, ratings: [] },
    { id: 'sup-2', nama: 'PT Mitra Konveksi Solo', spesialisasi: 'Kemeja Linen & Flanel', kota: 'Solo', leadTime: '4–5 Hari', moq: 120, wa: '+62 811-2650-8821', skorAwal: 94, hargaPerPcs: 106500, ratings: [] },
    { id: 'sup-3', nama: 'Sentra Hijab Tasikmalaya', spesialisasi: 'Voal, Pashmina & Jersey', kota: 'Tasikmalaya', leadTime: '3 Hari', moq: 40, wa: '+62 813-9400-1172', skorAwal: 91, hargaPerPcs: 38000, ratings: [] },
    { id: 'sup-4', nama: 'CV Berkah Kain Nusantara', spesialisasi: 'Rayon Viscose & Katun', kota: 'Jakarta', leadTime: '3–4 Hari', moq: 100, wa: '+62 819-3321-9904', skorAwal: 95, hargaPerPcs: null, ratings: [] }
  ];

  function loadSuppliers() {
    try {
      const raw = localStorage.getItem(SUPPLIER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Gagal memuat data supplier, memakai data awal.', err);
    }
    return JSON.parse(JSON.stringify(defaultSuppliers));
  }

  function persistSuppliers() {
    try {
      localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliers));
    } catch (err) {
      console.warn('Gagal menyimpan data supplier.', err);
    }
  }

  let suppliers = loadSuppliers();

  const supplierPoList = [
    { id: 'PO-2026-089', supplierId: 'sup-1', supplier: 'CV Tekstil Jaya Bandung', item: 'Gamis Navy Ceruty L (GMS-NVY-L)', qty: 100, unitPrice: 112000, status: 'draft', eta: 'Est. 18 Nov 2026', source: 'Draf AI Restock Advisor' },
    { id: 'PO-2026-088', supplierId: 'sup-3', supplier: 'Sentra Hijab Tasikmalaya', item: 'Hijab Segiempat Voal Hitam (HJB-BLK-01)', qty: 80, unitPrice: 38000, status: 'shipping', eta: 'Tiba Besok (16 Nov 2026)', source: 'Resi JNE Cargo: JNE8821902' },
    { id: 'PO-2026-087', supplierId: 'sup-2', supplier: 'PT Mitra Konveksi Solo', item: 'Kemeja Linen Pria Putih XL (KMG-WHT-XL)', qty: 60, unitPrice: 95000, status: 'sent', eta: 'Est. 19 Nov 2026', source: 'Dikonfirmasi Supplier' },
    { id: 'PO-2026-086', supplierId: 'sup-1', supplier: 'CV Tekstil Jaya Bandung', item: 'Gamis Navy Ceruty L (GMS-NVY-L)', qty: 50, unitPrice: 112000, status: 'done', eta: 'Diterima Gudang', source: 'Penerimaan Gudang Terverifikasi' }
  ];

  const ratingCriteria = [
    { key: 'ketepatanWaktu', label: 'Ketepatan Waktu' },
    { key: 'kualitasBarang', label: 'Kualitas Barang' },
    { key: 'harga', label: 'Harga' },
    { key: 'komunikasi', label: 'Komunikasi' }
  ];

  let currentSelectedSupplierId = null;
  let editingSupplierRatingId = null;
  let ratingDraft = { ketepatanWaktu: 0, kualitasBarang: 0, harga: 0, komunikasi: 0 };
  let ratingHover = null;
  let preselectedSupplierPoId = '';
  let activeSupplierPoTab = 'all';
  let newSupplierIdCounter = 1;
  let highlightedNewSupplierId = null;

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function formatRupiah(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? 'Rp ' + n.toLocaleString('id-ID') : 'Belum tersedia';
  }

  function evaluationScore(rating) {
    return ratingCriteria.reduce((sum, item) => sum + (Number(rating[item.key]) || 0), 0) / 4 * 20;
  }

  function getSupplierScore(supplier) {
    if (!supplier) return null;
    const ratings = Array.isArray(supplier.ratings) ? supplier.ratings : [];
    if (supplier.skorAwal !== null && supplier.skorAwal !== undefined && Number.isFinite(Number(supplier.skorAwal))) {
      const total = ratings.reduce((sum, item) => sum + evaluationScore(item), 0);
      return (Number(supplier.skorAwal) * 5 + total) / (5 + ratings.length);
    }
    if (!ratings.length) return null;
    return ratings.reduce((sum, item) => sum + evaluationScore(item), 0) / ratings.length;
  }

  function getScoreBadgeClass(score) {
    if (score === null || score === undefined || !Number.isFinite(Number(score))) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (score >= 95) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 85) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }

  function getScoreBadgeText(supplier) {
    const score = getSupplierScore(supplier);
    return score === null ? 'Belum dinilai' : `Skor ${Math.round(score)}%`;
  }

  function getSupplierById(id) {
    return suppliers.find(item => item.id === id) || null;
  }

  function findSupplierByName(name) {
    const normalized = String(name || '').trim().toLocaleLowerCase('id-ID');
    return suppliers.find(item => item.nama.toLocaleLowerCase('id-ID') === normalized) || null;
  }

  function renderSupplierDatabaseList() {
    const container = document.getElementById('supplier-database-list-container');
    if (!container) return;
    const q = (document.getElementById('supplier-search-input')?.value || '').trim().toLocaleLowerCase('id-ID');
    const list = q
      ? suppliers.filter(s => [s.nama, s.spesialisasi, s.kota, s.leadTime, s.wa].some(v => String(v || '').toLocaleLowerCase('id-ID').includes(q)))
      : suppliers;
    if (!list.length) {
      container.innerHTML = `<div class="p-4 rounded-xl bg-cream-canvas border border-warm-border text-[12px] text-navy-muted text-center italic">Tidak ada supplier yang cocok dengan "${escapeHTML(q)}".</div>`;
      return;
    }
    container.innerHTML = list.map(supplier => {
      const score = getSupplierScore(supplier);
      const badge = getScoreBadgeClass(score);
      const badgeText = getScoreBadgeText(supplier);
      const highlight = supplier.id === highlightedNewSupplierId ? 'ring-2 ring-emerald-300 bg-emerald-50/60' : '';
      return `
        <div role="button" tabindex="0" title="Klik untuk melihat detail & beri penilaian" aria-label="Detail ${escapeHTML(supplier.nama)}" onclick="openSupplierDetailModal('${supplier.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSupplierDetailModal('${supplier.id}')}" class="p-3 rounded-xl bg-cream-canvas/80 hover:bg-sage-soft/40 border border-warm-border flex items-center justify-between gap-2 cursor-pointer transition-all shadow-2xs hover:shadow-sm ${highlight}">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-jakarta font-bold text-[13px] text-navy truncate">${escapeHTML(supplier.nama)}</span>
              <span class="px-1.5 py-0.5 rounded border text-[10px] font-bold shrink-0 ${badge}">${escapeHTML(badgeText)}</span>
            </div>
            <div class="text-[11px] text-navy-muted mt-0.5">${escapeHTML(supplier.spesialisasi)} • Lead Time: ${escapeHTML(supplier.leadTime)} • MOQ: ${supplier.moq} pcs</div>
          </div>
          <button type="button" onclick="event.stopPropagation();contactSupplier('${supplier.id}')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sage-soft text-navy font-semibold text-[11px] border border-warm-border shrink-0">Hubungi</button>
        </div>`;
    }).join('');
  }

  function renderSupplierDropdown(selectedId = '') {
    const select = document.getElementById('po-supplier-select');
    if (!select) return;
    const previous = selectedId || select.value;
    select.innerHTML = suppliers.map(supplier => `<option value="${supplier.id}">${escapeHTML(supplier.nama)}</option>`).join('');
    if (previous && getSupplierById(previous)) select.value = previous;
    else if (suppliers[0]) select.value = suppliers[0].id;
  }

  function renderAIMatchmaker() {
    const container = document.getElementById('ai-matchmaker-list');
    const count = document.getElementById('ai-matchmaker-count');
    if (!container) return;
    const ranked = [...suppliers].sort((a, b) => {
      const aScore = getSupplierScore(a);
      const bScore = getSupplierScore(b);
      return (bScore ?? -1) - (aScore ?? -1);
    }).slice(0, 2);
    if (count) count.textContent = `${ranked.length} Vendor Terverifikasi`;
    container.innerHTML = ranked.map((supplier, index) => {
      const score = getSupplierScore(supplier);
      const scoreLabel = score === null ? 'Belum dinilai' : `Skor ${Math.round(score)}%`;
      const badgeClass = getScoreBadgeClass(score);
      const cardClass = index === 0 ? 'rounded-xl border-2 border-sage bg-sage-soft/30' : 'rounded-xl border border-warm-border bg-cream-canvas/60';
      const titleBadgeClass = index === 0 ? 'bg-emerald-600 text-white' : 'bg-white text-navy-muted border border-warm-border';
      const priceText = formatRupiah(supplier.hargaPerPcs);
      const avgStars = supplier.ratings.length
        ? (supplier.ratings.reduce((sum, rating) => sum + ratingCriteria.reduce((inner, item) => inner + Number(rating[item.key] || 0), 0) / 4, 0) / supplier.ratings.length).toFixed(1)
        : '—';
      return `
        <div class="${cardClass} p-3.5 flex flex-col justify-between gap-3 relative">
          <div>
            <div class="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded-md ${titleBadgeClass} text-[10px] font-bold">${index === 0 ? 'Rekomendasi AI' : 'Opsi Alternatif'}</span>
              <span class="px-1.5 py-0.5 rounded border text-[10px] font-bold ${badgeClass}">${escapeHTML(scoreLabel)}</span>
            </div>
            <h3 class="font-jakarta font-extrabold text-[14px] text-navy">${escapeHTML(supplier.nama)}</h3>
            <div class="text-[11px] text-navy-muted">${escapeHTML(supplier.spesialisasi)} • ${escapeHTML(supplier.kota || 'Lokasi belum diisi')}</div>
            <div class="mt-3 space-y-1.5 text-[12px] border-t border-warm-border pt-2.5">
              <div class="flex justify-between gap-2"><span class="text-navy-muted">Harga Grosir / pcs:</span><strong class="text-navy tabular-nums">${escapeHTML(priceText)}</strong></div>
              <div class="flex justify-between gap-2"><span class="text-navy-muted">Min. Order (MOQ):</span><strong class="text-navy tabular-nums">${supplier.moq} pcs</strong></div>
              <div class="flex justify-between gap-2"><span class="text-navy-muted">Estimasi Tiba:</span><strong class="text-navy">${escapeHTML(supplier.leadTime)}</strong></div>
              <div class="flex justify-between gap-2"><span class="text-navy-muted">Rata-rata Rating:</span><strong class="text-navy">${avgStars === '—' ? 'Belum ada rating' : `${avgStars}/5`}</strong></div>
            </div>
          </div>
          <button type="button" onclick="selectSupplierForRecommendation('${supplier.id}')" class="w-full py-2 rounded-xl ${supplier.id === selectedRestockSupplierId ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : index === 0 ? 'bg-navy hover:bg-navy/90 text-white' : 'bg-white hover:bg-sage-soft text-navy border border-warm-border'} font-jakarta font-bold text-[12px] transition-colors shadow-2xs">${supplier.id === selectedRestockSupplierId ? 'Dipilih ✓' : 'Pilih Supplier'}</button>
        </div>`;
    }).join('');
  }

  let selectedRestockSupplierId = 'sup-1';
  const RESTOCK_ITEM = { name: 'Gamis Navy Ceruty L (GMS-NVY-L)', qty: 100 };

  function selectSupplierForRecommendation(supplierId) {
    const supplier = getSupplierById(supplierId);
    if (!supplier) return;
    selectedRestockSupplierId = supplierId;
    renderAIMatchmaker();
    renderRestockRecommendation();
    showToast(`${escapeHTML(supplier.nama)} dipilih untuk restock ${RESTOCK_ITEM.name}.`, 'success');
  }

  function renderRestockRecommendation() {
    const supplier = getSupplierById(selectedRestockSupplierId);
    const nameEl = document.getElementById('restock-supplier-name');
    const priceEl = document.getElementById('restock-supplier-price');
    const btn = document.getElementById('restock-draft-po-btn');
    if (nameEl) nameEl.textContent = supplier ? supplier.nama : 'Belum dipilih';
    if (priceEl) priceEl.textContent = supplier ? formatRupiah(supplier.hargaPerPcs) : '-';
    if (btn) btn.disabled = !supplier;
  }

  function nextPoId() {
    const last = Math.max(89, ...supplierPoList.map(po => Number(String(po.id).split('-').pop()) || 0));
    return `PO-2026-${String(last + 1).padStart(3, '0')}`;
  }

  // Draf PO dari rekomendasi restock: masuk ke Manajemen PO dengan Prioritas #1 dan tampil paling atas.
  function createRestockDraftPo() {
    const supplier = getSupplierById(selectedRestockSupplierId);
    if (!supplier) { showToast('Pilih supplier dulu di AI Matchmaker.', 'error'); return; }
    const qty = Math.max(RESTOCK_ITEM.qty, Number(supplier.moq) || 0);
    const newId = nextPoId();
    supplierPoList.unshift({
      id: newId, supplierId: supplier.id, supplier: supplier.nama, item: RESTOCK_ITEM.name,
      qty, unitPrice: Number(supplier.hargaPerPcs) || 0, status: 'draft',
      eta: `Est. ${supplier.leadTime}`, source: 'Draf AI Restock Advisor', priority: 1
    });
    setPoFilterTab('all');
    showToast(`Draf ${newId} (${qty} pcs) dibuat untuk ${escapeHTML(supplier.nama)} — Prioritas #1.`, 'success');
    document.getElementById('po-list-container')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function openAddSupplierModal() {
    const modal = document.getElementById('add-supplier-modal');
    const error = document.getElementById('new-sup-error');
    ['new-sup-name', 'new-sup-category', 'new-sup-city', 'new-sup-lead', 'new-sup-moq', 'new-sup-wa'].forEach(id => {
      const field = document.getElementById(id);
      if (field) field.value = '';
    });
    if (error) { error.textContent = ''; error.classList.add('hidden'); }
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    setTimeout(() => document.getElementById('new-sup-name')?.focus(), 40);
  }

  function closeAddSupplierModal() {
    const modal = document.getElementById('add-supplier-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  }

  function setSupplierFormError(message, focusEl) {
    const error = document.getElementById('new-sup-error');
    if (error) {
      error.textContent = message;
      error.classList.remove('hidden');
    }
    if (focusEl) focusEl.focus();
  }

  function saveNewSupplier(event) {
    if (event) event.preventDefault();
    const $ = id => document.getElementById(id);
    const nama = ($('new-sup-name')?.value || '').trim();
    const spesialisasi = ($('new-sup-category')?.value || '').trim();
    const kota = ($('new-sup-city')?.value || '').trim();
    const leadTime = ($('new-sup-lead')?.value || '').trim();
    const moqRaw = ($('new-sup-moq')?.value || '').trim();
    const wa = ($('new-sup-wa')?.value || '').trim();
    const moq = Number(moqRaw);
    const error = $('new-sup-error');
    if (error) { error.textContent = ''; error.classList.add('hidden'); }

    const requiredFields = [
      ['new-sup-name', nama, 'Nama supplier wajib diisi.'],
      ['new-sup-category', spesialisasi, 'Spesialisasi wajib diisi.'],
      ['new-sup-lead', leadTime, 'Lead time wajib diisi.'],
      ['new-sup-moq', moqRaw, 'MOQ wajib diisi.'],
      ['new-sup-wa', wa, 'Nomor WhatsApp wajib diisi.']
    ];
    const missing = requiredFields.find(([, value]) => !value);
    if (missing) return setSupplierFormError(missing[2], $(missing[0]));
    if (suppliers.some(s => String(s.nama).trim().toLocaleLowerCase('id-ID') === nama.toLocaleLowerCase('id-ID')))
      return setSupplierFormError('Nama supplier sudah terdaftar. Gunakan nama yang berbeda.', $('new-sup-name'));
    if (!Number.isInteger(moq) || moq < 1)
      return setSupplierFormError('MOQ harus berupa angka bulat minimal 1 pcs.', $('new-sup-moq'));
    if (!/^\+62[0-9\s-]{7,18}$/.test(wa) && !/^08[0-9\s-]{7,18}$/.test(wa))
      return setSupplierFormError('Nomor WhatsApp harus diawali +62 atau 08 (contoh: 0812-3456-7890).', $('new-sup-wa'));

    const usedNewIds = suppliers.map(s => Number((String(s.id).match(/^sup-new-(\d+)$/) || [])[1] || 0));
    newSupplierIdCounter = Math.max(newSupplierIdCounter, ...usedNewIds.map(n => n + 1), 1);
    const id = `sup-new-${String(newSupplierIdCounter++).padStart(3, '0')}`;
    const newSupplier = { id, nama, spesialisasi, kota, leadTime, moq, wa, skorAwal: null, hargaPerPcs: null, ratings: [] };
    suppliers.unshift(newSupplier);
    highlightedNewSupplierId = id;

    const searchInput = $('supplier-search-input');
    if (searchInput) searchInput.value = ''; // supaya supplier baru pasti terlihat di daftar
    renderAllSupplierViews();
    closeAddSupplierModal();
    showToast(`Supplier ${escapeHTML(nama)} ditambahkan.`, 'success');
    setTimeout(() => {
      if (highlightedNewSupplierId === id) {
        highlightedNewSupplierId = null;
        renderSupplierDatabaseList();
      }
    }, 3500);
    openSupplierDetailModal(id);
  }

  function openSupplierDetailModal(supplierId, preselectedPoId = '') {
    const supplier = getSupplierById(supplierId);
    if (!supplier) return;
    currentSelectedSupplierId = supplierId;
    preselectedSupplierPoId = preselectedPoId || '';
    editingSupplierRatingId = null;
    resetSupplierRatingDraft();
    const modal = document.getElementById('supplier-detail-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    const submit = document.getElementById('sdm-rating-submit');
    const cancel = document.getElementById('sdm-rating-cancel');
    if (submit) submit.textContent = 'Simpan Penilaian';
    if (cancel) cancel.classList.add('hidden');
    renderSupplierDetailModal();
  }

  function closeSupplierDetailModal() {
    const modal = document.getElementById('supplier-detail-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    currentSelectedSupplierId = null;
    editingSupplierRatingId = null;
    preselectedSupplierPoId = '';
    resetSupplierRatingDraft();
    const submit = document.getElementById('sdm-rating-submit');
    const cancel = document.getElementById('sdm-rating-cancel');
    if (submit) submit.textContent = 'Simpan Penilaian';
    if (cancel) cancel.classList.add('hidden');
  }

  function resetSupplierRatingDraft() {
    ratingDraft = { ketepatanWaktu: 0, kualitasBarang: 0, harga: 0, komunikasi: 0 };
    ratingHover = null;
    const notes = document.getElementById('sdm-rating-notes');
    const poSelect = document.getElementById('sdm-po-select');
    const error = document.getElementById('sdm-rating-error');
    if (notes) notes.value = '';
    if (poSelect) poSelect.value = '';
    if (error) { error.textContent = ''; error.classList.add('hidden'); }
  }

  function renderSupplierDetailModal() {
    const supplier = getSupplierById(currentSelectedSupplierId);
    if (!supplier) return;
    const score = getSupplierScore(supplier);
    const badge = document.getElementById('sdm-score-badge');
    document.getElementById('sdm-name').textContent = supplier.nama;
    document.getElementById('sdm-meta').textContent = `${supplier.spesialisasi} • ${supplier.kota || 'Kota belum diisi'} • Lead Time: ${supplier.leadTime} • MOQ: ${supplier.moq} pcs • ${supplier.wa}`;
    document.getElementById('sdm-score-value').textContent = score === null ? 'Belum dinilai' : `${Math.round(score)}%`;
    document.getElementById('sdm-lead').textContent = supplier.leadTime;
    document.getElementById('sdm-moq').textContent = `${supplier.moq} pcs`;
    document.getElementById('sdm-rating-count').textContent = `${supplier.ratings.length} evaluasi`;
    if (badge) { badge.textContent = getScoreBadgeText(supplier); badge.className = `px-2 py-0.5 rounded-md border text-[10.5px] font-bold ${getScoreBadgeClass(score)}`; }

    const averages = ratingCriteria.map(criterion => {
      const avg = supplier.ratings.length ? supplier.ratings.reduce((sum, rating) => sum + Number(rating[criterion.key] || 0), 0) / supplier.ratings.length : 0;
      return `<div class="grid grid-cols-[130px_1fr_48px] items-center gap-2 text-[11px]"><span class="text-navy-muted">${criterion.label}</span><div class="h-1.5 rounded-full bg-cream-canvas overflow-hidden"><div class="h-full rounded-full bg-sage-dark" style="width:${avg / 5 * 100}%"></div></div><strong class="text-navy text-right">${supplier.ratings.length ? avg.toFixed(1).replace('.', ',') + '/5' : '—'}</strong></div>`;
    }).join('');
    document.getElementById('sdm-criteria-summary').innerHTML = supplier.ratings.length ? averages : '<p class="text-[11.5px] text-navy-muted italic">Belum ada penilaian.</p>';

    const relatedPOs = supplierPoList.filter(po => po.supplierId === supplier.id || po.supplier === supplier.nama);
    const poListEl = document.getElementById('sdm-po-list');
    poListEl.innerHTML = relatedPOs.length ? relatedPOs.map(po => `<div class="p-2.5 rounded-lg bg-cream-canvas/70 border border-warm-border flex items-center justify-between gap-2"><div class="min-w-0"><div class="font-mono-code text-[10.5px] font-bold text-navy">${escapeHTML(po.id)}</div><div class="text-[11px] text-navy-muted truncate">${escapeHTML(po.item)}</div></div><span class="text-[10px] font-bold ${po.status === 'done' ? 'text-emerald-700' : po.status === 'draft' ? 'text-amber-700' : 'text-sky-700'}">${po.status === 'done' ? 'Diterima' : po.status === 'draft' ? 'Menunggu Approval' : po.status === 'shipping' ? 'Dalam Pengiriman' : 'Dikirim'}</span></div>`).join('') : '<p class="text-[11.5px] text-navy-muted italic">Belum ada transaksi Purchase Order.</p>';

    const poSelect = document.getElementById('sdm-po-select');
    if (poSelect) {
      poSelect.innerHTML = '<option value="">Tanpa PO terkait</option>' + relatedPOs.map(po => `<option value="${escapeHTML(po.id)}">${escapeHTML(po.id)} • ${escapeHTML(po.item)}</option>`).join('');
      if (preselectedSupplierPoId && relatedPOs.some(po => po.id === preselectedSupplierPoId)) poSelect.value = preselectedSupplierPoId;
      else if (editingSupplierRatingId) {
        const editing = supplier.ratings.find(item => item.id === editingSupplierRatingId);
        if (editing) poSelect.value = editing.poId || '';
      }
    }

    renderSupplierRatingStars();
    renderSupplierRatingHistory();
    const countEl = document.getElementById('sdm-history-count');
    if (countEl) countEl.textContent = `${supplier.ratings.length} evaluasi`;
  }

  function renderSupplierRatingStars() {
    const container = document.getElementById('sdm-rating-stars');
    if (!container) return;
    // Render the star controls once. Hover/click updates classes in place so
    // mouseenter never replaces the clicked button before its click event.
    container.innerHTML = ratingCriteria.map(criterion => {
      const selected = ratingDraft[criterion.key] || 0;
      return `<div class="p-2.5 rounded-lg bg-white border border-warm-border"><div class="text-[11px] font-bold text-navy mb-1.5">${criterion.label}</div><div class="flex items-center gap-1">${[1,2,3,4,5].map(value => `<button type="button" data-rating-key="${criterion.key}" data-rating-value="${value}" aria-label="${criterion.label} ${value} dari 5" aria-pressed="${value === selected ? 'true' : 'false'}" onmouseenter="hoverSupplierRating('${criterion.key}',${value})" onmouseleave="clearSupplierRatingHover()" onclick="setSupplierRating('${criterion.key}',${value})" class="text-[20px] leading-none transition-colors ${value <= selected ? 'text-amber-400' : 'text-slate-300'}">★</button>`).join('')}<span data-rating-value-label="${criterion.key}" class="ml-1 text-[10.5px] text-navy-muted">${selected ? `${selected}/5` : 'Pilih 1–5'}</span></div></div>`;
    }).join('');
    updateSupplierRatingStarStyles();
  }

  function updateSupplierRatingStarStyles() {
    const container = document.getElementById('sdm-rating-stars');
    if (!container) return;
    container.querySelectorAll('button[data-rating-key]').forEach(button => {
      const key = button.dataset.ratingKey;
      const value = Number(button.dataset.ratingValue);
      const selected = Number(ratingDraft[key]) || 0;
      const hovered = ratingHover && ratingHover.key === key ? Number(ratingHover.value) : 0;
      const active = hovered || selected;
      button.classList.toggle('text-amber-400', value <= active);
      button.classList.toggle('text-slate-300', value > active);
      button.setAttribute('aria-pressed', value === selected ? 'true' : 'false');
    });
    ratingCriteria.forEach(criterion => {
      const label = container.querySelector(`[data-rating-value-label="${criterion.key}"]`);
      const selected = Number(ratingDraft[criterion.key]) || 0;
      if (label) label.textContent = selected ? `${selected}/5` : 'Pilih 1–5';
    });
  }

  function setSupplierRating(key, value) {
    if (!ratingCriteria.some(item => item.key === key)) return;
    ratingDraft[key] = Math.min(5, Math.max(1, Number(value) || 0));
    ratingHover = null;
    updateSupplierRatingStarStyles();
    const error = document.getElementById('sdm-rating-error');
    if (error) { error.textContent = ''; error.classList.add('hidden'); }
  }

  function hoverSupplierRating(key, value) {
    ratingHover = { key, value };
    updateSupplierRatingStarStyles();
  }

  function clearSupplierRatingHover() {
    ratingHover = null;
    updateSupplierRatingStarStyles();
  }

  function renderSupplierRatingHistory() {
    const supplier = getSupplierById(currentSelectedSupplierId);
    const container = document.getElementById('sdm-history-list');
    if (!supplier || !container) return;
    const history = [...supplier.ratings].sort((a, b) => Number(b.tanggal) - Number(a.tanggal));
    if (!history.length) {
      container.innerHTML = '<p class="text-[11.5px] text-navy-muted italic">Belum ada riwayat penilaian supplier.</p>';
      return;
    }
    container.innerHTML = history.map(rating => {
      const po = rating.poId ? supplierPoList.find(item => item.id === rating.poId) : null;
      const ratingDetails = ratingCriteria.map(criterion => `<span class="text-[10.5px] text-navy-muted">${criterion.label}: <strong class="text-navy">${Number(rating[criterion.key])}/5</strong></span>`).join('<span class="text-warm-border">•</span>');
      return `<article class="p-3 rounded-xl bg-cream-canvas/60 border border-warm-border"><div class="flex items-start justify-between gap-2"><div class="min-w-0"><div class="text-[11px] font-bold text-navy">${formatSupplierDate(rating.tanggal)} ${rating.diubah ? '<span class="font-normal text-navy-muted">(diubah)</span>' : ''}</div><div class="text-[10.5px] text-navy-muted mt-0.5">Pemberi nilai: ${escapeHTML(rating.pemberiNilai)}</div></div><div class="flex items-center gap-1 shrink-0"><button type="button" onclick="editSupplierRating('${rating.id}')" class="px-2 py-1 rounded-lg bg-white border border-warm-border text-navy text-[10.5px] font-semibold">Ubah</button><button type="button" onclick="deleteSupplierRating('${rating.id}')" class="px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 text-[10.5px] font-semibold">Hapus</button></div></div><div class="flex flex-wrap gap-x-2 gap-y-1 mt-2">${ratingDetails}</div>${rating.catatan ? `<p class="text-[11px] text-navy-muted mt-2">${escapeHTML(rating.catatan)}</p>` : ''}${po ? `<div class="text-[10.5px] text-navy-muted mt-1">PO: <strong class="text-navy">${escapeHTML(po.id)}</strong></div>` : ''}</article>`;
    }).join('');
  }

  function formatSupplierDate(timestamp) {
    const date = new Date(Number(timestamp));
    return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  function saveSupplierRating() {
    const supplier = getSupplierById(currentSelectedSupplierId);
    if (!supplier) return;
    const error = document.getElementById('sdm-rating-error');
    if (ratingCriteria.some(criterion => !Number.isInteger(ratingDraft[criterion.key]) || ratingDraft[criterion.key] < 1 || ratingDraft[criterion.key] > 5)) {
      if (error) { error.textContent = 'Lengkapi semua kriteria'; error.classList.remove('hidden'); }
      return;
    }
    const oldScore = getSupplierScore(supplier);
    const notes = document.getElementById('sdm-rating-notes')?.value.trim() || '';
    const poId = document.getElementById('sdm-po-select')?.value || '';
    if (editingSupplierRatingId) {
      const existing = supplier.ratings.find(item => item.id === editingSupplierRatingId);
      if (!existing) { editingSupplierRatingId = null; return; }
      ratingCriteria.forEach(criterion => existing[criterion.key] = ratingDraft[criterion.key]);
      existing.tanggal = Date.now();
      existing.pemberiNilai = (typeof currentUser !== 'undefined' && currentUser.name) ? currentUser.name : 'Sari Kusuma';
      existing.poId = poId || '';
      existing.catatan = notes;
      existing.diubah = true;
    } else {
      supplier.ratings.push({
        id: `rating-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        tanggal: Date.now(),
        pemberiNilai: (typeof currentUser !== 'undefined' && currentUser.name) ? currentUser.name : 'Sari Kusuma',
        poId: poId || '',
        ketepatanWaktu: ratingDraft.ketepatanWaktu,
        kualitasBarang: ratingDraft.kualitasBarang,
        harga: ratingDraft.harga,
        komunikasi: ratingDraft.komunikasi,
        catatan: notes,
        diubah: false
      });
    }
    const isEdit = Boolean(editingSupplierRatingId);
    editingSupplierRatingId = null;
    resetSupplierRatingDraft();
    const submitButton = document.getElementById('sdm-rating-submit');
    const cancelButton = document.getElementById('sdm-rating-cancel');
    if (submitButton) submitButton.textContent = 'Simpan Penilaian';
    if (cancelButton) cancelButton.classList.add('hidden');
    renderAllSupplierViews();
    renderSupplierDetailModal();
    const newScore = getSupplierScore(supplier);
    const oldLabel = oldScore === null ? 'Belum dinilai' : `${Math.round(oldScore)}%`;
    const newLabel = newScore === null ? 'Belum dinilai' : `${Math.round(newScore)}%`;
    showToast(`${isEdit ? 'Penilaian diperbarui' : 'Penilaian disimpan'}. Skor ${escapeHTML(supplier.nama)}: ${oldLabel} → ${newLabel}.`, 'success');
  }

  function editSupplierRating(ratingId) {
    const supplier = getSupplierById(currentSelectedSupplierId);
    const rating = supplier?.ratings.find(item => item.id === ratingId);
    if (!supplier || !rating) return;
    editingSupplierRatingId = ratingId;
    ratingCriteria.forEach(criterion => ratingDraft[criterion.key] = Number(rating[criterion.key]) || 0);
    ratingHover = null;
    const notes = document.getElementById('sdm-rating-notes');
    if (notes) notes.value = rating.catatan || '';
    const poSelect = document.getElementById('sdm-po-select');
    if (poSelect) poSelect.value = rating.poId || '';
    document.getElementById('sdm-rating-submit').textContent = 'Perbarui Penilaian';
    document.getElementById('sdm-rating-cancel').classList.remove('hidden');
    const error = document.getElementById('sdm-rating-error');
    if (error) { error.textContent = ''; error.classList.add('hidden'); }
    renderSupplierRatingStars();
  }

  function cancelSupplierRatingEdit() {
    editingSupplierRatingId = null;
    resetSupplierRatingDraft();
    const submit = document.getElementById('sdm-rating-submit');
    const cancel = document.getElementById('sdm-rating-cancel');
    if (submit) submit.textContent = 'Simpan Penilaian';
    if (cancel) cancel.classList.add('hidden');
    renderSupplierRatingStars();
  }

  function deleteSupplierRating(ratingId) {
    const supplier = getSupplierById(currentSelectedSupplierId);
    if (!supplier) return;
    const rating = supplier.ratings.find(item => item.id === ratingId);
    if (!rating) return;
    if (!confirm('Hapus penilaian ini? Skor supplier akan dihitung ulang.')) return;
    const oldScore = getSupplierScore(supplier);
    supplier.ratings = supplier.ratings.filter(item => item.id !== ratingId);
    if (editingSupplierRatingId === ratingId) cancelSupplierRatingEdit();
    const newScore = getSupplierScore(supplier);
    renderAllSupplierViews();
    renderSupplierDetailModal();
    showToast(`Penilaian dihapus. Skor ${escapeHTML(supplier.nama)}: ${oldScore === null ? 'Belum dinilai' : Math.round(oldScore) + '%'} → ${newScore === null ? 'Belum dinilai' : Math.round(newScore) + '%'}.`, 'success');
  }

  function contactSupplier(supplierId) {
    const supplier = getSupplierById(supplierId);
    if (!supplier) return;
    showToast(`Membuka WhatsApp ${escapeHTML(supplier.nama)}...`, 'info');
    const digits = supplier.wa.replace(/\D/g, '');
    const international = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
    if (international) window.open(`https://wa.me/${international}`, '_blank', 'noopener');
  }

  function contactSupplierFromModal() {
    if (currentSelectedSupplierId) contactSupplier(currentSelectedSupplierId);
  }

  function renderAllSupplierViews() {
    persistSuppliers();
    renderRestockRecommendation();
    renderSupplierDatabaseList();
    renderSupplierDropdown();
    renderAIMatchmaker();
    renderSupplierPoList();
  }

  // Purchase Order: the same supplierPoList is read by the PO panel and supplier detail modal.
  let activePoTab = 'all';
  function setPoFilterTab(tab) {
    activePoTab = tab;
    ['all', 'approval', 'progress', 'done'].forEach(key => {
      const button = document.getElementById(`potab-${key}`);
      if (!button) return;
      button.className = key === tab
        ? 'px-3 py-1.5 rounded-lg bg-navy text-white font-bold transition-colors'
        : 'px-3 py-1.5 rounded-lg text-navy-muted hover:text-navy transition-colors';
    });
    renderSupplierPoList();
  }

  function renderSupplierPoList() {
    supplierPoList.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99)); // yang berprioritas tampil di atas
    const container = document.getElementById('po-list-container');
    const counter = document.getElementById('po-active-counter');
    if (!container) return;
    if (counter) counter.textContent = `${supplierPoList.length} PO Tercatat`;
    const needApproval = supplierPoList.filter(po => po.status === 'draft');
    const inProgress = supplierPoList.filter(po => po.status === 'sent' || po.status === 'shipping');
    const done = supplierPoList.filter(po => po.status === 'done');
    const records = activePoTab === 'approval' ? needApproval : activePoTab === 'progress' ? inProgress : activePoTab === 'done' ? done : supplierPoList;
    container.innerHTML = records.length ? records.map(renderPoCardItem).join('') : '<div class="p-4 rounded-xl bg-cream-canvas border border-warm-border text-[12px] text-navy-muted text-center italic">Tidak ada Purchase Order pada kategori ini.</div>';
  }

  function renderPoCardItem(po) {
    const total = Number(po.qty) * Number(po.unitPrice);
    let badge = '';
    let action = '';
    if (po.status === 'draft') {
      badge = '<span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">Draf Menunggu Review</span>';
      action = `<button type="button" onclick="approveSupplierPo('${po.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-jakarta font-bold text-[11.5px]">Setujui &amp; Kirim PO</button>`;
    } else if (po.status === 'shipping') {
      badge = '<span class="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">Dalam Pengiriman</span>';
      action = `<button type="button" onclick="markPoAsDone('${po.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-jakarta font-bold text-[11.5px]">Selesai (Tiba)</button>`;
    } else if (po.status === 'sent') {
      badge = '<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Dikirim ke Supplier</span>';
      action = `<span class="text-[11.5px] font-semibold text-emerald-700">${escapeHTML(po.eta)}</span>`;
    } else {
      badge = '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">Selesai &amp; Masuk Stok</span>';
      action = `<button type="button" onclick="openSupplierDetailModal('${po.supplierId}', '${po.id}')" class="px-2.5 py-1.5 rounded-xl bg-sage-soft text-sage-dark border border-sage/30 font-jakarta font-bold text-[11px]">Beri Penilaian</button>`;
    }
    const priorityBadge = po.priority ? `<span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Prioritas #${Number(po.priority)}</span>` : '';
    return `<div class="p-3.5 rounded-xl bg-cream-canvas/70 border border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div class="min-w-0 flex-1"><div class="flex items-center gap-2 flex-wrap"><span class="font-mono-code font-bold text-[12px] text-navy">${escapeHTML(po.id)}</span>${priorityBadge}${badge}<span class="text-[11px] text-navy-muted">• ${escapeHTML(po.source || '')}</span></div><div class="font-jakarta font-bold text-[13.5px] text-navy mt-1">${escapeHTML(po.item)}</div><div class="text-[11.5px] text-navy-muted mt-0.5">Vendor: <strong class="text-navy">${escapeHTML(po.supplier)}</strong> • Qty: <strong class="text-navy tabular-nums">${Number(po.qty)} pcs</strong> • Total: <strong class="text-navy tabular-nums">${formatRupiah(total)}</strong></div></div><div class="shrink-0 flex items-center gap-2">${action}</div></div>`;
  }

  function approveSupplierPo(poId) {
    const po = supplierPoList.find(item => item.id === poId);
    if (!po) return;
    po.status = 'sent';
    po.source = 'Disetujui Owner (WhatsApp & Email)';
    renderSupplierPoList();
    renderSupplierDetailModalIfOpen();
    showToast(`${escapeHTML(po.id)} berhasil disetujui & dikirim ke ${escapeHTML(po.supplier)}.`, 'success');
  }

  function markPoAsDone(poId) {
    const po = supplierPoList.find(item => item.id === poId);
    if (!po) return;
    po.status = 'done';
    po.eta = 'Diterima Gudang';
    renderSupplierPoList();
    renderSupplierDetailModalIfOpen();
    showToast(`${escapeHTML(po.id)} telah ditandai selesai dan barang masuk ke inventory.`, 'success');
  }

  function renderSupplierDetailModalIfOpen() {
    const modal = document.getElementById('supplier-detail-modal');
    if (modal && !modal.classList.contains('hidden') && currentSelectedSupplierId) renderSupplierDetailModal();
  }

  function createPoFromRecommendation(supplierNameOrId, item, qty, unitPrice) {
    const supplier = getSupplierById(supplierNameOrId) || findSupplierByName(supplierNameOrId);
    if (!supplier) { showToast('Supplier tidak ditemukan pada database.', 'error'); return; }
    const quantity = Math.max(1, Math.floor(Number(qty) || supplier.moq));
    const price = Math.max(0, Number(unitPrice) || Number(supplier.hargaPerPcs) || 0);
    const nextNumber = 90 + supplierPoList.length;
    const newId = `PO-2026-${String(nextNumber).padStart(3, '0')}`;
    supplierPoList.unshift({ id: newId, supplierId: supplier.id, supplier: supplier.nama, item: String(item || 'Produk belum ditentukan'), qty: quantity, unitPrice: price, status: 'draft', eta: `Est. ${supplier.leadTime}`, source: 'Draf AI Restock Advisor' });
    renderSupplierPoList();
    showToast(`Draf ${newId} (${quantity} pcs) dibuat untuk ${escapeHTML(supplier.nama)}.`, 'success');
  }

  function openNewPoModal(preselectedSupplierId = '') {
    renderSupplierDropdown(preselectedSupplierId);
    const modal = document.getElementById('new-po-modal');
    const error = document.getElementById('new-po-error');
    if (error) { error.textContent = ''; error.classList.add('hidden'); }
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    updateNewPoPriceFromSupplier();
  }

  function closeNewPoModal() {
    const modal = document.getElementById('new-po-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  }

  function updateNewPoPriceFromSupplier() {
    const supplier = getSupplierById(document.getElementById('po-supplier-select')?.value);
    const priceInput = document.getElementById('po-price-input');
    const qtyInput = document.getElementById('po-qty-input');
    if (supplier && priceInput) priceInput.value = supplier.hargaPerPcs ? supplier.hargaPerPcs : '';
    if (supplier && qtyInput && (!qtyInput.value || Number(qtyInput.value) < supplier.moq)) qtyInput.value = supplier.moq;
  }

  function submitNewPoModal() {
    const supplier = getSupplierById(document.getElementById('po-supplier-select')?.value);
    const item = document.getElementById('po-sku-select')?.value || '';
    const qty = Number(document.getElementById('po-qty-input')?.value);
    const price = Number(document.getElementById('po-price-input')?.value);
    const error = document.getElementById('new-po-error');
    if (!supplier || !item || !Number.isInteger(qty) || qty < 1 || !Number.isInteger(price) || price < 1) {
      if (error) { error.textContent = 'Pilih supplier, produk, jumlah bulat, dan harga per pcs yang valid.'; error.classList.remove('hidden'); }
      return;
    }
    createPoFromRecommendation(supplier.id, item, qty, price);
    closeNewPoModal();
  }

  function initSupplierManagement() {
    renderAllSupplierViews();
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeAddSupplierModal();
        closeSupplierDetailModal();
        closeNewPoModal();
      }
    });
  }

  // Keep the named functions callable from the inline handlers already present in the HTML.
  window.openAddSupplierModal = openAddSupplierModal;
  window.closeAddSupplierModal = closeAddSupplierModal;
  window.saveNewSupplier = saveNewSupplier;
  window.openSupplierDetailModal = openSupplierDetailModal;
  window.closeSupplierDetailModal = closeSupplierDetailModal;
  window.setSupplierRating = setSupplierRating;
  window.hoverSupplierRating = hoverSupplierRating;
  window.clearSupplierRatingHover = clearSupplierRatingHover;
  window.saveSupplierRating = saveSupplierRating;
  window.editSupplierRating = editSupplierRating;
  window.cancelSupplierRatingEdit = cancelSupplierRatingEdit;
  window.deleteSupplierRating = deleteSupplierRating;
  window.contactSupplier = contactSupplier;
  window.contactSupplierFromModal = contactSupplierFromModal;
  window.setPoFilterTab = setPoFilterTab;
  window.renderSupplierPoList = renderSupplierPoList;
  window.approveSupplierPo = approveSupplierPo;
  window.markPoAsDone = markPoAsDone;
  window.createPoFromRecommendation = createPoFromRecommendation;
  window.selectSupplierForRecommendation = selectSupplierForRecommendation;
  window.createRestockDraftPo = createRestockDraftPo;
  window.openNewPoModal = openNewPoModal;
  window.closeNewPoModal = closeNewPoModal;
  window.submitNewPoModal = submitNewPoModal;
  window.updateNewPoPriceFromSupplier = updateNewPoPriceFromSupplier;
  window.renderSupplierDatabaseList = renderSupplierDatabaseList;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSupplierManagement);
  else initSupplierManagement();
})();
