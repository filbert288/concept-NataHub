/* ======================================================================
   Opname: tombol +/-, modal sinkron toko, navigasi/UI umum, simulasi workflow
   ====================================================================== */
/* ===== PATCH: fungsi yang hilang di file ===== */

/* --- Opname inti: tombol +/- dan Sesuaikan --- */
const __fisikTimers = {}, __fisikBase = {};
function changePhysicalCount(rowId, delta) {
  const row = state.opnameRows.find(r => r.id === rowId); if (!row) return;
  if (__fisikBase[rowId] === undefined) __fisikBase[rowId] = row.fisik;
  row.fisik = Math.max(0, row.fisik + delta);
  renderAllOpnameViews();
  if (state.opnameSession && state.opnameSession.aktif) { delete __fisikBase[rowId]; return; } // sesi: tidak mencatat per perubahan
  clearTimeout(__fisikTimers[rowId]);
  __fisikTimers[rowId] = setTimeout(() => {
    const awal = __fisikBase[rowId]; delete __fisikBase[rowId];
    if (awal !== undefined && awal !== row.fisik)
      pushActivityFeed('opname', `${currentUser.name} mengubah fisik ${row.code} dari ${awal} ke ${row.fisik} pcs.`, row.code);
  }, 1500);
}
function adjustOpnameRow(rowId) { applyAdjustment(rowId, { dariSesi: false }); }
function filterOpnameTable() { renderOpnameTable(); }

/* --- Modal Sinkronisasi Toko (dibaca dari state yang sama) --- */
function storeStatusInfo(row, st) {
  if (st.status === 'syncing') return { label: 'Mengirim...', cls: 'bg-blue-50 text-blue-700', done: false };
  if (st.status === 'fail')    return { label: 'Gagal Sinkron', cls: 'bg-rose-50 text-rose-700', done: false };
  if (st.status === 'queued')  return { label: 'Menunggu Antrean', cls: 'bg-amber-50 text-amber-800', done: false };
  if (st.stock !== row.db)     return { label: 'Perlu Sinkron', cls: 'bg-orange-50 text-orange-700', done: false };
  return { label: 'Sinkron (200 OK)', cls: 'bg-emerald-50 text-emerald-700', done: true };
}
function openStoreSyncModal(rowId) {
  state.activeSyncModalRowId = rowId;
  renderStoreSyncModalList();
  const m = document.getElementById('store-sync-modal'); m.classList.remove('hidden'); m.classList.add('flex');
}
function closeStoreSyncModal() {
  const m = document.getElementById('store-sync-modal'); if (!m) return;
  m.classList.add('hidden'); m.classList.remove('flex'); state.activeSyncModalRowId = null;
}
function renderStoreSyncModalList() {
  const row = state.opnameRows.find(r => r.id === state.activeSyncModalRowId); if (!row) return;
  const diff = row.fisik - row.db, hasDiff = diff !== 0, diffTxt = (diff > 0 ? '+' : '') + diff;
  document.getElementById('store-sync-modal-title').textContent = 'Sinkronisasi Toko — ' + row.name;
  document.getElementById('store-sync-modal-subtitle').textContent = `SKU: ${row.sku.replace('•', '•')} • Batch FIFO: ${row.batch}`;
  document.getElementById('store-sync-banner-container').innerHTML = hasDiff
    ? `<div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12px] font-medium">Stok fisik beda dengan database (${diffTxt} pcs). Sesuaikan dulu sebelum sinkron.</div>` : '';
  const entries = Object.entries(row.storesData);
  document.getElementById('store-sync-modal-body').innerHTML = entries.map(([name, st]) => {
    const info = storeStatusInfo(row, st);
    const last = st.status === 'syncing' ? 'Mengirim...' : (st.status === 'queued' ? 'Menunggu' : `${formatWibTime(st.timestamp)} • ${formatRelativeTime(st.timestamp)}`);
    let action;
    if (info.done) action = `<span class="text-[12px] font-bold text-emerald-700">Tersinkronisasi</span>`;
    else if (st.status === 'syncing') action = `<span class="text-[12px] font-bold text-blue-700 animate-pulse">Mengirim...</span>`;
    else if (hasDiff) action = `<button onclick="adjustAndSyncRow('${row.id}')" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11.5px] font-bold whitespace-nowrap">Sesuaikan &amp; Sinkronkan</button>`;
    else action = `<button onclick="resyncStore('${row.id}','${name}')" class="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy/90 text-white text-[11.5px] font-bold whitespace-nowrap">Sinkronkan Ulang</button>`;
    return `<div class="p-3 rounded-xl border border-warm-border bg-cream-canvas/60 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2 flex-wrap"><span class="font-jakarta font-bold text-[13px] text-navy">${name}</span>
          <span class="px-2 py-0.5 rounded-md text-[10.5px] font-bold ${info.cls}">${info.label}</span></div>
        <div class="text-[11.5px] text-navy-muted mt-1">Stok tercatat: <strong class="text-navy">${st.stock} pcs</strong> • Sync terakhir: ${last}</div>
        ${hasDiff ? `<div class="text-[11px] text-amber-800 font-semibold mt-0.5">Fisik nyata: ${row.fisik} pcs (${diffTxt})</div>` : ''}
      </div><div class="shrink-0">${action}</div></div>`;
  }).join('');
  const needSync = entries.some(([_, st]) => !storeStatusInfo(row, st).done && st.status !== 'syncing');
  document.getElementById('store-sync-footer-action-wrapper').innerHTML = !needSync ? '' : (hasDiff
    ? `<button onclick="adjustAndSyncRow('${row.id}')" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px]">Sesuaikan &amp; Sinkronkan Semua Toko</button>`
    : `<button onclick="resyncAllStores('${row.id}')" class="px-4 py-2 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold text-[12px]">Sinkronkan Ulang Semua Toko</button>`);
}
function adjustAndSyncRow(rowId) { applyAdjustment(rowId, { dariSesi: false }); renderStoreSyncModalList(); }
function resyncStore(rowId, storeName) {
  const row = state.opnameRows.find(r => r.id === rowId); if (!row) return;
  row.storesData[storeName].status = 'syncing';
  pushActivityFeed('sync', `${currentUser.name} menyinkronkan ulang ${row.code} ke ${storeName}.`, row.code);
  renderAllOpnameViews();
  setTimeout(() => {
    const st = row.storesData[storeName]; st.stock = row.db; st.status = 'sync'; st.timestamp = Date.now();
    pushActivityFeed('sync', `Sistem natahub: ${row.code} tersinkron ke ${storeName}.`, row.code);
    renderAllOpnameViews(); showToast(`${storeName}: stok ${row.db} pcs tersinkron.`, 'success');
  }, 1000);
}
function resyncAllStores(rowId) {
  const row = state.opnameRows.find(r => r.id === rowId); if (!row) return;
  Object.entries(row.storesData).forEach(([n, st]) => { if (!storeStatusInfo(row, st).done) resyncStore(rowId, n); });
}
/* modal ikut diperbarui otomatis setiap tampilan digambar ulang */
(function () {
  const _render = renderAllOpnameViews;
  window.renderAllOpnameViews = function () {
    _render();
    const m = document.getElementById('store-sync-modal');
    if (m && m.classList.contains('flex')) renderStoreSyncModalList();
  };
})();

/* --- Navigasi / UI umum --- */
function toggleMobileSidebar(open) {
  const s = document.getElementById('left-sidebar'), b = document.getElementById('mobile-backdrop'); if (!s) return;
  const show = typeof open === 'boolean' ? open : s.classList.contains('-translate-x-full');
  s.classList.toggle('-translate-x-full', !show); if (b) b.classList.toggle('hidden', !show);
}
function toggleStoreDropdown() { const d = document.getElementById('store-dropdown'); if (d) d.classList.toggle('hidden'); }
function selectStore(name) {
  document.getElementById('active-store-name').textContent = name;
  const c1 = document.getElementById('check-store-1'), c2 = document.getElementById('check-store-2');
  const first = name !== 'Gudang Tanah Abang'; // toko pertama = toko milik akun yang login if (c1) c1.classList.toggle('hidden', !first); if (c2) c2.classList.toggle('hidden', first);
  document.getElementById('store-dropdown').classList.add('hidden');
  showToast('Toko aktif: ' + name, 'info');
}
function toggleRingkasanSubmenu() {
  const sm = document.getElementById('ringkasan-submenu'), ch = document.getElementById('ringkasan-chevron');
  const open = sm.classList.contains('hidden'); sm.classList.toggle('hidden', !open); sm.classList.toggle('flex', open);
  if (ch) ch.style.transform = open ? 'rotate(180deg)' : '';
}
function filterNextStepActions(q) {
  q = (q || '').trim().toLowerCase(); let shown = 0;
  document.querySelectorAll('#sidebar-action-list .next-step-btn').forEach(b => {
    const ok = !q || (b.dataset.searchTerms || '').includes(q) || b.textContent.toLowerCase().includes(q);
    b.classList.toggle('hidden', !ok); if (ok) shown++;
  });
  const nm = document.getElementById('sidebar-no-match'); if (nm) nm.classList.toggle('hidden', shown > 0);
}
function switchTerminalTab(tab) {
  const map = { 'input-output': ['io', 'term-tab-io'], 'error-log': ['err', 'term-tab-err'], 'ai-advisor': ['adv', 'term-tab-adv'] };
  Object.entries(map).forEach(([k, [pane, btn]]) => {
    const p = document.getElementById('term-pane-' + pane), b = document.getElementById(btn), on = k === tab;
    p.classList.toggle('hidden', !on); p.classList.toggle('flex', on && pane !== 'io');
    b.className = on ? 'px-3 py-1 rounded-md bg-slate-800 text-emerald-400 font-bold transition-colors' : 'px-3 py-1 rounded-md hover:bg-slate-800 text-slate-400 transition-colors';
  });
}
function runTerminalNodeTest() {
  const s = document.getElementById('terminal-status-text'); if (s) s.textContent = 'Menguji...';
  setTimeout(() => { if (s) s.textContent = 'Berhasil (200 OK)'; showToast('Uji jalankan node berhasil (200 OK).', 'success'); }, 700);
}
function runWorkflowSimulation() {
  const ids = ['wf-node-wa', 'wf-node-ai', 'wf-node-mem', 'wf-node-llm', 'wf-node-stock', 'wf-node-print', 'wf-node-draft'];
  const banner = document.getElementById('sim-status-banner'), btn = document.getElementById('btn-simulasi-alur');
  if (btn) btn.disabled = true;
  ids.forEach((id, i) => {
    setTimeout(() => {
      document.querySelectorAll('.sim-active-node').forEach(n => n.classList.remove('sim-active-node'));
      const el = document.getElementById(id); if (el) el.classList.add('sim-active-node');
      if (banner) banner.textContent = `Simulasi berjalan: node ${i + 1}/${ids.length}`;
      if (i === ids.length - 1) setTimeout(() => {
        el.classList.remove('sim-active-node'); if (banner) banner.textContent = 'Simulasi selesai.';
        if (btn) btn.disabled = false; showToast('Simulasi alur selesai tanpa error.', 'success');
      }, 700);
    }, i * 650);
  });
}
function openExportJsonModal() {
  const json = JSON.stringify(canvasNodeMetadata, null, 2);
  if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
  showToast('JSON workflow disalin ke clipboard.', 'success');
}

/* --- Node canvas: koneksi nyata, klik = troubleshoot, hubungan layanan --- */
const __wfNodeEls = { 'wf-node-mp': 'mp-trigger', 'wf-node-wa': 'wa-trigger', 'wf-node-ai': 'ai-nlp', 'wf-node-mem': 'postgres-mem',
                      'wf-node-llm': 'llm-engine', 'wf-node-stock': 'cek-stok', 'wf-node-print': 'cetak-resi', 'wf-node-draft': 'draf-maaf' };
Object.assign(canvasNodeMetadata['llm-engine'], { serves: [
  { target: 'AI Asisten', port: 'Port Model (Ungu)', desc: 'mengekstrak SKU, jumlah, dan kota dari chat' },
  { target: 'Draf Pesan Maaf', port: 'Port Model (Ungu Bawah)', desc: 'menyusun teks permintaan maaf' } ] });
Object.assign(canvasNodeMetadata['postgres-mem'], { serves: [
  { target: 'AI Asisten', port: 'Port Memory (Tosca)', desc: 'menyimpan dan membaca riwayat percakapan pelanggan' } ] });
Object.values(canvasNodeMetadata).forEach(m => {
  const parts = [];
  (m.inputs || []).forEach(i => parts.push(`${i.source} (input)`));
  (m.uses || []).forEach(u => parts.push(`${u.resource} (${u.port})`));
  (m.outputs || []).forEach(o => parts.push(`${o.target} (${o.port})`));
  (m.serves || []).forEach(s => parts.push(`${s.target} (${s.port})`));
  m.connectedText = parts.length ? parts.join(', ') : 'Belum tersambung ke node lain.';
});
(function () {
  const _open = openNodeTroubleshootModal;
  window.openNodeTroubleshootModal = function (key) {
    _open(key);
    const meta = canvasNodeMetadata[key]; if (!meta) return;
    const inList = document.getElementById('ts-modal-inputs-list'), outList = document.getElementById('ts-modal-outputs-list');
    const inBox = inList.parentElement, outBox = outList.parentElement, grid = inBox.parentElement;
    const label = inBox.querySelector('span');
    if (meta.tampilanPopup === 'layanan') {
      label.textContent = 'Menyediakan layanan ke';
      inList.innerHTML = (meta.serves || []).map(s => `
        <button type="button" onclick="openNodeTroubleshootModal('${Object.keys(canvasNodeMetadata).find(k => canvasNodeMetadata[k].title === s.target) || key}')" class="text-left text-[11.5px] py-1 border-b border-warm-border/50 last:border-0 flex flex-col hover:bg-cream-canvas rounded">
          <span class="font-bold text-navy">${s.target} <span class="text-navy-muted font-normal">(${s.port})</span></span>
          <span class="text-[10.5px] text-navy-muted">${s.desc}</span></button>`).join('') || '<span class="text-[11px] italic text-navy-muted">Belum dipakai node mana pun.</span>';
      outBox.classList.add('hidden'); grid.classList.remove('sm:grid-cols-2'); grid.classList.add('sm:grid-cols-1');
    } else {
      label.textContent = 'Menerima dari (Input)'; outBox.classList.remove('hidden');
      grid.classList.add('sm:grid-cols-2'); grid.classList.remove('sm:grid-cols-1');
    }
  };
})();
document.addEventListener('DOMContentLoaded', () => {
  Object.entries(__wfNodeEls).forEach(([elId, key]) => {
    const el = document.getElementById(elId); if (!el) return;
    el.addEventListener('click', ev => { ev.stopImmediatePropagation(); openNodeTroubleshootModal(key); }, true);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeNodeTroubleshootModal(); closeNodeCodeModal(); closeStoreSyncModal(); } });
});

/* ======================================================================
   Opname: filter tabel tidak boleh kosong
   ====================================================================== */
/* ===== PATCH: tabel tidak boleh kosong karena filter yang sudah tidak relevan ===== */
function normalizeOpnameFilters() {
  // 1) Filter toko otomatis dilepas kalau toko itu sudah tidak punya SKU bermasalah
  if (state.activeStoreFilter) {
    const name = state.activeStoreFilter;
    const masihAda = state.opnameRows.some(r => {
      const st = r.storesData[name];
      return r.fisik !== r.db || (st && (st.stock !== r.db || st.status !== 'sync'));
    });
    if (!masihAda) { state.activeStoreFilter = null; showToast(`Semua SKU di ${name} sudah beres, filter dilepas.`, 'success'); }
  }
}
function syncQuickTabStyles() {
  ['all', 'discrepancy', 'unsynced', 'lowstock', 'oldbatch'].forEach(t => {
    const b = document.getElementById('qtab-' + t); if (!b) return;
    b.className = t === state.activeQuickTab
      ? 'px-2.5 py-1 rounded-lg bg-navy text-white font-bold transition-colors whitespace-nowrap'
      : 'px-2.5 py-1 rounded-lg bg-cream-canvas text-navy-muted hover:text-navy font-semibold transition-colors whitespace-nowrap';
  });
}
function resetOpnameViewFilters() {
  state.activeStoreFilter = null; state.activeQuickTab = 'all';
  const s = document.getElementById('opname-search-input'); if (s) s.value = '';
  renderAllOpnameViews();
}
(function () {
  // Render ulang selalu menormalkan filter dulu
  const _all = renderAllOpnameViews;
  window.renderAllOpnameViews = function () { normalizeOpnameFilters(); _all(); };

  // Tabel: gaya tab selalu sesuai state + tampilan kosong yang informatif
  const _table = renderOpnameTable;
  window.renderOpnameTable = function () {
    _table(); syncQuickTabStyles();
    const tbody = document.getElementById('opname-table-body');
    if (tbody && !tbody.children.length) {
      const q = (document.getElementById('opname-search-input') || {}).value || '';
      const why = state.activeStoreFilter ? `Filter toko "${state.activeStoreFilter}" aktif`
        : q ? `Pencarian "${q}" tidak cocok` : state.activeQuickTab !== 'all' ? 'Tidak ada SKU di kategori ini' : 'Belum ada data';
      tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center">
        <div class="text-[13px] font-bold text-navy">Tidak ada SKU yang ditampilkan</div>
        <div class="text-[12px] text-navy-muted mt-1">${why}.</div>
        <button onclick="resetOpnameViewFilters()" class="mt-3 px-4 py-2 rounded-xl bg-navy text-white font-bold text-[12px]">Tampilkan Semua SKU</button></td></tr>`;
    }
  };

  // Chip "Semua" benar-benar menampilkan semua: lepas filter toko + kosongkan pencarian
  const _tab = setQuickTab;
  window.setQuickTab = function (tab) {
    if (tab === 'all') { resetOpnameViewFilters(); return; }
    _tab(tab);
  };
  // Filter toko dari banner/chip juga ikut menyegarkan semuanya
  window.clearOpnameFilter = function () { state.activeStoreFilter = null; renderAllOpnameViews(); showToast('Filter toko dilepas, menampilkan seluruh SKU.', 'info'); };
  // Reset data contoh mengembalikan semua filter
  const _reset = resetMockData;
  window.resetMockData = function () { state.activeQuickTab = 'all'; const s = document.getElementById('opname-search-input'); if (s) s.value = ''; _reset(); };
})();
document.addEventListener('DOMContentLoaded', () => { state.activeQuickTab = 'all'; syncQuickTabStyles(); });

/* ======================================================================
   Inventori: tambah produk + daftar SKU per marketplace
   ====================================================================== */
/* ===== Tambah Produk + SKU per Marketplace ===== */
function openAddProductModal() {
  const stores = state.connectedStoresList.map(s => s.name);
  document.getElementById('ap-stores').innerHTML = stores.map((n, i) =>
    `<label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-warm-border bg-cream-canvas/60 text-[12px] font-semibold text-navy cursor-pointer"><input type="checkbox" class="ap-store-check" value="${n}" checked /> ${n}</label>`).join('');
  const nextBatch = '#B-2026-' + String(state.opnameRows.length + 1).padStart(2, '0');
  const exp = new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10);
  ['ap-name', 'ap-code', 'ap-rak'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('ap-batch').value = nextBatch; document.getElementById('ap-exp').value = exp;
  document.getElementById('ap-stock').value = 0; document.getElementById('ap-error').classList.add('hidden');
  const m = document.getElementById('add-product-modal'); m.classList.remove('hidden'); m.classList.add('flex');
  setTimeout(() => document.getElementById('ap-name').focus(), 50);
}
function closeAddProductModal() { const m = document.getElementById('add-product-modal'); if (m) { m.classList.add('hidden'); m.classList.remove('flex'); } }
function submitAddProduct() {
  const v = id => document.getElementById(id).value.trim();
  const name = v('ap-name'), code = v('ap-code').toUpperCase(), rak = v('ap-rak') || '-', batch = v('ap-batch'), exp = v('ap-exp');
  const stock = Number(document.getElementById('ap-stock').value);
  const stores = [...document.querySelectorAll('.ap-store-check:checked')].map(c => c.value);
  const err = document.getElementById('ap-error');
  let msg = '';
  if (!name) msg = 'Nama produk wajib diisi.';
  else if (!code) msg = 'Kode SKU wajib diisi.';
  else if (!/^[A-Z0-9][A-Z0-9-]*$/.test(code)) msg = 'Kode SKU hanya boleh huruf, angka, dan tanda hubung.';
  else if (state.opnameRows.some(r => r.code === code)) msg = `Kode SKU ${code} sudah dipakai produk lain.`;
  else if (!Number.isInteger(stock) || stock < 0) msg = 'Stok awal harus bilangan bulat 0 atau lebih.';
  else if (!exp) msg = 'Tanggal kadaluarsa wajib diisi.';
  else if (!stores.length) msg = 'Pilih minimal satu marketplace.';
  if (msg) { err.textContent = msg; err.classList.remove('hidden'); return; }
  const id = 'sku-' + (Math.max(0, ...state.opnameRows.map(r => parseInt(r.id.replace('sku-', ''), 10) || 0)) + 1);
  const storesData = {}; stores.forEach(n => storesData[n] = { stock: 0, status: 'syncing', timestamp: Date.now() });
  state.opnameRows.push({ id, name, sku: `${code} • Rak ${rak}`, code, batch, expDate: exp, db: stock, fisik: stock, storesData });
  state.recentRowId = id;
  closeAddProductModal();
  pushActivityFeed('opname', `${currentUser.name} menambahkan produk ${name} (${code}) dengan stok awal ${stock} pcs.`, code);
  pushActivityFeed('sync', `Sistem natahub mengirim produk ${code} ke ${stores.length} marketplace.`, code);
  resetOpnameViewFilters();
  const row = state.opnameRows.find(r => r.id === id);
  setTimeout(() => {
    stores.forEach(n => { row.storesData[n] = { stock: row.db, status: 'sync', timestamp: Date.now() }; });
    pushActivityFeed('sync', `Sistem natahub: ${code} tersinkron ke ${stores.join(', ')}.`, code);
    renderAllOpnameViews();
  }, 1200);
  setTimeout(() => { if (state.recentRowId === id) { state.recentRowId = null; renderOpnameTable(); } }, 5000);
  showToast(`Produk "${name}" ditambahkan ke tabel SKU.`, 'success');
  const el = document.getElementById('row-' + id); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

let mpModalStore = null;
function openMarketplaceSkuModal(storeName) {
  mpModalStore = storeName; document.getElementById('mp-modal-search').value = '';
  renderMarketplaceSkuModal();
  const m = document.getElementById('marketplace-sku-modal'); m.classList.remove('hidden'); m.classList.add('flex');
}
function closeMarketplaceSkuModal() { const m = document.getElementById('marketplace-sku-modal'); if (m) { m.classList.add('hidden'); m.classList.remove('flex'); } mpModalStore = null; }
function renderMarketplaceSkuModal() {
  if (!mpModalStore) return;
  const q = document.getElementById('mp-modal-search').value.trim().toLowerCase();
  const all = state.opnameRows.filter(r => r.storesData[mpModalStore]);
  const rows = all.filter(r => !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
  document.getElementById('mp-modal-title').textContent = 'Produk di ' + mpModalStore;
  document.getElementById('mp-modal-subtitle').textContent = `${all.length} SKU dijual di toko ini` + (q ? ` • ${rows.length} cocok dengan pencarian` : '');
  const badge = (r, st) => {
    if (st.status === 'syncing') return '<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10.5px] font-bold">Mengirim...</span>';
    if (st.status === 'fail') return '<span class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10.5px] font-bold">Gagal sinkron</span>';
    if (st.status === 'queued') return '<span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10.5px] font-bold">Menunggu antrean</span>';
    if (st.stock !== r.db) return '<span class="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10.5px] font-bold">Perlu sinkron</span>';
    return '<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10.5px] font-bold">Sinkron</span>';
  };
  document.getElementById('mp-modal-body').innerHTML = rows.length ? rows.map(r => {
    const st = r.storesData[mpModalStore];
    return `<tr><td class="py-2.5 pr-2"><div class="font-bold text-navy leading-snug">${r.name}</div><div class="text-[10.5px] text-navy-muted">${r.sku}</div></td>
      <td class="py-2.5 px-2 text-center tabular-nums font-bold">${st.stock}</td><td class="py-2.5 pl-2 text-right">${badge(r, st)}</td></tr>`;
  }).join('') : '<tr><td colspan="3" class="py-8 text-center text-[12px] text-navy-muted">Tidak ada produk yang cocok.</td></tr>';
  const problem = state.opnameRows.filter(r => { const st = r.storesData[mpModalStore]; return st && (r.fisik !== r.db || st.stock !== r.db || st.status !== 'sync'); }).length;
  const btn = document.getElementById('mp-modal-filter-btn');
  btn.textContent = problem ? `Tampilkan ${problem} SKU bermasalah di tabel` : 'Semua SKU di toko ini sudah beres';
  btn.disabled = !problem; btn.classList.toggle('opacity-50', !problem);
  btn.onclick = () => { const s = mpModalStore; closeMarketplaceSkuModal(); filterByStoreCard(s); };
}
(function () { const _r = renderAllOpnameViews; window.renderAllOpnameViews = function () { _r(); const m = document.getElementById('marketplace-sku-modal'); if (m && m.classList.contains('flex')) renderMarketplaceSkuModal(); }; })();
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAddProductModal(); closeMarketplaceSkuModal(); } });
