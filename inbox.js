/* ======================================================================
   Unified Inbox: filter kanal, draf AI, auto-reply WhatsApp
   ====================================================================== */
  const mockConversations = [
    {
      id: 'conv-2',
      channel: 'shopee',
      channelName: 'Shopee',
      customerName: 'Kak Dimas Pratama',
      customerId: 'dimas_store99',
      customerTier: 'Pelanggan Baru',
      status: 'sent',
      statusLabel: 'Balasan Terkirim',
      statusClass: 'bg-sky-50 text-sky-700 border-sky-200',
      lastMessage: 'Resi pesanan saya sudah keluar belum min?',
      timestamp: Date.now() - 900000,
      inventory: {
        sku: 'HJB-BLK-01',
        name: 'Hijab Segiempat Voal Hitam',
        stockActual: 8,
        stockRequested: 1,
        price: 45000,
        margin: '45%',
        substitutes: []
      },
      chatHistory: [
        { sender: 'customer', text: 'Resi pesanan saya sudah keluar belum min?', time: '13:48 WIB' },
        { sender: 'ai', text: 'Halo Kak Dimas! Resi pesanan JNE Reguler dengan nomor JNE8821902 sudah terbit dan sedang dalam perjalanan menuju kurir.', time: '13:48 WIB' }
      ],
      draft: 'Halo Kak Dimas! Resi sudah otomatis tercetak dan dalam pengiriman.'
    },
    {
      id: 'conv-3',
      channel: 'tokopedia',
      channelName: 'Tokopedia',
      customerName: 'Bpk. Hendra Wijaya',
      customerId: 'hendra_w_jkt',
      customerTier: 'Pelanggan Langganan',
      status: 'draft',
      statusLabel: 'Draft Mode Ready',
      statusClass: 'bg-sage-soft text-sage-dark border-sage/40',
      lastMessage: 'Min, kemeja linen putih ukuran XL ready untuk pengiriman gojek instan?',
      timestamp: Date.now() - 1800000,
      inventory: {
        sku: 'KMG-WHT-XL',
        name: 'Kemeja Linen Pria Putih XL',
        stockActual: 25,
        stockRequested: 2,
        price: 135000,
        margin: '40%',
        substitutes: []
      },
      chatHistory: [
        { sender: 'customer', text: 'Min, kemeja linen putih ukuran XL ready untuk pengiriman gojek instan?', time: '13:20 WIB' }
      ],
      draft: 'Halo Bpk. Hendra! Kemeja Linen Pria Putih XL ready stok sebanyak 25 pcs di gudang. Bisa langsung dikirim via Gojek Instan hari ini ya Pak.'
    }
    ,{
      id: 'conv-wa-1', channel: 'whatsapp', channelName: 'WhatsApp',
      customerName: 'Nadia Putri', customerId: '+62812-3456-7810', customerTier: 'Pelanggan Baru',
      status: 'approval', statusLabel: 'Menunggu Approval', statusClass: 'bg-amber-50 text-amber-800 border-amber-200',
      lastMessage: 'Kak, blouse warna cream masih tersedia ukuran M?', timestamp: Date.now() - 240000,
      inventory: { sku: 'BLS-CRM-M', name: 'Blouse Cream Size M', stockActual: 6, stockRequested: 1, price: 89000, margin: '38%', substitutes: [] },
      chatHistory: [{ sender: 'customer', text: 'Kak, blouse warna cream masih tersedia ukuran M?', time: '14:02 WIB' }],
      draft: 'Halo Kak Nadia! Blouse warna cream ukuran M masih tersedia 6 pcs. Mau kami bantu proses pesanannya?'
    },
    {
      id: 'conv-wa-2', channel: 'whatsapp', channelName: 'WhatsApp',
      customerName: 'Rina Safitri', customerId: '+62813-9087-2210', customerTier: 'Pelanggan Langganan',
      status: 'autoreply', statusLabel: 'Auto-Replied', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      lastMessage: 'Kalau pesan sekarang bisa dikirim hari ini?', timestamp: Date.now() - 780000,
      inventory: { sku: 'PSM-LAV-01', name: 'Pashmina Silk Lavender', stockActual: 12, stockRequested: 2, price: 65000, margin: '42%', substitutes: [] },
      chatHistory: [{ sender: 'customer', text: 'Kalau pesan sekarang bisa dikirim hari ini?', time: '13:54 WIB' }, { sender: 'ai', text: 'Bisa Kak Rina, stok tersedia. Pesanan yang masuk sebelum batas pickup akan diproses hari ini.', time: '13:54 WIB' }],
      draft: 'Bisa Kak Rina, stok tersedia. Pesanan yang masuk sebelum batas pickup akan diproses hari ini.'
    },
    {
      id: 'conv-wa-3', channel: 'whatsapp', channelName: 'WhatsApp',
      customerName: 'Fajar Maulana', customerId: '+62857-1122-3090', customerTier: 'Pelanggan Baru',
      status: 'draft', statusLabel: 'Draft Mode Ready', statusClass: 'bg-sage-soft text-sage-dark border-sage/40',
      lastMessage: 'Boleh minta foto detail bahan kemejanya?', timestamp: Date.now() - 1320000,
      inventory: { sku: 'KMG-NVY-L', name: 'Kemeja Oxford Navy L', stockActual: 9, stockRequested: 1, price: 149000, margin: '35%', substitutes: [] },
      chatHistory: [{ sender: 'customer', text: 'Boleh minta foto detail bahan kemejanya?', time: '13:45 WIB' }],
      draft: 'Halo Kak Fajar! Untuk detail bahan Kemeja Oxford Navy, kami bisa bantu kirimkan foto produknya. Ukuran L saat ini tersedia 9 pcs.'
    },
    {
      id: 'conv-sp-2', channel: 'shopee', channelName: 'Shopee',
      customerName: 'Aulia Rahman', customerId: 'aulia_rhmn22', customerTier: 'Pelanggan Langganan',
      status: 'approval', statusLabel: 'Menunggu Approval', statusClass: 'bg-amber-50 text-amber-800 border-amber-200',
      lastMessage: 'Bisa tukar warna sebelum pesanan dikirim?', timestamp: Date.now() - 2100000,
      inventory: { sku: 'TNC-BLK-28', name: 'Tunic Basic Black', stockActual: 0, stockRequested: 1, price: 119000, margin: '32%', substitutes: ['Tunic Basic Navy'] },
      chatHistory: [{ sender: 'customer', text: 'Bisa tukar warna sebelum pesanan dikirim?', time: '13:10 WIB' }],
      draft: 'Halo Kak Aulia, untuk warna hitam stok sedang kosong. Kami memiliki warna navy sebagai alternatif. Apakah Kakak berkenan?'
    },
    {
      id: 'conv-tk-1', channel: 'tiktok', channelName: 'TikTok Shop',
      customerName: 'Kevin Santoso', customerId: 'kevin_snt', customerTier: 'Pelanggan Baru',
      status: 'draft', statusLabel: 'Draft Mode Ready', statusClass: 'bg-sage-soft text-sage-dark border-sage/40',
      lastMessage: 'Ukuran sepatu ini true to size atau perlu naik satu ukuran?', timestamp: Date.now() - 2700000,
      inventory: { sku: 'SND-WHT-40', name: 'Sneakers White Size 40', stockActual: 4, stockRequested: 1, price: 229000, margin: '30%', substitutes: [] },
      chatHistory: [{ sender: 'customer', text: 'Ukuran sepatu ini true to size atau perlu naik satu ukuran?', time: '12:58 WIB' }],
      draft: 'Halo Kak Kevin! Model ini cenderung true to size. Jika biasanya menggunakan ukuran 40, Kakak bisa memilih ukuran yang sama.'
    },
    {
      id: 'conv-tp-2', channel: 'tokopedia', channelName: 'Tokopedia',
      customerName: 'Maya Anggraini', customerId: 'maya_anggraini88', customerTier: 'Pelanggan Langganan',
      status: 'sent', statusLabel: 'Balasan Terkirim', statusClass: 'bg-sky-50 text-sky-700 border-sky-200',
      lastMessage: 'Apakah tersedia opsi pengiriman instan?', timestamp: Date.now() - 3300000,
      inventory: { sku: 'DRS-BGE-M', name: 'Dress Linen Beige M', stockActual: 7, stockRequested: 1, price: 189000, margin: '41%', substitutes: [] },
      chatHistory: [{ sender: 'customer', text: 'Apakah tersedia opsi pengiriman instan?', time: '12:46 WIB' }, { sender: 'ai', text: 'Tersedia Kak, opsi pengiriman mengikuti pilihan kurir yang muncul saat checkout.', time: '12:46 WIB' }],
      draft: 'Tersedia Kak, opsi pengiriman mengikuti pilihan kurir yang muncul saat checkout.'
    }
  ];

  let activeConversationId = 'conv-2';
  let inboxChannelFilter = 'all';
  let inboxStatusFilter = 'all';
  let whatsappAutoReplyEnabled = true;

  function toggleWhatsappAutoReply() {
    whatsappAutoReplyEnabled = !whatsappAutoReplyEnabled;
    const toggle = document.getElementById('wa-auto-reply-toggle');
    const state = document.getElementById('wa-auto-reply-state');
    const knob = document.getElementById('wa-auto-reply-knob');
    if (toggle) {
      toggle.setAttribute('aria-checked', String(whatsappAutoReplyEnabled));
      toggle.className = `relative w-10 h-[22px] rounded-full ${whatsappAutoReplyEnabled ? 'bg-emerald-500' : 'bg-slate-300'} transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300`;
    }
    if (state) {
      state.textContent = whatsappAutoReplyEnabled ? 'Aktif' : 'Nonaktif · Draft saja';
      state.className = `text-[9.5px] font-semibold ${whatsappAutoReplyEnabled ? 'text-emerald-700' : 'text-rose-600'}`;
    }
    if (knob) {
      knob.className = `absolute top-[3px] ${whatsappAutoReplyEnabled ? 'right-[3px]' : 'left-[3px]'} w-4 h-4 rounded-full bg-white shadow-sm transition-all`;
    }
    showToast(whatsappAutoReplyEnabled ? 'Auto-reply WhatsApp diaktifkan.' : 'Auto-reply WhatsApp dimatikan. Chat masuk akan masuk ke mode draft dan menunggu staff.', whatsappAutoReplyEnabled ? 'success' : 'info');
    renderConversationList();
    renderConversationDetail();
  }

  function filterInboxChannel(chan, button) {
    inboxChannelFilter = chan;
    document.querySelectorAll('.inbox-chan-btn').forEach(btn => {
      btn.className = 'inbox-chan-btn px-3 py-1.5 rounded-lg bg-cream-canvas text-navy-muted hover:text-navy font-medium text-[12px] whitespace-nowrap';
    });
    if (button) button.className = 'inbox-chan-btn px-3 py-1.5 rounded-lg bg-navy text-white font-semibold text-[12px] whitespace-nowrap';
    renderConversationList();
  }

  function filterInboxStatus(stat) {
    inboxStatusFilter = stat;
    ['all', 'approval', 'autoreply'].forEach(s => {
      const b = document.getElementById(`inbox-stat-${s}`);
      if (b) {
        b.className = s === stat ? 'px-2.5 py-1 rounded-md bg-white text-navy font-bold shadow-2xs' : 'px-2.5 py-1 rounded-md text-navy-muted hover:text-navy';
      }
    });
    renderConversationList();
  }

  function selectConversation(id) {
    activeConversationId = id;
    renderConversationList();
    renderConversationDetail();
  }

  function updateInboxCounters() {
    const totalCount = mockConversations.length;
    const waCount = mockConversations.filter(c => c.channel === 'whatsapp').length;
    const shopeeCount = mockConversations.filter(c => c.channel === 'shopee').length;
    const tokopCount = mockConversations.filter(c => c.channel === 'tokopedia').length;
    const tiktokCount = mockConversations.filter(c => c.channel === 'tiktok').length;
    const approvalCount = mockConversations.filter(c => c.status === 'approval').length;

    const elAll = document.getElementById('count-chan-all');
    const elWa = document.getElementById('count-chan-wa');
    const elShopee = document.getElementById('count-chan-shopee');
    const elTokop = document.getElementById('count-chan-tokopedia');
    const elTiktok = document.getElementById('count-chan-tiktok');
    const elMetricApproval = document.getElementById('metric-approval-count');

    if (elAll) elAll.textContent = totalCount;
    const queueTotal = document.getElementById('queue-total-label');
    if (queueTotal) queueTotal.textContent = `(${totalCount})`;
    if (elWa) elWa.textContent = waCount;
    if (elShopee) elShopee.textContent = shopeeCount;
    if (elTokop) elTokop.textContent = tokopCount;
    if (elTiktok) elTiktok.textContent = tiktokCount;
    if (elMetricApproval) elMetricApproval.textContent = `${approvalCount} Chat`;
  }

  function renderConversationList() {
    updateInboxCounters();
    const container = document.getElementById('inbox-conversation-list');
    if (!container) return;

    let filtered = mockConversations.filter(c => {
      if (inboxChannelFilter !== 'all' && c.channel !== inboxChannelFilter) return false;
      if (inboxStatusFilter === 'approval' && c.status !== 'approval') return false;
      if (inboxStatusFilter === 'autoreply' && !(c.channel === 'whatsapp' && c.status === 'autoreply')) return false;
      return true;
    });

    if (!filtered.length) {
      container.innerHTML = `<div class="p-8 text-center text-[12px] text-navy-muted">Tidak ada percakapan yang sesuai dengan filter.</div>`;
      return;
    }

    container.innerHTML = filtered.map(c => {
      const active = c.id === activeConversationId;
      const bgClass = active ? 'bg-sage-soft/60 border-l-4 border-l-navy' : 'hover:bg-cream-canvas/60';
      return `
        <div onclick="selectConversation('${c.id}')" class="p-3 cursor-pointer transition-all flex flex-col gap-1.5 border-b border-warm-border ${bgClass}">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-navy text-white flex items-center justify-center font-bold text-[10px]">${c.channelName.charAt(0)}</span>
              <span class="font-jakarta font-bold text-[13px] text-navy truncate">${c.customerName}</span>
            </div>
            <span class="text-[10px] text-navy-muted">${formatWibTime(c.timestamp)}</span>
          </div>
          <p class="text-[12px] text-navy-muted line-clamp-1">${c.lastMessage}</p>
          <div class="flex items-center justify-between mt-0.5">
            <span class="px-2 py-[2px] rounded-full border text-[10px] font-bold ${c.statusClass}">${c.statusLabel}</span>
            <span class="text-[10.5px] text-navy font-semibold">${c.channelName}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderConversationDetail() {
    const pane = document.getElementById('inbox-detail-pane');
    const conv = mockConversations.find(c => c.id === activeConversationId) || mockConversations[0];
    if (!pane || !conv) return;

    activeConversationId = conv.id;
    const inv = conv.inventory;
    const isDeficit = inv.stockActual < inv.stockRequested;

    pane.innerHTML = `
      <!-- A. Header Percakapan -->
      <div class="p-3.5 border-b border-warm-border bg-cream-canvas/70 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[13px] shrink-0">${conv.customerName.charAt(0)}</div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h2 class="font-jakarta font-bold text-[14px] text-navy truncate">${conv.customerName}</h2>
              <span class="px-2 py-[2px] rounded-full bg-navy text-white text-[10px] font-bold">${conv.channelName}</span>
            </div>
            <div class="text-[11px] text-navy-muted truncate">ID: ${conv.customerId} • ${conv.customerTier}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="showToast('Membuka detail kontak pelanggan...', 'info')" class="px-2.5 py-1.5 rounded-lg bg-white border border-warm-border text-navy text-[11.5px] font-semibold">Kontak</button>
          <button onclick="showToast('Membuka riwayat pesanan...', 'info')" class="px-2.5 py-1.5 rounded-lg bg-white border border-warm-border text-navy text-[11.5px] font-semibold">Riwayat Pesanan</button>
        </div>
      </div>

      <!-- C. Area Chat & Guardrail Notice -->
      <div class="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-white">
        ${isDeficit ? `
          <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] flex items-start gap-2.5">
            <span class="font-bold shrink-0">⚠️ Intervensi Guardrail:</span>
            <span>Stok gudang tidak mencukupi permintaan (Stok: ${inv.stockActual}, Minta: ${inv.stockRequested}). AI memicu mode Draf Persetujuan Owner.</span>
          </div>
        ` : ''}

        ${conv.chatHistory.map(msg => {
          const outgoing = msg.sender !== 'customer';
          const safeText = escapeInboxText(msg.text);
          const safeTime = escapeInboxText(msg.time || 'Baru saja');
          return `
            <div class="flex flex-col gap-1.5 max-w-[85%] ${outgoing ? 'ml-auto items-end' : 'mr-auto items-start'}">
              <div class="p-3 rounded-2xl ${outgoing ? 'rounded-tr-sm bg-sage-soft border border-sage/40' : 'rounded-tl-sm bg-cream-canvas border border-warm-border'} text-navy text-[12.5px] shadow-2xs whitespace-pre-wrap break-words">${safeText}</div>
              <span class="text-[10px] text-navy-muted ${outgoing ? 'pr-1' : 'pl-1'}">${safeTime}${outgoing ? ' · Terkirim' : ''}</span>
            </div>
          `;
        }).join('')}

        <div class="text-center my-1"><span class="text-[10.5px] text-navy-muted bg-cream-canvas px-2.5 py-0.5 rounded-full border border-warm-border">Entitas: ${inv.sku} • ${inv.stockRequested} pcs terverifikasi DB</span></div>
      </div>

      <!-- D. Panel AI Response -->
      <div class="p-3.5 border-t border-warm-border bg-white flex flex-col gap-2.5">
        ${conv.channel === 'whatsapp' ? `<div class="flex items-center gap-2 text-[10.5px] ${whatsappAutoReplyEnabled ? 'text-emerald-700' : 'text-rose-600'}"><span class="material-symbols-outlined text-[15px]">${whatsappAutoReplyEnabled ? 'smart_toy' : 'pause_circle'}</span><span>${whatsappAutoReplyEnabled ? 'Auto-reply hanya aktif untuk WhatsApp. Pesan otomatis tetap mengikuti guardrail.' : 'Auto-reply WhatsApp nonaktif. Draft menunggu persetujuan dan pengiriman manual staff.'}</span></div>` : `<div class="flex items-center gap-2 text-[10.5px] text-sky-700"><span class="material-symbols-outlined text-[15px]">support_agent</span><span>Balasan ${conv.channelName} dikirim manual setelah staff menyetujui draft. Auto-reply tidak berlaku untuk kanal ini.</span></div>`}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-jakarta font-bold text-[12.5px] text-navy">Draf Balasan AI (Copilot)</span>
            <span class="px-2 py-[2px] rounded bg-amber-100 text-amber-900 text-[10px] font-bold">Human Approval</span>
          </div>
          <span id="char-counter" class="text-[11px] text-navy-muted">${conv.draft.length} karakter</span>
        </div>

        <textarea id="ai-draft-textarea" rows="2" oninput="updateCharCount(this)" class="w-full rounded-xl bg-cream-canvas/60 border border-warm-border p-2.5 text-[12.5px] text-navy focus:outline-none focus:ring-1 focus:ring-sage">${conv.draft}</textarea>

        <div class="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div class="flex items-center gap-2">
            <button onclick="approveAndSendReply('${conv.id}')" class="px-3.5 py-2 rounded-xl bg-navy hover:bg-navy/90 text-white font-jakarta font-bold text-[12px] shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5"><span class="material-symbols-outlined text-[16px]">send</span><span>${`Setujui &amp; Kirim via ${conv.channelName}`}</span></button>
            <button onclick="regenerateDraftReply('${conv.id}')" class="px-3 py-2 rounded-xl bg-white border border-warm-border text-navy font-semibold text-[12px] hover:bg-cream-canvas">Generate Ulang (Rp 400)</button>
          </div>
          <button onclick="showToast('Draf ditolak / balas manual aktif.', 'info')" class="text-[11.5px] text-rose-600 font-semibold hover:underline">Tolak / Balas Manual</button>
        </div>
      </div>

      <!-- E. Footer Audit -->
      <div class="px-4 py-2 bg-cream-canvas/70 border-t border-warm-border text-[10.5px] text-navy-muted flex items-center justify-between">
        <span>Data inventaris diambil langsung dari database (bukan estimasi)</span>
        <span>Token: 240 • Est. Biaya: Rp 400</span>
      </div>
    `;
  }

  function updateCharCount(el) {
    const counter = document.getElementById('char-counter');
    if (counter) counter.textContent = `${el.value.length} karakter`;
  }

  function escapeInboxText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function currentInboxTime() {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(new Date()) + ' WIB';
  }

  // Prototype-only sender: appends a sent message to the local conversation timeline.
  // Production delivery requires each marketplace/WhatsApp API connection and credentials.
  function sendApprovedReply(conversationId, text) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, simulated: true, conversationId, text }), 650);
    });
  }

  function regenerateDraft(conversationId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, newDraft: 'Halo Kak! Berdasarkan update database terbaru, alternatif produk tersedia dan siap dikirim hari ini.' });
      }, 800);
    });
  }

  function approveAndSendReply(id) {
    const ta = document.getElementById('ai-draft-textarea');
    const text = ta ? ta.value.trim() : '';
    const conv = mockConversations.find(c => c.id === id);
    if (!conv) return;
    if (!text) { showToast('Isi draft balasan terlebih dahulu.', 'info'); return; }

    conv.draft = text;
    showToast(`Memproses pengiriman ${conv.channelName}...`, 'info');
    sendApprovedReply(id, text).then(result => {
      if (!result.success) { showToast('Pesan gagal dikirim. Coba lagi.', 'error'); return; }
      const sentAt = currentInboxTime();
      conv.chatHistory.push({ sender: 'staff', text: text, time: sentAt });
      conv.lastMessage = text;
      conv.timestamp = Date.now();
      // Auto-reply is a WhatsApp-only feature. A staff-approved send on any channel is never labelled Auto-Replied.
      conv.status = 'sent';
      conv.statusLabel = 'Balasan Terkirim';
      conv.statusClass = 'bg-sky-50 text-sky-700 border-sky-200';
      renderConversationList();
      renderConversationDetail();
      showToast(`Draft ditambahkan ke riwayat chat ${conv.customerName} (${conv.channelName}). ${result.simulated ? 'Mode prototype: simulasi lokal.' : ''}`, 'success');
    }).catch(() => showToast('Pengiriman gagal. Periksa koneksi kanal.', 'error'));
  }

  function regenerateDraftReply(id) {
    const conv = mockConversations.find(c => c.id === id);
    if (!conv) return;

    showToast('Menyusun draf ulang dengan AI...', 'info');
    regenerateDraft(id).then(res => {
      conv.draft = res.newDraft;
      const ta = document.getElementById('ai-draft-textarea');
      if (ta) ta.value = res.newDraft;
      updateCharCount(ta);
      showToast('Draf baru berhasil disusun (-Rp 400).', 'success');
    });
  }

  function refreshInboxQueue() {
    showToast('Antrean inbox diperbarui dari webhook.', 'success');
    renderConversationList();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderConversationList();
    renderConversationDetail();
  });
  window.toggleWhatsappAutoReply = toggleWhatsappAutoReply;
