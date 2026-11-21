/* ======================================================================
   Penggunaan AI: top-up cepat QRIS
   ====================================================================== */
/* Top-up cepat QRIS (tombol di halaman Penggunaan AI) */
function topupQuick50k() {
  state.quotaBalance = (Number(state.quotaBalance) || 0) + 50000;
  const txt = 'Rp ' + state.quotaBalance.toLocaleString('id-ID');
  ['header-quota-balance', 'wallet-balance-card'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = txt; });
  showToast('Top-up Rp 50.000 via QRIS berhasil.', 'success');
}
window.topupQuick50k = topupQuick50k;

/* ======================================================================
   Penggunaan AI: filter dan export log
   ====================================================================== */
function filterAiUsageLog() {
  const filter = document.getElementById('ai-log-filter');
  const rows = document.querySelectorAll('#ai-usage-log-rows tr[data-log-type]');
  if (!filter) return;
  rows.forEach(row => {
    row.style.display = (filter.value === 'all' || row.dataset.logType === filter.value) ? '' : 'none';
  });
}
function exportAiUsageLog() {
  const rows = [
    ['Aktivitas','Detail penggunaan','Resource','Biaya','Status'],
    ['AI Draft Balasan','Pembuatan ulang respons Copilot','240 token','Rp 400','Tercatat'],
    ['Workflow AI','Run workflow otomatis','Durasi 1.120 ms','Rp 200','200 OK']
  ];
  const csv = rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'natahub-ai-usage-log.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
