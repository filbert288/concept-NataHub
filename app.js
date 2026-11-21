/* ===== core ===== */
/* ======================================================================
   Inti aplikasi: navigasi, toast, canvas workflow, node, opname, feed aktivitas
   ====================================================================== */
    // Global Navigation Controller
    function navigateTo(viewId) {
      document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('flex');
      });
      const target = document.getElementById(`view-${viewId}`);
      if (target) {
        target.classList.remove('hidden');
        target.classList.add('flex');
      }

      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-sage-soft', 'text-navy', 'font-bold', 'border', 'border-sage/40');
        el.classList.add('text-navy-muted');
      });
      const activeNavBtn = document.querySelector(`[data-nav="${viewId}"]`);
      if (activeNavBtn) {
        activeNavBtn.classList.remove('text-navy-muted');
        activeNavBtn.classList.add('bg-sage-soft', 'text-navy', 'font-bold', 'border', 'border-sage/40');
      }

      const mobileSidebar = document.getElementById('left-sidebar');
      const mobileBackdrop = document.getElementById('mobile-backdrop');
      if (mobileSidebar && !mobileSidebar.classList.contains('-translate-x-full')) {
        mobileSidebar.classList.add('-translate-x-full');
        if (mobileBackdrop) mobileBackdrop.classList.add('hidden');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Global Toast Notification Helper
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      let bgClass = 'bg-navy text-white';
      if (type === 'success') bgClass = 'bg-emerald-700 text-white';
      if (type === 'error') bgClass = 'bg-rose-700 text-white';
      if (type === 'info') bgClass = 'bg-navy text-white';

      toast.className = `pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg font-jakarta text-[12.5px] font-semibold transition-all duration-300 translate-y-2 opacity-0 flex items-center gap-2 border border-white/10 ${bgClass}`;
      toast.innerHTML = `<span>${message}</span>`;
      
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    const currentUser = { name: "Sari Kusuma", initials: "SK", role: "Owner" };

    // Helper to format Date into Asia/Jakarta time strings and relative labels
    function formatWibTime(timestamp) {
      const d = new Date(timestamp);
      const timeStr = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(d) + ' WIB';
      return timeStr.replace('.', ':');
    }

    function formatRelativeTime(timestamp) {
      const now = Date.now();
      const diffSec = Math.floor((now - timestamp) / 1000);
      
      if (diffSec < 60) {
        return 'baru saja';
      }
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return `${diffMin} menit lalu`;
      }
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) {
        return `${diffHour} jam lalu`;
      }
      const d = new Date(timestamp);
      const dateStr = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(d);
      return dateStr.replace('.', ':');
    }

    function getJakartaDateLabel() {
      const now = new Date();
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(now);
    }
    
    // Initial 14 Mock SKUs Dataset with dynamic relative timestamp offsets
    const getInitialOpnameRows = () => [
      { 
        id: 'sku-1', 
        name: 'Gamis Navy Ceruty L', 
        sku: 'GMS-NVY-L • Rak A-02', 
        code: 'GMS-NVY-L',
        batch: '#B-2024-04', 
        expDate: '2026-12-30',
        db: 42, 
        fisik: 42, 
        storesData: { 
          "Shopee Official": { stock: 42, status: "sync", timestamp: Date.now() - 120000 }, 
          "Tokopedia Mall": { stock: 42, status: "sync", timestamp: Date.now() - 120000 }, 
          "TikTok Shop": { stock: 42, status: "sync", timestamp: Date.now() - 120000 } 
        } 
      },
      { 
        id: 'sku-2', 
        name: 'Gamis Emerald Silk M', 
        sku: 'GMS-EMR-M • Rak A-03', 
        code: 'GMS-EMR-M',
        batch: '#B-2024-03', 
        expDate: '2026-12-15',
        db: 18, 
        fisik: 17, 
        storesData: { 
          "Shopee Official": { stock: 18, status: "sync", timestamp: Date.now() - 300000 }, 
          "Tokopedia Mall": { stock: 18, status: "queued", timestamp: Date.now() - 1080000 }, 
          "TikTok Shop": { stock: 18, status: "sync", timestamp: Date.now() - 400000 } 
        } 
      },
      { 
        id: 'sku-3', 
        name: 'Hijab Segiempat Voal Hitam', 
        sku: 'HJB-BLK-01 • Rak B-01', 
        code: 'HJB-BLK-01',
        batch: '#B-2024-02', 
        expDate: '2026-11-28',
        db: 8, 
        fisik: 8, 
        storesData: { 
          "Shopee Official": { stock: 8, status: "sync", timestamp: Date.now() - 150000 }, 
          "Tokopedia Mall": { stock: 8, status: "sync", timestamp: Date.now() - 150000 }, 
          "TikTok Shop": { stock: 8, status: "sync", timestamp: Date.now() - 150000 } 
        } 
      },
      { 
        id: 'sku-4', 
        name: 'Kemeja Linen Pria Putih XL', 
        sku: 'KMG-WHT-XL • Rak C-01', 
        code: 'KMG-WHT-XL',
        batch: '#B-2024-01', 
        expDate: '2027-01-10',
        db: 25, 
        fisik: 25, 
        storesData: { 
          "Shopee Official": { stock: 25, status: "sync", timestamp: Date.now() - 100000 }, 
          "Tokopedia Mall": { stock: 25, status: "sync", timestamp: Date.now() - 100000 }, 
          "TikTok Shop": { stock: 25, status: "sync", timestamp: Date.now() - 100000 } 
        } 
      },
      { 
        id: 'sku-5', 
        name: 'Gamis Dusty Pink S', 
        sku: 'GMS-DPK-S • Rak A-04', 
        code: 'GMS-DPK-S',
        batch: '#B-2024-05', 
        expDate: '2027-02-01',
        db: 30, 
        fisik: 33, 
        storesData: { 
          "Shopee Official": { stock: 30, status: "sync", timestamp: Date.now() - 1500000 }, 
          "Tokopedia Mall": { stock: 30, status: "sync", timestamp: Date.now() - 1500000 }, 
          "TikTok Shop": { stock: 30, status: "sync", timestamp: Date.now() - 1500000 } 
        } 
      },
      { 
        id: 'sku-6', 
        name: 'Hijab Pashmina Plisket Cream', 
        sku: 'HJB-CRM-02 • Rak B-02', 
        code: 'HJB-CRM-02',
        batch: '#B-2024-06', 
        expDate: '2027-02-15',
        db: 55, 
        fisik: 55, 
        storesData: { 
          "Shopee Official": { stock: 55, status: "sync", timestamp: Date.now() - 1800000 }, 
          "Tokopedia Mall": { stock: 55, status: "sync", timestamp: Date.now() - 1800000 }, 
          "TikTok Shop": { stock: 50, status: "fail", timestamp: Date.now() - 480000 } 
        } 
      },
      { 
        id: 'sku-7', 
        name: 'Kemeja Flanel Pria Kotak M', 
        sku: 'KMG-FLN-M • Rak C-02', 
        code: 'KMG-FLN-M',
        batch: '#B-2024-07', 
        expDate: '2027-03-01',
        db: 20, 
        fisik: 20, 
        storesData: { 
          "Shopee Official": { stock: 20, status: "sync", timestamp: Date.now() - 200000 }, 
          "Tokopedia Mall": { stock: 20, status: "sync", timestamp: Date.now() - 200000 }, 
          "TikTok Shop": { stock: 20, status: "sync", timestamp: Date.now() - 200000 } 
        } 
      },
      { 
        id: 'sku-8', 
        name: 'Tunik Batik Kombinasi L', 
        sku: 'TNK-BTK-L • Rak D-01', 
        code: 'TNK-BTK-L',
        batch: '#B-2024-08', 
        expDate: '2027-01-20',
        db: 14, 
        fisik: 12, 
        storesData: { 
          "Shopee Official": { stock: 14, status: "queued", timestamp: Date.now() - 780000 }, 
          "Tokopedia Mall": { stock: 14, status: "queued", timestamp: Date.now() - 780000 }, 
          "TikTok Shop": { stock: 14, status: "sync", timestamp: Date.now() - 250000 } 
        } 
      },
      { 
        id: 'sku-9', 
        name: 'Rok Plisket Mocca All Size', 
        sku: 'ROK-MCC-AS • Rak D-02', 
        code: 'ROK-MCC-AS',
        batch: '#B-2024-09', 
        expDate: '2027-03-10',
        db: 38, 
        fisik: 38, 
        storesData: { 
          "Shopee Official": { stock: 38, status: "sync", timestamp: Date.now() - 100000 }, 
          "Tokopedia Mall": { stock: 38, status: "sync", timestamp: Date.now() - 100000 }, 
          "TikTok Shop": { stock: 38, status: "sync", timestamp: Date.now() - 100000 } 
        } 
      },
      { 
        id: 'sku-10', 
        name: 'Hijab Instan Jersey Navy', 
        sku: 'HJB-NVY-03 • Rak B-03', 
        code: 'HJB-NVY-03',
        batch: '#B-2024-10', 
        expDate: '2027-04-01',
        db: 3, 
        fisik: 3, 
        storesData: { 
          "Shopee Official": { stock: 3, status: "sync", timestamp: Date.now() - 200000 }, 
          "Tokopedia Mall": { stock: 3, status: "sync", timestamp: Date.now() - 200000 }, 
          "TikTok Shop": { stock: 3, status: "sync", timestamp: Date.now() - 200000 } 
        } 
      },
      { 
        id: 'sku-11', 
        name: 'Celana Kulot Linen Hitam L', 
        sku: 'CLN-BLK-L • Rak D-03', 
        code: 'CLN-BLK-L',
        batch: '#B-2024-11', 
        expDate: '2027-02-28',
        db: 27, 
        fisik: 24, 
        storesData: { 
          "Shopee Official": { stock: 27, status: "sync", timestamp: Date.now() - 3000000 }, 
          "Tokopedia Mall": { stock: 27, status: "sync", timestamp: Date.now() - 3000000 }, 
          "TikTok Shop": { stock: 25, status: "fail", timestamp: Date.now() - 480000 } 
        } 
      },
      { 
        id: 'sku-12', 
        name: 'Gamis Anak Floral 8Th', 
        sku: 'GMS-KID-08 • Rak E-01', 
        code: 'GMS-KID-08',
        batch: '#B-2024-12', 
        expDate: '2027-03-15',
        db: 16, 
        fisik: 16, 
        storesData: { 
          "Shopee Official": { stock: 16, status: "sync", timestamp: Date.now() - 100000 }, 
          "Tokopedia Mall": { stock: 16, status: "sync", timestamp: Date.now() - 100000 }, 
          "TikTok Shop": { stock: 16, status: "sync", timestamp: Date.now() - 100000 } 
        } 
      },
      { 
        id: 'sku-13', 
        name: 'Kaos Polos Katun Putih XL', 
        sku: 'KOS-WHT-XL • Rak E-02', 
        code: 'KOS-WHT-XL',
        batch: '#B-2024-13', 
        expDate: '2027-05-01',
        db: 60, 
        fisik: 60, 
        storesData: { 
          "Shopee Official": { stock: 60, status: "sync", timestamp: Date.now() - 100000 }, 
          "Tokopedia Mall": { stock: 60, status: "sync", timestamp: Date.now() - 100000 }, 
          "TikTok Shop": { stock: 60, status: "sync", timestamp: Date.now() - 100000 } 
        } 
      },
      { 
        id: 'sku-14', 
        name: 'Hijab Segiempat Voal Maroon', 
        sku: 'HJB-MRN-01 • Rak B-04', 
        code: 'HJB-MRN-01',
        batch: '#B-2024-14', 
        expDate: '2026-11-25', 
        db: 4, 
        fisik: 4, 
        storesData: { 
          "Shopee Official": { stock: 4, status: "sync", timestamp: Date.now() - 150000 }, 
          "Tokopedia Mall": { stock: 4, status: "sync", timestamp: Date.now() - 150000 }, 
          "TikTok Shop": { stock: 4, status: "sync", timestamp: Date.now() - 150000 } 
        } 
      }
    ];

    const state = {
      quotaBalance: 38500,
      canvasZoom: 0.72,
      currentModalActionKey: 'ai-agent',
      modalMode: 'add', // 'add' or 'edit'
      editingNodeKey: null,
      customNodes: [],
      fastOpnameActive: false,
      opnameSession: { aktif: false, mulaiPada: null, pelaku: null, perubahan: [] },
      activeStoreFilter: null, 
      activeQuickTab: 'all',
      activeSyncModalRowId: null,
      feedFilter: 'all',
      activityFeed: [
        { id: 'f-1', type: 'opname', timestamp: Date.now() - 1560000, actor: 'Budi Santoso', initials: 'BS', text: 'Budi Santoso menyesuaikan GMS-EMR-M (-1 pcs, cacat jahitan).' },
        { id: 'f-2', type: 'opname', timestamp: Date.now() - 2580000, actor: 'Siti Lestari', initials: 'SL', text: 'Siti Lestari audit Rak B-01 selesai.' },
        { id: 'f-3', type: 'sync', timestamp: Date.now() - 3480000, actor: 'Sistem natahub', initials: 'AI', text: 'Sistem natahub auto-reserve 12 unit KMG-WHT-XL untuk flash sale Tokopedia.' }
      ],
      connectedStoresList: [
        { name: "Shopee Official", code: "Shopee" },
        { name: "Tokopedia Mall", code: "Tokopedia" },
        { name: "TikTok Shop", code: "TikTok" }
      ],
      opnameRows: getInitialOpnameRows(),
      selectedInspectorNode: {
        title: "Model Bahasa (Claude 3.5 Sonnet)",
        badge: "Kredit AI",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
        statusText: "Berhasil (200 OK)",
        execMeta: "Durasi: 1.120 ms • Biaya: Rp 200",
        inputJson: "{\n  \"session_id\": \"WA-628129901882\",\n  \"message_raw\": \"Kak, mau pesan Gamis Navy L 3 pcs ke Bekasi\",\n  \"timestamp\": \"2026-11-15T14:02:00+07:00\"\n}",
        outputJson: "{\n  \"connected_agent\": \"AI Asisten (NLP Intent Extractor)\",\n  \"provider\": \"Anthropic\",\n  \"model\": \"claude-3-5-sonnet\",\n  \"temperature\": 0.2,\n  \"status\": \"CONNECTED\"\n}"
      }
    };

    // Master unified definitions for node categories (nodeTypes)
    const nodeTypes = {
      'ai-agent': {
        id: 'ai-agent',
        title: 'AI Agent & LLM',
        badge: 'Kredit AI',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        iconSvg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="11" rx="2"/><path d="M12 2v6M8 13h.01M16 13h.01M9 16h6"/></svg>',
        iconBoxClass: 'bg-purple-100 border-purple-200 text-purple-700',
        filename: 'ai_intent_extractor.json',
        labelFile: 'Prompt & JSON Schema',
        lang: 'JSON / Prompt',
        hasInputPort: true,
        defaultPort: 'AI Asisten → Output',
        testButtonLabel: 'Uji Jalankan Prompt',
        templateCode: '{\n  "model": "claude-3-5-sonnet",\n  "temperature": 0.2,\n  "system_prompt": "Ekstrak SKU, jumlah pesanan, dan alamat dari pesan WhatsApp pelanggan secara akurat.",\n  "max_tokens": 500\n}'
      },
      'app-marketplace': {
        id: 'app-marketplace',
        title: 'Aksi Aplikasi & Marketplace',
        badge: 'Otomatis',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconSvg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        iconBoxClass: 'bg-sky-100 border-sky-200 text-sky-700',
        filename: 'marketplace_action.json',
        labelFile: 'Integrasi & Payload',
        lang: 'JSON / JS',
        hasInputPort: true,
        defaultPort: 'Pesanan Marketplace → Auto-Sync',
        testButtonLabel: 'Uji Kirim Aksi',
        templateCode: '{\n  "platform": "Shopee Official / Tokopedia",\n  "action_type": "update_status",\n  "payload": {\n    "order_id": "INV-2026-001",\n    "fulfillment": "auto_print"\n  }\n}'
      },
      'gudang-stok': {
        id: 'gudang-stok',
        title: 'Gudang & Stok DB',
        badge: 'Rp 0 API',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        iconSvg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
        iconBoxClass: 'bg-blue-100 border-blue-200 text-blue-700',
        filename: 'stock_query.json',
        labelFile: 'SQL / Aksi Stok',
        lang: 'SQL Query (Postgres)',
        hasInputPort: true,
        defaultPort: 'Cek Kondisi Stok → Output',
        testButtonLabel: 'Uji Query',
        templateCode: 'SELECT sku, batch_code, physical_stock, expiry_date \nFROM inventory_batches \nWHERE physical_stock > 0 \nORDER BY expiry_date ASC;'
      },
      'logic-branch': {
        id: 'logic-branch',
        title: 'Logika Percabangan (IF/ELSE)',
        badge: 'Logika',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        iconSvg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.17-2.83L3 3m18 0-7.83 7.87A4 4 0 0 0 12 13.7"/></svg>',
        iconBoxClass: 'bg-amber-100 border-amber-200 text-amber-700',
        filename: 'branch_condition.json',
        labelFile: 'Kondisi IF/ELSE',
        lang: 'JavaScript Condition',
        hasInputPort: true,
        defaultPort: 'Cek Kondisi Stok → Output',
        testButtonLabel: 'Uji Kondisi',
        templateCode: 'if (input.available_stock >= input.requested_qty) {\n  return "TRUE_ENOUGH";\n} else {\n  return "FALSE_DEFICIT";\n}'
      },
      'hitl-approval': {
        id: 'hitl-approval',
        title: 'Persetujuan Manual (HITL)',
        badge: 'Aman',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconSvg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
        iconBoxClass: 'bg-emerald-100 border-emerald-200 text-emerald-700',
        filename: 'hitl_guardrail.json',
        labelFile: 'JSON Guardrail',
        lang: 'JSON Guardrail',
        hasInputPort: true,
        defaultPort: 'Draf Pesan Maaf → Output',
        testButtonLabel: 'Uji Kirim Permintaan',
        templateCode: '{\n  "action": "require_owner_approval",\n  "channels": ["whatsapp", "telegram"],\n  "timeout_hours": 24\n}'
      },
      'new-trigger': {
        id: 'new-trigger',
        title: 'Tambah Pemicu Baru',
        badge: 'Pemicu',
        badgeClass: 'bg-yellow-50 text-amber-800 border-yellow-200',
        iconSvg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        iconBoxClass: 'bg-yellow-100 border-yellow-200 text-amber-700',
        filename: 'trigger_config.json',
        labelFile: 'Konfigurasi Trigger',
        lang: 'Cron Trigger',
        hasInputPort: false,
        defaultPort: null,
        testButtonLabel: 'Uji Pemicu',
        templateCode: '{\n  "trigger_type": "cron_schedule",\n  "expression": "0 */2 * * *"\n}'
      }
    };

    // Master definition for canvas nodes and their metadata / connections
    const canvasNodeMetadata = {
      'mp-trigger': {
        key: 'mp-trigger',
        title: 'Pesanan Marketplace',
        actionKey: 'app-marketplace',
        tampilanPopup: 'alur',
        badge: 'Otomatis',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        inputs: [],
        outputs: [
          { target: 'Cek Kondisi Stok', port: 'Output Utama', desc: 'data pesanan: SKU, jumlah' }
        ],
        inputJson: '{\n  "store": "Shopee Official",\n  "order_id": "SHOPEE-INV-88910",\n  "sku": "GMS-NVY-L",\n  "qty": 3\n}',
        outputJson: '{\n  "status": "WEBHOOK_RECEIVED",\n  "latency_ms": 140\n}',
        advice: 'Webhook marketplace stabil. Pastikan secret key API terverifikasi.'
      },
      'wa-trigger': {
        key: 'wa-trigger',
        title: 'Pesan WA Masuk',
        actionKey: 'new-trigger',
        tampilanPopup: 'alur',
        badge: 'Pemicu',
        badgeClass: 'bg-yellow-50 text-amber-800 border-yellow-200',
        inputs: [],
        outputs: [
          { target: 'AI Asisten', port: 'Inbound Trigger', desc: 'teks chat pelanggan' }
        ],
        inputJson: '{\n  "sender": "+628129901882",\n  "message": "Kak, mau pesan Gamis Navy L 3 pcs"\n}',
        outputJson: '{\n  "status": "FORWARDED_TO_AI",\n  "session_active": true\n}',
        advice: 'Koneksi Gateway WhatsApp aktif tanpa kendala.'
      },
      'ai-nlp': {
        key: 'ai-nlp',
        title: 'AI Asisten',
        actionKey: 'ai-agent',
        tampilanPopup: 'alur',
        badge: 'Kredit AI',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        inputs: [
          { source: 'Pesan WA Masuk', port: 'Inbound', desc: 'teks chat pelanggan' }
        ],
        uses: [
          { resource: 'Model Bahasa', port: 'Port Model (Ungu)', desc: 'otak LLM Claude 3.5 Sonnet' },
          { resource: 'Postgres Memory', port: 'Port Memory (Tosca)', desc: 'riwayat percakapan pelanggan' }
        ],
        outputs: [
          { target: 'Cek Kondisi Stok', port: 'Output Utama', desc: 'SKU, jumlah, kota tujuan' }
        ],
        inputJson: '{\n  "message_raw": "Kak, mau pesan Gamis Navy L 3 pcs ke Bekasi"\n}',
        outputJson: '{\n  "intent": "order_inquiry",\n  "sku": "SKU-GMN-L",\n  "qty": 3,\n  "confidence": 0.98\n}',
        advice: 'Intent extractor berjalan lancar. Biaya per panggilan Rp 200.'
      },
      'postgres-mem': {
        key: 'postgres-mem',
        title: 'Postgres Memory',
        actionKey: 'gudang-stok',
        tampilanPopup: 'layanan',
        badge: 'Rp 0 API',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        resourceType: 'database',
        provider: 'Database PostgreSQL',
        accessMethod: 'Koneksi database langsung, bukan API',
        functionDesc: 'Menyimpan riwayat percakapan pelanggan secara aman.',
        tables: ['customer_memory', 'chat_sessions'],
        status: 'Terpasang & Aktif',
        usedBy: ['AI Asisten'],
        inputs: [
          { source: 'AI Asisten', port: 'Port Memory', desc: 'query history percakapan' }
        ],
        outputs: [],
        advice: 'Query index teroptimasi untuk pencarian instan.'
      },
      'llm-engine': {
        key: 'llm-engine',
        title: 'Model Bahasa',
        actionKey: 'ai-agent',
        tampilanPopup: 'layanan',
        badge: 'Kredit AI',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        resourceType: 'llm',
        provider: 'Anthropic',
        model: 'Claude 3.5 Sonnet',
        accessMethod: 'API Endpoint /v1/messages',
        temperature: 0.2,
        maxTokens: 500,
        estCostPerRun: 'Rp 200',
        status: 'Terpasang & Aktif',
        usedBy: ['AI Asisten', 'Draf Pesan Maaf'],
        inputs: [],
        outputs: [],
        advice: 'Parameter temperature diatur optimal untuk kestabilan respon.'
      },
      'cek-stok': {
        key: 'cek-stok',
        title: 'Cek Kondisi Stok',
        actionKey: 'logic-branch',
        tampilanPopup: 'alur',
        badge: 'Logika',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        inputs: [
          { source: 'Pesanan Marketplace', port: 'Input Utama', desc: 'data pesanan: SKU, jumlah' },
          { source: 'AI Asisten', port: 'Input Kedua', desc: 'hasil ekstraksi pesan WhatsApp' }
        ],
        outputs: [
          { target: 'Cetak Resi Otomatis', port: 'Cabang True', desc: 'stok cukup, lanjut cetak' },
          { target: 'Draf Pesan Maaf', port: 'Cabang False', desc: 'stok kurang, susun draf maaf' }
        ],
        inputJson: '{\n  "sku": "GMS-NVY-L",\n  "requested": 3,\n  "available": 42\n}',
        outputJson: '{\n  "branch_taken": "TRUE_ENOUGH",\n  "remaining_stock": 39\n}',
        advice: 'Percabangan stok berjalan deterministik.'
      },
      'cetak-resi': {
        key: 'cetak-resi',
        title: 'Cetak Resi Otomatis',
        actionKey: 'app-marketplace',
        tampilanPopup: 'alur',
        badge: 'Otomatis',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        inputs: [
          { source: 'Cek Kondisi Stok', port: 'Cabang True', desc: 'stok cukup' }
        ],
        outputs: [],
        inputJson: '{\n  "order_id": "INV-20261115-01",\n  "courier": "JNE Regular"\n}',
        outputJson: '{\n  "printer_status": "ONLINE",\n  "job_id": "PRINT-9912"\n}',
        advice: 'Printer kasir online USB/BT terhubung.'
      },
      'draf-maaf': {
        key: 'draf-maaf',
        title: 'Draf Pesan Maaf',
        actionKey: 'hitl-approval',
        tampilanPopup: 'alur',
        badge: 'Aman',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        inputs: [
          { source: 'Cek Kondisi Stok', port: 'Cabang False', desc: 'stok kurang' }
        ],
        uses: [
          { resource: 'Model Bahasa', port: 'Port Model (Ungu Bawah)', desc: 'menyusun teks draf profesional' }
        ],
        outputs: [
          { target: 'Persetujuan Admin', port: 'Output HITL', desc: 'kirim notifikasi via WhatsApp/Telegram' }
        ],
        inputJson: '{\n  "deficit": 2,\n  "customer": "Ibu Rina"\n}',
        outputJson: '{\n  "hitl_status": "WAITING_ADMIN_APPROVAL",\n  "notification_sent": "WHATSAPP_ADMIN"\n}',
        advice: 'Persetujuan manual HITL aktif untuk mencegah kesalahan kirim.'
      }
    };

    let currentTroubleshootNodeKey = null;

    function openNodeTroubleshootModal(nodeKey) {
      currentTroubleshootNodeKey = nodeKey;
      const meta = canvasNodeMetadata[nodeKey];
      if (!meta) return;

      document.getElementById('ts-modal-title').textContent = `Troubleshooting Node: ${meta.title}`;
      const badge = document.getElementById('ts-modal-badge');
      badge.textContent = meta.badge;
      badge.className = `px-2 py-0.5 rounded-md text-[11px] font-bold border ${meta.badgeClass}`;

      // Render Inputs List
      const inputsList = document.getElementById('ts-modal-inputs-list');
      if (meta.inputs && meta.inputs.length > 0) {
        inputsList.innerHTML = meta.inputs.map(i => `
          <div class="text-[11.5px] text-navy py-0.5 border-b border-warm-border/50 last:border-0 flex flex-col">
            <span class="font-bold">${i.source} <span class="text-navy-muted font-normal">(${i.port})</span></span>
            <span class="text-[10.5px] text-navy-muted">${i.desc}</span>
          </div>
        `).join('');
      } else {
        inputsList.innerHTML = `<span class="text-[11px] text-navy-muted italic">Tidak ada input (Titik awal alur).</span>`;
      }

      // Render Uses (Model / Memory) List if any
      let usesHtml = '';
      if (meta.uses && meta.uses.length > 0) {
        usesHtml = `<div class="mt-2 pt-1 border-t border-warm-border"><span class="text-[10.5px] uppercase font-bold text-purple-700">Memakai (Resources)</span>` +
          meta.uses.map(u => `
            <div class="text-[11.5px] text-navy py-0.5 flex flex-col">
              <span class="font-bold text-purple-800">${u.resource} <span class="text-navy-muted font-normal">(${u.port})</span></span>
              <span class="text-[10.5px] text-navy-muted">${u.desc}</span>
            </div>
          `).join('') + `</div>`;
      }

      // Render Outputs List
      const outputsList = document.getElementById('ts-modal-outputs-list');
      let outputsCombinedHtml = '';
      if (meta.outputs && meta.outputs.length > 0) {
        outputsCombinedHtml += meta.outputs.map(o => `
          <div class="text-[11.5px] text-navy py-0.5 border-b border-warm-border/50 last:border-0 flex flex-col">
            <span class="font-bold">${o.target} <span class="text-navy-muted font-normal">(${o.port})</span></span>
            <span class="text-[10.5px] text-navy-muted">${o.desc}</span>
          </div>
        `).join('');
      } else {
        outputsCombinedHtml = `<span class="text-[11px] text-navy-muted italic">Belum tersambung ke node tujuan.</span>`;
      }
      outputsList.innerHTML = outputsCombinedHtml + usesHtml;

      // Handle tampilanPopup: 'layanan' vs 'alur'
      const jsonContainer = document.getElementById('ts-modal-json-container');
      const resCard = document.getElementById('ts-modal-resource-card');

      if (meta.tampilanPopup === 'layanan') {
        if (jsonContainer) jsonContainer.classList.add('hidden');
        if (resCard) {
          resCard.classList.remove('hidden');
          if (meta.resourceType === 'llm') {
            resCard.innerHTML = `
              <div class="flex items-center justify-between font-bold text-amber-400 text-[13px]">
                <span>Detail Layanan Model Bahasa (LLM)</span>
                <span id="ts-service-status-badge" class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10.5px]">${meta.status}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11.5px] pt-1">
                <div><span class="text-slate-400 block">Provider:</span> <strong class="text-white">${meta.provider}</strong></div>
                <div><span class="text-slate-400 block">Model:</span> <strong class="text-white">${meta.model}</strong></div>
                <div><span class="text-slate-400 block">Cara Akses:</span> <strong class="text-sky-300">${meta.accessMethod}</strong></div>
                <div><span class="text-slate-400 block">Temperature:</span> <strong class="text-white">${meta.temperature}</strong></div>
                <div><span class="text-slate-400 block">Est. Biaya:</span> <strong class="text-emerald-400">${meta.estCostPerRun} / run</strong></div>
                <div><span class="text-slate-400 block">Dipakai oleh:</span> <strong class="text-purple-300">${meta.usedBy.join(', ')}</strong></div>
              </div>
            `;
          } else if (meta.resourceType === 'database') {
            resCard.innerHTML = `
              <div class="flex items-center justify-between font-bold text-teal-400 text-[13px]">
                <span>Detail Sumber Daya Database &amp; Memory</span>
                <span id="ts-service-status-badge" class="px-2 py-0.5 rounded bg-teal-950 text-teal-300 text-[10.5px]">${meta.status}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11.5px] pt-1">
                <div><span class="text-slate-400 block">Jenis:</span> <strong class="text-white">${meta.provider}</strong></div>
                <div><span class="text-slate-400 block">Cara Akses:</span> <strong class="text-teal-300">${meta.accessMethod}</strong></div>
                <div class="col-span-2"><span class="text-slate-400 block">Fungsi:</span> <strong class="text-white">${meta.functionDesc}</strong></div>
                <div><span class="text-slate-400 block">Tabel Dipakai:</span> <strong class="text-white">${meta.tables.join(', ')}</strong></div>
                <div><span class="text-slate-400 block">Dipakai oleh:</span> <strong class="text-purple-300">${meta.usedBy.join(', ')}</strong></div>
              </div>
            `;
          }
        }
      } else {
        if (jsonContainer) jsonContainer.classList.remove('hidden');
        if (resCard) resCard.classList.add('hidden');
        document.getElementById('ts-modal-input').textContent = meta.inputJson;
        document.getElementById('ts-modal-output').textContent = meta.outputJson;
      }

      document.getElementById('ts-modal-advice').textContent = meta.advice;

      selectExistingNodeByMetadata(meta);

      document.getElementById('node-troubleshoot-modal').classList.remove('hidden');
      document.getElementById('node-troubleshoot-modal').classList.add('flex');
    }

    function closeNodeTroubleshootModal() {
      document.getElementById('node-troubleshoot-modal').classList.add('hidden');
      document.getElementById('node-troubleshoot-modal').classList.remove('flex');
    }

    function runTroubleshootNodeTest() {
      const meta = canvasNodeMetadata[currentTroubleshootNodeKey];
      if (meta && meta.tampilanPopup === 'layanan') {
        const badge = document.getElementById('ts-service-status-badge');
        if (badge) {
          badge.textContent = "Menguji koneksi...";
          badge.className = "px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10.5px] animate-pulse";
        }
        setTimeout(() => {
          if (badge) {
            badge.textContent = "Terhubung (1.120 ms)";
            badge.className = "px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10.5px]";
          }
          document.getElementById('ts-modal-status').textContent = "Berhasil (200 OK)";
          document.getElementById('ts-modal-meta').textContent = "Durasi: 1.120 ms • Status: Terhubung";
          showToast('Uji koneksi layanan berhasil!', 'success');
        }, 800);
        return;
      }
      showToast('Uji jalankan node berhasil (200 OK).', 'success');
    }

    function deleteCurrentTroubleshootNode() {
      const nodeKey = currentTroubleshootNodeKey;
      const meta = nodeKey ? canvasNodeMetadata[nodeKey] : null;
      if (meta && meta.isCustom && typeof removeCustomCanvasNode === 'function') {
        removeCustomCanvasNode(nodeKey);
        closeNodeTroubleshootModal();
        showToast('Node kustom berhasil dihapus dari canvas.', 'success');
        return;
      }
      showToast('Node inti workflow tidak dapat dihapus dari prototype ini.', 'info');
    }

    function openEditModeForTroubleshootNode() {
      const nodeKey = currentTroubleshootNodeKey;
      const meta = canvasNodeMetadata[nodeKey];
      closeNodeTroubleshootModal();
      if (!meta) return;

      state.modalMode = 'edit';
      state.editingNodeKey = nodeKey;
      state.currentModalActionKey = meta.actionKey;

      const t = nodeTypes[meta.actionKey] || nodeTypes['ai-agent'];
      
      // Header synchronization
      document.getElementById('modal-title').textContent = `Edit Node: ${meta.title}`;
      document.getElementById('modal-icon-box').innerHTML = t.iconSvg;
      document.getElementById('modal-icon-box').className = `w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${t.iconBoxClass}`;
      
      const badge = document.getElementById('modal-badge');
      badge.textContent = t.badge;
      badge.className = `px-2 py-0.5 rounded-md text-[11px] font-bold border ${t.badgeClass}`;
      
      document.getElementById('modal-code-filename').textContent = t.filename;
      document.getElementById('modal-code-lang-pill').textContent = t.lang;
      document.getElementById('modal-code-textarea').value = meta.code || t.templateCode;
      document.getElementById('modal-node-name-input').value = meta.title;

      // Test button synchronization
      document.getElementById('modal-test-btn-label').textContent = t.testButtonLabel;
      document.getElementById('modal-test-metrics').textContent = "Status: Belum diuji";
      document.getElementById('modal-test-output-box').classList.add('hidden');

      // In Edit Mode, hide active port status notification and render read-only connection list
      document.getElementById('modal-port-status-container').classList.add('hidden');
      const portControlWrapper = document.getElementById('modal-port-control-wrapper');
      portControlWrapper.innerHTML = `
        <label class="block text-[11.5px] font-bold text-navy mb-1">Terhubung ke (Koneksi Nyata):</label>
        <div class="w-full rounded-xl bg-cream-canvas border border-warm-border px-3 py-2 text-[12.5px] font-medium text-navy">
          ${meta.connectedText}
        </div>
      `;

      renderDynamicParamsBar(meta.actionKey);
      syncCodeLineNumbers();

      document.getElementById('modal-save-cta-label').textContent = "Simpan Perubahan";
      document.getElementById('modal-footer-left-actions').innerHTML = `
        <button type="button" onclick="deleteNodeFromEditModal('${nodeKey}')" class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[12px] border border-rose-200 transition-colors">
          Hapus Node
        </button>
      `;

      document.getElementById('node-code-modal').classList.remove('hidden');
      document.getElementById('node-code-modal').classList.add('flex');
    }

    function deleteNodeFromEditModal(nodeKey) {
      const meta = canvasNodeMetadata[nodeKey];
      if (meta && meta.isCustom && typeof removeCustomCanvasNode === 'function') {
        removeCustomCanvasNode(nodeKey);
        closeNodeCodeModal();
        showToast('Node kustom berhasil dihapus.', 'success');
        return;
      }
      showToast('Node inti workflow tidak dapat dihapus dari prototype ini.', 'info');
    }

    function selectExistingNodeByMetadata(meta) {
      document.getElementById('inspector-node-title').textContent = meta.title;
      const b = document.getElementById('inspector-badge');
      if (b) {
        b.textContent = meta.badge;
        b.className = `px-2 py-0.5 rounded-md text-[10.5px] font-bold shrink-0 border ${meta.badgeClass}`;
      }
      document.getElementById('terminal-input-pre').textContent = meta.inputJson;
      document.getElementById('terminal-output-pre').textContent = meta.outputJson;
    }

    function renderDynamicParamsBar(actionKey) {
      const container = document.getElementById('modal-dynamic-params');
      if (!container) return;

      if (actionKey === 'ai-agent') {
        container.innerHTML = `
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Pilih Model LLM</label>
            <select class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy">
              <option selected>Claude 3.5 Sonnet (Anthropic)</option>
              <option>GPT-4o mini (OpenAI)</option>
              <option>Gemini 1.5 Pro (Google)</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Temperature (Kreativitas)</label>
            <input type="text" value="0.2" class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy" />
          </div>
        `;
        container.classList.remove('hidden');
      } else if (actionKey === 'app-marketplace') {
        container.innerHTML = `
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Platform / Marketplace</label>
            <select class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy">
              <option selected>Shopee Official Store</option>
              <option>Tokopedia Mall</option>
              <option>TikTok Shop</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Aksi Webhook</label>
            <input type="text" value="Update Status & Kirim Resi" class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy" />
          </div>
        `;
        container.classList.remove('hidden');
      } else if (actionKey === 'gudang-stok') {
        container.innerHTML = `
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Target Tabel / Modul</label>
            <select class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy">
              <option selected>inventory_batches (Stok DB Utama)</option>
              <option>marketplace_sync_logs</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Jenis Aksi SQL</label>
            <input type="text" value="Cek & Update FIFO Batch" class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy" />
          </div>
        `;
        container.classList.remove('hidden');
      } else if (actionKey === 'logic-branch') {
        container.innerHTML = `
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Kondisi Evaluasi</label>
            <select class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy">
              <option selected>Stok Tersedia &gt;= Jumlah Pesanan</option>
              <option>Total Nominal &gt; Rp 500.000</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Operator Logika</label>
            <input type="text" value=">= (Greater than or equal)" class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy" />
          </div>
        `;
        container.classList.remove('hidden');
      } else if (actionKey === 'hitl-approval') {
        container.innerHTML = `
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Kanal Notifikasi Admin</label>
            <select class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy">
              <option selected>WhatsApp Group Owner & Admin</option>
              <option>Telegram Bot Gudang</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Batas Timeout</label>
            <input type="text" value="24 Jam (Auto-Decline if expired)" class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy" />
          </div>
        `;
        container.classList.remove('hidden');
      } else {
        container.innerHTML = `
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Jenis Pemicu (Trigger)</label>
            <select class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy">
              <option selected>Cron Schedule (Berkala)</option>
              <option>Webhook Masuk (Realtime)</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-navy mb-1">Ekspresi / Sumber</label>
            <input type="text" value="0 */2 * * * (Setiap 2 Jam)" class="w-full rounded-lg bg-white border border-warm-border px-2.5 py-1.5 text-[12px] font-medium text-navy" />
          </div>
        `;
        container.classList.remove('hidden');
      }
    }

    function openNodeCodeModal(actionKey) {
      state.modalMode = 'add';
      state.editingNodeKey = null;
      state.currentModalActionKey = actionKey;

      const t = nodeTypes[actionKey] || nodeTypes['ai-agent'];
      
      // Header Synchronization
      document.getElementById('modal-title').textContent = `Konfigurasi Kode: ${t.title}`;
      document.getElementById('modal-icon-box').innerHTML = t.iconSvg;
      document.getElementById('modal-icon-box').className = `w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${t.iconBoxClass}`;
      
      const badge = document.getElementById('modal-badge');
      badge.textContent = t.badge;
      badge.className = `px-2 py-0.5 rounded-md text-[11px] font-bold border ${t.badgeClass}`;
      
      document.getElementById('modal-code-filename').textContent = t.filename;
      document.getElementById('modal-code-lang-pill').textContent = t.lang;
      document.getElementById('modal-code-textarea').value = t.templateCode;
      document.getElementById('modal-node-name-input').value = t.title;

      // Test button synchronization
      document.getElementById('modal-test-btn-label').textContent = t.testButtonLabel;
      document.getElementById('modal-test-metrics').textContent = "Status: Belum diuji";
      document.getElementById('modal-test-output-box').classList.add('hidden');

      // Port Status & Dropdown Synchronization
      const portStatusContainer = document.getElementById('modal-port-status-container');
      const portControlWrapper = document.getElementById('modal-port-control-wrapper');

      if (!t.hasInputPort) {
        portStatusContainer.classList.add('hidden');
        portControlWrapper.innerHTML = `
          <div class="text-[11.5px] font-semibold text-navy-muted pt-5">
            ℹ️ Node pemicu (trigger) tidak memerlukan input port. Node ini bertindak sebagai titik awal (start) alur workflow.
          </div>
        `;
      } else {
        portStatusContainer.classList.remove('hidden');
        document.getElementById('modal-target-port-label').textContent = t.defaultPort;

        portControlWrapper.innerHTML = `
          <label for="modal-port-select" class="block text-[11.5px] font-bold text-navy mb-1">Sambungkan ke Port Aktif</label>
          <select
            id="modal-port-select"
            onchange="document.getElementById('modal-target-port-label').textContent = this.value"
            class="w-full rounded-xl bg-cream-canvas/60 border border-warm-border px-3 py-2 text-[13px] font-medium text-navy focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage"
          >
            <option value="${t.defaultPort}">${t.defaultPort}</option>
            <option value="AI Asisten (NLP Extractor) → Output">AI Asisten (NLP Extractor) → Output</option>
            <option value="Pesan WA Masuk → Inbound Trigger">Pesan WA Masuk → Inbound Trigger</option>
            <option value="Pesanan Marketplace → Auto-Sync">Pesanan Marketplace → Auto-Sync</option>
          </select>
        `;
      }

      renderDynamicParamsBar(actionKey);
      syncCodeLineNumbers();

      // Footer setup for Add Mode
      document.getElementById('modal-save-cta-label').textContent = "Simpan & Tambahkan Node ke Canvas";
      document.getElementById('modal-footer-left-actions').innerHTML = '';

      document.getElementById('node-code-modal').classList.remove('hidden');
      document.getElementById('node-code-modal').classList.add('flex');
    }

    function openSelectedInspectorCode() {
      openNodeCodeModal('ai-agent');
    }

    // Fixed: Define selectExistingNode to prevent ReferenceError when clicking workflow nodes on canvas
    function selectExistingNode(nodeKey) {
      // Find metadata for this node key if available, or fallback to default
      const meta = canvasNodeMetadata[nodeKey];
      if (meta) {
        selectExistingNodeByMetadata(meta);
      }
    }

    function closeNodeCodeModal() {
      document.getElementById('node-code-modal').classList.add('hidden');
      document.getElementById('node-code-modal').classList.remove('flex');
    }

    function resetModalCodeTemplate() {
      const t = nodeTypes[state.currentModalActionKey] || nodeTypes['ai-agent'];
      document.getElementById('modal-code-textarea').value = t.templateCode;
      syncCodeLineNumbers();
      showToast('Template kode dikembalikan ke pengaturan awal.', 'info');
    }

    function copyModalCode() {
      const ta = document.getElementById('modal-code-textarea');
      if (ta) {
        navigator.clipboard.writeText(ta.value).then(() => {
          showToast('Kode berhasil disalin ke clipboard!', 'success');
        });
      }
    }

    function syncCodeLineNumbers() {
      const ta = document.getElementById('modal-code-textarea');
      const linesContainer = document.getElementById('modal-line-numbers');
      if (!ta || !linesContainer) return;
      const lineCount = ta.value.split('\n').length;
      let html = '';
      for (let i = 1; i <= Math.max(6, lineCount); i++) {
        html += i + '<br>';
      }
      linesContainer.innerHTML = html;
    }

    function runModalCodeTest() {
      const metrics = document.getElementById('modal-test-metrics');
      const outBox = document.getElementById('modal-test-output-box');
      if (metrics) metrics.textContent = "Status: Menguji...";
      
      setTimeout(() => {
        if (metrics) metrics.textContent = "Status: Uji berhasil";
        if (outBox) {
          outBox.classList.remove('hidden');
          document.getElementById('modal-test-output-pre').textContent = "{\n  \"status\": \"SUCCESS\",\n  \"execution_time_ms\": 840,\n  \"validated\": true\n}";
        }
        showToast('Uji jalankan kode berhasil!', 'success');
      }, 700);
    }

    function getCanvasConnectionSource(portLabel) {
      const label = String(portLabel || '').toLowerCase();
      if (label.includes('pesanan marketplace')) return { key: 'mp-trigger', title: 'Pesanan Marketplace', x: 226, y: 70, color: '#5832DC' };
      if (label.includes('pesan wa')) return { key: 'wa-trigger', title: 'Pesan WA Masuk', x: 226, y: 186, color: '#059669' };
      if (label.includes('ai asisten')) return { key: 'ai-nlp', title: 'AI Asisten', x: 540, y: 204, color: '#7A52F8' };
      if (label.includes('cek kondisi stok')) return { key: 'cek-stok', title: 'Cek Kondisi Stok', x: 816, y: 186, color: '#D97706' };
      if (label.includes('draf pesan maaf')) return { key: 'draf-maaf', title: 'Draf Pesan Maaf', x: 1064, y: 258, color: '#E11D48' };
      return { key: 'ai-nlp', title: 'AI Asisten', x: 540, y: 204, color: '#7A52F8' };
    }

    function getNodeCardColors(actionKey) {
      const colors = {
        'ai-agent': { border: 'border-purple-300', icon: 'bg-purple-50 text-purple-700 border-purple-200', dot: '#7A52F8' },
        'app-marketplace': { border: 'border-sky-300', icon: 'bg-sky-50 text-sky-700 border-sky-200', dot: '#5832DC' },
        'gudang-stok': { border: 'border-blue-300', icon: 'bg-blue-50 text-blue-700 border-blue-200', dot: '#7A52F8' },
        'logic-branch': { border: 'border-amber-300', icon: 'bg-amber-50 text-amber-700 border-amber-200', dot: '#D97706' },
        'hitl-approval': { border: 'border-emerald-300', icon: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#059669' },
        'new-trigger': { border: 'border-yellow-300', icon: 'bg-yellow-50 text-amber-700 border-yellow-200', dot: '#D97706' }
      };
      return colors[actionKey] || colors['ai-agent'];
    }

    function renderCustomNodesOnCanvas() {
      const layer = document.getElementById('dynamic-nodes-layer');
      const svg = document.getElementById('canvas-svg-wires');
      const wireLayer = document.getElementById('dynamic-node-wires-layer');
      const wrapper = document.getElementById('canvas-zoom-wrapper');
      const stage = document.getElementById('canvas-zoom-stage');
      if (!layer || !svg || !wrapper || !stage) return;

      const baseWidth = 1080;
      const baseHeight = 440;
      const nodeWidth = 210;
      const nodeHeight = 92;
      const lefts = [16, 282, 548, 814];
      const firstTop = 472;
      const rowGap = 142;

      state.customNodes.forEach((node, index) => {
        node.x = lefts[index % lefts.length];
        node.y = firstTop + Math.floor(index / lefts.length) * rowGap;
      });

      const requiredHeight = state.customNodes.length
        ? Math.max(baseHeight, ...state.customNodes.map(node => node.y + nodeHeight + 28))
        : baseHeight;
      wrapper.style.width = `${baseWidth}px`;
      wrapper.style.height = `${requiredHeight}px`;
      stage.style.width = `${baseWidth}px`;
      stage.style.height = `${requiredHeight}px`;
      svg.setAttribute('viewBox', `0 0 ${baseWidth} ${requiredHeight}`);

      layer.innerHTML = state.customNodes.map(node => {
        const type = nodeTypes[node.actionKey] || nodeTypes['ai-agent'];
        const palette = getNodeCardColors(node.actionKey);
        return `<div id="wf-node-${node.key}" data-custom-node="true" data-node-key="${node.key}" onclick="openNodeTroubleshootModal('${node.key}')" title="Klik untuk melihat konfigurasi node" class="wf-node-card absolute rounded-xl bg-white border ${palette.border} p-3 shadow-xs hover:shadow-md cursor-pointer transition-all z-10 flex flex-col justify-between" style="left:${node.x}px;top:${node.y}px;width:${nodeWidth}px;height:${nodeHeight}px;">
          ${node.connection ? `<div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs" style="background:${palette.dot}" title="Input dari ${escapeHtmlForAttribute(node.connection.title)}"></div>` : ''}
          <div class="flex items-center gap-2.5 min-w-0"><div class="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${palette.icon}">${type.iconSvg}</div><div class="min-w-0 flex-1"><div class="font-jakarta text-[12.5px] font-bold text-navy leading-tight break-words">${escapeHtmlForAttribute(node.title)}</div><div class="text-[10px] text-navy-muted truncate mt-0.5">${escapeHtmlForAttribute(type.filename)}</div></div></div>
          <div class="flex items-center justify-between text-[10px] pt-1.5 border-t border-warm-border"><span class="text-navy-muted">Node Kustom</span><span class="px-1.5 py-0.5 rounded font-bold ${type.badgeClass}">${escapeHtmlForAttribute(type.badge)}</span></div>
        </div>`;
      }).join('');

      if (wireLayer) {
        wireLayer.innerHTML = state.customNodes.filter(node => node.connection).map(node => {
          const source = node.connection;
          const x1 = source.x;
          const y1 = source.y;
          const x2 = node.x;
          const y2 = node.y + nodeHeight / 2;
          const curve = Math.max(45, Math.abs(y2 - y1) * 0.42);
          const path = `M ${x1} ${y1} C ${x1} ${y1 + curve}, ${x2 - 70} ${y2 - curve}, ${x2} ${y2}`;
          return `<path d="${path}" fill="none" stroke="${source.color}" stroke-width="2.5" stroke-linecap="round" opacity="0.9"></path><path d="${path}" fill="none" stroke="#FFFFFF" stroke-dasharray="6 7" stroke-width="1.6" stroke-linecap="round" class="wire-animated" opacity="0.9"></path><circle cx="${x1}" cy="${y1}" r="3.5" fill="${source.color}"></circle>`;
        }).join('');
      }

      const countBadge = document.getElementById('canvas-node-count-badge');
      if (countBadge) countBadge.textContent = `${8 + state.customNodes.length} Nodes Aktif`;
    }

    function escapeHtmlForAttribute(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    }

    function openAddedCanvasNode(nodeKey) {
      const meta = canvasNodeMetadata[nodeKey];
      if (!meta) return;
      openNodeTroubleshootModal(nodeKey);
    }

    function removeCustomCanvasNode(nodeKey) {
      const index = state.customNodes.findIndex(node => node.key === nodeKey);
      if (index < 0) return false;
      state.customNodes.splice(index, 1);
      delete canvasNodeMetadata[nodeKey];
      renderCustomNodesOnCanvas();
      return true;
    }

    function saveAndAddNodeToCanvas() {
      const nameInput = document.getElementById('modal-node-name-input');
      const nodeName = (nameInput ? nameInput.value : 'Node Baru').trim() || 'Node Baru';
      const code = document.getElementById('modal-code-textarea')?.value || '';

      if (state.modalMode === 'edit') {
        const nodeKey = state.editingNodeKey;
        const meta = nodeKey ? canvasNodeMetadata[nodeKey] : null;
        if (meta && meta.isCustom) {
          const node = state.customNodes.find(item => item.key === nodeKey);
          if (node) {
            node.title = nodeName;
            node.code = code;
            meta.title = nodeName;
            meta.code = code;
            meta.outputJson = JSON.stringify({ configured: true, code_saved: true }, null, 2);
            renderCustomNodesOnCanvas();
            selectExistingNodeByMetadata(meta);
          }
        }
        showToast(`Perubahan pada node "${nodeName}" berhasil disimpan!`, 'success');
        closeNodeCodeModal();
        return;
      }

      const actionKey = state.currentModalActionKey;
      const type = nodeTypes[actionKey];
      if (!type) {
        showToast('Jenis node tidak ditemukan. Pilih kembali node yang ingin ditambahkan.', 'error');
        return;
      }

      const portSelect = document.getElementById('modal-port-select');
      const selectedPort = type.hasInputPort ? (portSelect?.value || type.defaultPort || '') : '';
      const connection = type.hasInputPort && selectedPort ? getCanvasConnectionSource(selectedPort) : null;
      const nodeKey = `custom-node-${Date.now()}-${state.customNodes.length + 1}`;
      const now = state.customNodes.length;
      const node = {
        key: nodeKey,
        title: nodeName,
        actionKey,
        code,
        connection,
        connectionLabel: selectedPort,
        x: 16,
        y: 472 + Math.floor(now / 4) * 142
      };
      state.customNodes.push(node);

      canvasNodeMetadata[nodeKey] = {
        key: nodeKey,
        title: nodeName,
        actionKey,
        isCustom: true,
        tampilanPopup: 'alur',
        badge: type.badge,
        badgeClass: type.badgeClass,
        inputs: connection ? [{ source: connection.title, port: selectedPort, desc: 'Koneksi ke port aktif workflow' }] : [],
        outputs: [],
        inputJson: JSON.stringify({ connected_from: connection ? connection.title : null, active_port: selectedPort || null }, null, 2),
        outputJson: JSON.stringify({ node: nodeName, action: actionKey, configured: true }, null, 2),
        advice: `Node kustom ${nodeName} berhasil ditambahkan ke workflow.`,
        connectedText: connection ? `${connection.title} (${selectedPort})` : 'Belum tersambung ke node lain.',
        code
      };

      renderCustomNodesOnCanvas();
      selectExistingNodeByMetadata(canvasNodeMetadata[nodeKey]);
      closeNodeCodeModal();
      showToast(`Node "${nodeName}" berhasil ditambahkan dan ${connection ? `terhubung ke ${connection.title}` : 'ditambahkan sebagai pemicu baru'}.`, 'success');

      // Scroll canvas to the added node so the user can immediately see it.
      const viewport = document.getElementById('canvas-scroll-viewport');
      if (viewport) {
        const zoom = typeof canvasZoomLevel !== 'undefined' ? canvasZoomLevel : 0.72;
        viewport.scrollTop = Math.max(0, node.y * zoom - viewport.clientHeight * 0.45);
        viewport.scrollLeft = Math.max(0, node.x * zoom - 24);
      }
    }

    // Ensure any nodes already present in the in-memory canvas state are drawn.
    renderCustomNodesOnCanvas();

    // =========================================================================
    // UNIFIED STATE LOGIC FOR 14 SKUS, KPIS, AND STORE SYNC MODAL
    // =========================================================================
    function getDiscrepantRows() {
      return state.opnameRows.filter(r => r.fisik !== r.db);
    }

    function getPendingSyncCount() {
      let count = 0;
      state.opnameRows.forEach(r => {
        Object.values(r.storesData).forEach(st => {
          if (st.stock !== r.db || st.status === 'queued' || st.status === 'syncing' || st.status === 'fail') {
            count++;
          }
        });
      });
      return count;
    }

    function isBatchOld(expDateStr) {
      const exp = new Date(expDateStr);
      const now = new Date("2026-11-15");
      const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }

    function renderAllOpnameViews() {
      renderMarketplaceCards();
      renderKpiAndBanners();
      renderFifoWatcherQueue();
      renderOpnameTable();
      renderActivityFeed();
    }

    function renderMarketplaceCards() {
      const container = document.getElementById('marketplace-cards-container');
      if (!container) return;

      const stores = [
        { name: "Shopee Official", code: "S" },
        { name: "Tokopedia Mall", code: "T" },
        { name: "TikTok Shop", code: "TT" }
      ];

      container.innerHTML = stores.map(store => {
        let hasDiscrepancy = false;
        let hasQueuedOrDiff = false;
        let hasFail = false;
        let hasSyncing = false;
        let discrepantCountForStore = 0;
        let skuCountForStore = 0;

        state.opnameRows.forEach(r => {
          const st = r.storesData[store.name];
          if (st) skuCountForStore++;
          if (r.fisik !== r.db) {
            hasDiscrepancy = true;
            discrepantCountForStore++;
          }
          if (st) {
            if (st.stock !== r.db || st.status === 'queued') hasQueuedOrDiff = true;
            if (st.status === 'syncing') hasSyncing = true;
            if (st.status === 'fail') hasFail = true;
          }
        });

        let dotColor = "bg-emerald-500";
        let subText = "Realtime Sync";
        let cardBgClass = "hover:bg-cream-canvas/50";

        if (state.activeStoreFilter === store.name) {
          cardBgClass = "bg-sage-soft/60 border-sage ring-2 ring-sage/30";
        }

        if (hasFail) {
          dotColor = "bg-rose-500";
          subText = "Gagal sync";
        } else if (hasSyncing) {
          dotColor = "bg-blue-500 animate-pulse";
          subText = "Menyinkronkan...";
        } else if (hasDiscrepancy) {
          dotColor = "bg-amber-400";
          subText = `${discrepantCountForStore} SKU belum sesuai, opname`;
        } else if (hasQueuedOrDiff) {
          dotColor = "bg-orange-500";
          subText = "Menunggu sync";
        }

        return `
          <div onclick="openMarketplaceSkuModal('${store.name}')" title="Klik untuk lihat produk yang dijual di ${store.name}" class="bg-white p-3.5 rounded-xl border border-warm-border flex items-center justify-between cursor-pointer ${cardBgClass} transition-all shadow-2xs">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold text-xs shrink-0">${store.code}</div>
              <div class="min-w-0">
                <div class="font-jakarta font-bold text-[13px] text-navy truncate">${store.name}</div>
                <div class="text-[11px] text-navy-muted truncate mt-0.5">${skuCountForStore} SKU • ${subText}</div>
              </div>
            </div>
            <span class="w-2.5 h-2.5 rounded-full ${dotColor} shrink-0"></span>
          </div>
        `;
      }).join('');
    }

    // Ringkasan hasil opname terakhir dipertahankan setelah stok DB disesuaikan.
    let lastCompletedOpnameSummary = null;

    function calculateStockAccuracy(rows = state.opnameRows) {
      const totalStockDB = rows.reduce((t, r) => t + Math.max(0, Number(r.db) || 0), 0);
      const totalDifference = rows.reduce((t, r) => t + Math.abs((Number(r.fisik) || 0) - (Number(r.db) || 0)), 0);
      const accuracy = totalStockDB > 0 ? Math.max(0, Math.min(100, (1 - totalDifference / totalStockDB) * 100)) : 100;
      return { accuracy, totalDifference, totalStockDB, checkedSku: rows.length };
    }

    function renderKpiAndBanners() {
      const totalSku = state.opnameRows.length;
      const discrepant = getDiscrepantRows();
      const lowStockCount = state.opnameRows.filter(r => r.db < 5).length;
      const oldBatchCount = state.opnameRows.filter(r => isBatchOld(r.expDate)).length;

      document.getElementById('kpi-total-sku').textContent = totalSku;
      document.getElementById('kpi-low-stock-count').textContent = `${lowStockCount} SKU`;
      const expEl = document.getElementById('kpi-expiry-count'); if (expEl) expEl.textContent = `${oldBatchCount} Batch`;
      const allTab = document.getElementById('qtab-all'); if (allTab) allTab.textContent = `Semua (${totalSku})`;

      const currentAcc = calculateStockAccuracy();
      const acc = state.fastOpnameActive ? currentAcc : (lastCompletedOpnameSummary || currentAcc);
      const accEl = document.getElementById('kpi-accuracy'), accBar = document.getElementById('kpi-accuracy-progress');
      const accStatus = document.getElementById('kpi-accuracy-status'), discEl = document.getElementById('kpi-discrepancy-label');
      const tone = acc.accuracy >= 95 ? ['text-emerald-700', 'bg-emerald-500'] : acc.accuracy >= 85 ? ['text-amber-700', 'bg-amber-500'] : ['text-rose-600', 'bg-rose-500'];
      if (accEl) { accEl.textContent = acc.accuracy.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'; accEl.className = 'font-jakarta text-[22px] font-extrabold ' + tone[0]; }
      if (accBar) { accBar.style.width = acc.accuracy + '%'; accBar.className = 'h-1.5 rounded-full transition-all duration-500 ' + tone[1]; }
      if (accStatus) {
        if (state.fastOpnameActive) { accStatus.textContent = '● Live Opname'; accStatus.className = 'text-[10px] font-bold text-blue-600'; }
        else if (lastCompletedOpnameSummary) { accStatus.textContent = '● Opname Terakhir'; accStatus.className = 'text-[10px] font-bold text-emerald-700'; }
        else { accStatus.textContent = '● Akurasi Saat Ini'; accStatus.className = 'text-[10px] font-bold text-emerald-700'; }
      }
      if (discEl) discEl.textContent = (state.fastOpnameActive ? 'Selisih sementara ' : (lastCompletedOpnameSummary ? 'Selisih saat opname ' : 'Selisih ')) + acc.totalDifference + ' pcs';

      const unsyncedCount = state.opnameRows.filter(r => {
        return Object.values(r.storesData).some(st => st.stock !== r.db || st.status !== 'sync');
      }).length;

      document.getElementById('qcount-disc').textContent = discrepant.length;
      document.getElementById('qcount-unsync').textContent = unsyncedCount;
      document.getElementById('qcount-low').textContent = lowStockCount;
      document.getElementById('qcount-old').textContent = oldBatchCount;

      const banner = document.getElementById('opname-filter-banner');
      const bannerText = document.getElementById('opname-filter-banner-text');
      if (banner && bannerText) {
        if (discrepant.length > 0 && !state.activeStoreFilter) {
          banner.classList.remove('hidden');
          banner.classList.add('flex');
          bannerText.textContent = `Ada ${discrepant.length} SKU dengan selisih belum disesuaikan. Mulai Opname Cepat?`;
        } else {
          banner.classList.add('hidden');
          banner.classList.remove('flex');
        }
      }

      const chip = document.getElementById('opname-active-filter-chip');
      const chipText = document.getElementById('opname-filter-chip-text');
      if (chip && chipText) {
        if (state.activeStoreFilter) {
          chip.classList.remove('hidden');
          chip.classList.add('flex');
          chipText.textContent = state.activeStoreFilter;
        } else {
          chip.classList.add('hidden');
          chip.classList.remove('flex');
        }
      }

      const toggleBtn = document.getElementById('btn-fast-opname-toggle');
      const pendingNote = document.getElementById('opname-pending-sync-note');
      const pendingSyncs = getPendingSyncCount();

      if (toggleBtn) {
        if (state.fastOpnameActive) {
          toggleBtn.textContent = `Selesai & Simpan Opname (${discrepant.length} selisih)`;
          toggleBtn.className = "px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-2xs transition-colors";
        } else {
          toggleBtn.textContent = discrepant.length === 0 && pendingSyncs === 0 ? "Selesai Opname" : "Mulai Opname Cepat";
          toggleBtn.className = "px-3.5 py-1.5 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold text-[12px] shadow-2xs transition-colors";
        }
      }

      if (pendingNote) {
        if (discrepant.length === 0 && pendingSyncs > 0) {
          pendingNote.textContent = `${pendingSyncs} toko masih menunggu sinkron.`;
          pendingNote.classList.remove('hidden');
        } else {
          pendingNote.classList.add('hidden');
        }
      }
    }

    function renderFifoWatcherQueue() {
      const container = document.getElementById('fifo-watcher-queue-container');
      if (!container) return;

      const sorted = [...state.opnameRows].sort((a, b) => new Date(a.expDate) - new Date(b.expDate)).slice(0, 3);

      container.innerHTML = sorted.map(item => `
        <div class="p-2 rounded-xl bg-cream-canvas border border-warm-border flex items-center justify-between text-[11.5px]">
          <span class="font-mono-code font-bold text-navy truncate">${item.batch} (${item.name.split(' ')[0]})</span>
          <span class="font-bold text-amber-700 shrink-0">${item.db} pcs</span>
        </div>
      `).join('');
    }

    function setQuickTab(tab) {
      state.activeQuickTab = tab;
      ['all', 'discrepancy', 'unsynced', 'lowstock', 'oldbatch'].forEach(t => {
        const btn = document.getElementById(`qtab-${t}`);
        if (btn) {
          if (t === tab) {
            btn.className = "px-2.5 py-1 rounded-lg bg-navy text-white font-bold transition-colors whitespace-nowrap";
          } else {
            btn.className = "px-2.5 py-1 rounded-lg bg-cream-canvas text-navy-muted hover:text-navy font-semibold transition-colors whitespace-nowrap";
          }
        }
      });
      renderOpnameTable();
    }

    function filterByStoreCard(storeName) {
      if (state.activeStoreFilter === storeName) {
        state.activeStoreFilter = null;
        showToast('Filter toko dibatalkan.', 'info');
      } else {
        state.activeStoreFilter = storeName;
        showToast(`Memfilter tabel ke SKU bermasalah pada ${storeName}.`, 'info');
      }
      renderAllOpnameViews();
    }

    function clearOpnameFilter() {
      state.activeStoreFilter = null;
      renderAllOpnameViews();
      showToast('Filter toko dilepas, menampilkan seluruh SKU.', 'info');
    }

    function toggleFastOpnameMode() {
      if (!state.fastOpnameActive) {
        state.fastOpnameActive = true;
        state.opnameSession = {
          aktif: true,
          mulaiPada: Date.now(),
          pelaku: currentUser.name,
          perubahan: []
        };
        pushActivityFeed('opname', `${currentUser.name} memulai opname cepat.`);
        showToast('Mode Opname Cepat aktif.', 'success');
      } else {
        const discrepant = getDiscrepantRows();
        
        if (discrepant.length === 0) {
          lastCompletedOpnameSummary = calculateStockAccuracy();
          pushActivityFeed('opname', `${currentUser.name} menyelesaikan opname: semua stok sesuai.`);
          state.fastOpnameActive = false;
          state.opnameSession.aktif = false;
          renderAllOpnameViews();
          showToast('Opname selesai: semua stok sesuai.', 'success');
          return;
        }

        let plusCount = 0;
        let minusCount = 0;
        let skuListArray = [];
        let totalPlusSum = 0;
        let totalMinusSum = 0;

        discrepant.forEach(r => {
          const diff = r.fisik - r.db;
          skuListArray.push(r.code);
          if (diff > 0) {
            plusCount++;
            totalPlusSum += diff;
          } else {
            minusCount++;
            totalMinusSum += Math.abs(diff);
          }
        });

        let summaryTextParts = [];
        if (plusCount > 0) summaryTextParts.push(`+${totalPlusSum} pcs`);
        if (minusCount > 0) summaryTextParts.push(`-${totalMinusSum} pcs`);

        const summaryText = `${currentUser.name} menyelesaikan opname: ${discrepant.length} SKU disesuaikan (${summaryTextParts.join(', ')}).`;
        
        lastCompletedOpnameSummary = calculateStockAccuracy(); // simpan akurasi sebelum DB disamakan dengan fisik
        pushActivityFeed('opname', summaryText, null, { skuList: skuListArray });

        discrepant.forEach(r => {
          applyAdjustment(r.id, { dariSesi: true });
        });

        state.fastOpnameActive = false;
        state.opnameSession.aktif = false;

        triggerBatchedSync(discrepant);
      }
      renderAllOpnameViews();
    }

    function triggerBatchedSync(discrepantRows) {
      const totalSkus = discrepantRows.length;
      pushActivityFeed('sync', `Sistem natahub mengirim stok ${totalSkus} SKU ke 3 toko.`);

      discrepantRows.forEach(r => {
        Object.keys(r.storesData).forEach(sKey => {
          r.storesData[sKey].status = 'syncing';
        });
      });
      renderAllOpnameViews();

      discrepantRows.forEach((row, idx) => {
        setTimeout(() => {
          Object.keys(row.storesData).forEach(sKey => {
            row.storesData[sKey].stock = row.db;
            row.storesData[sKey].status = 'sync';
            row.storesData[sKey].timestamp = Date.now();
          });
          renderAllOpnameViews();

          if (idx === totalSkus - 1) {
            pushActivityFeed('sync', `Sistem natahub: ${totalSkus} SKU tersinkron ke semua toko.`);
            showToast('Seluruh SKU berhasil disesuaikan & disinkronkan ke seluruh toko!', 'success');
          }
        }, (idx + 1) * 350);
      });
    }

    function applyAdjustment(rowId, options = { dariSesi: false }) {
      const row = state.opnameRows.find(r => r.id === rowId);
      if (!row) return;
      const skuClean = row.code;
      const selisih = row.fisik - row.db;

      row.db = row.fisik;

      if (!options.dariSesi) {
        pushActivityFeed('opname', `${currentUser.name} menyesuaikan ${skuClean} (${selisih > 0 ? '+' + selisih : selisih} pcs).`, skuClean);
        triggerAutomaticSyncForRow(rowId);
      }
      renderAllOpnameViews();
    }

    function triggerAutomaticSyncForRow(rowId) {
      const row = state.opnameRows.find(r => r.id === rowId);
      if (!row) return;
      const skuClean = row.code;
      pushActivityFeed('sync', `Sistem natahub mengirim stok ${skuClean} ke 3 toko.`);

      Object.keys(row.storesData).forEach(sKey => {
        row.storesData[sKey].status = 'syncing';
      });
      renderAllOpnameViews();

      setTimeout(() => {
        Object.keys(row.storesData).forEach(sKey => {
          row.storesData[sKey].stock = row.db;
          row.storesData[sKey].status = 'sync';
          row.storesData[sKey].timestamp = Date.now();
        });
        pushActivityFeed('sync', `Sistem natahub: ${skuClean} tersinkron ke semua toko.`, skuClean);
        renderAllOpnameViews();
        showToast(`Stok baru (${row.db} pcs) berhasil disinkronkan ke seluruh toko!`, 'success');
        
        if (document.getElementById('store-sync-modal').classList.contains('flex') && state.activeSyncModalRowId === rowId) {
          renderStoreSyncModalList();
        }
      }, 1000);
    }

    function renderOpnameTable() {
      const tbody = document.getElementById('opname-table-body');
      if (!tbody) return;
      const searchInput = document.getElementById('opname-search-input');
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

      let rowsToDisplay = [...state.opnameRows];

      rowsToDisplay.sort((a, b) => {
        const aDisc = Math.abs(a.fisik - a.db) > 0 ? 1 : 0;
        const bDisc = Math.abs(b.fisik - b.db) > 0 ? 1 : 0;
        if (aDisc !== bDisc) return bDisc - aDisc;

        const aUnsync = Object.values(a.storesData).some(st => st.status !== 'sync' || st.stock !== a.db) ? 1 : 0;
        const bUnsync = Object.values(b.storesData).some(st => st.status !== 'sync' || st.stock !== b.db) ? 1 : 0;
        return bUnsync - aUnsync;
      });

      if (state.activeStoreFilter) {
        rowsToDisplay = rowsToDisplay.filter(r => {
          const st = r.storesData[state.activeStoreFilter];
          return r.fisik !== r.db || (st && (st.stock !== r.db || st.status !== 'sync'));
        });
      }

      if (state.activeQuickTab === 'discrepancy') {
        rowsToDisplay = rowsToDisplay.filter(r => r.fisik !== r.db);
      } else if (state.activeQuickTab === 'unsynced') {
        rowsToDisplay = rowsToDisplay.filter(r => Object.values(r.storesData).some(st => st.status !== 'sync' || st.stock !== r.db));
      } else if (state.activeQuickTab === 'lowstock') {
        rowsToDisplay = rowsToDisplay.filter(r => r.db < 5);
      } else if (state.activeQuickTab === 'oldbatch') {
        rowsToDisplay = rowsToDisplay.filter(r => isBatchOld(r.expDate));
      }

      const filtered = rowsToDisplay.filter(r => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));

      tbody.innerHTML = filtered.map(row => {
        const selisih = row.fisik - row.db;
        const selisihClass = selisih === 0 ? 'text-emerald-700 font-bold' : (selisih > 0 ? 'text-blue-600 font-bold' : 'text-rose-600 font-bold');
        const selisihText = selisih > 0 ? `+${selisih}` : `${selisih}`;
        
        const actionHtml = selisih === 0
          ? `<span class="inline-flex items-center justify-center w-[112px] h-[34px] rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold whitespace-nowrap">Sesuai</span>`
          : `<button onclick="adjustOpnameRow('${row.id}', 0)" class="inline-flex items-center justify-center w-[112px] h-[34px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs whitespace-nowrap transition-colors">Sesuaikan (${selisihText})</button>`;

        const highlightClass = (state.recentRowId === row.id) ? 'bg-emerald-50 border-l-4 border-emerald-500' : ((state.fastOpnameActive && selisih !== 0) ? 'bg-amber-50/70 border-l-4 border-amber-500' : '');

        const storeEntries = Object.entries(row.storesData);
        const totalStores = storeEntries.length;
        const syncCount = storeEntries.filter(([_, st]) => st.status === 'sync' && st.stock === row.db).length;
        const failCount = storeEntries.filter(([_, st]) => st.status === 'fail').length;
        const syncingCount = storeEntries.filter(([_, st]) => st.status === 'syncing').length;
        const queuedCount = storeEntries.filter(([_, st]) => st.status === 'queued' || st.stock !== row.db).length;

        let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
        let badgeIcon = `<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        let badgeText = "Sinkron";

        if (failCount > 0) {
          badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
          badgeIcon = `<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
          badgeText = `Gagal (${failCount})`;
        } else if (syncingCount > 0) {
          badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
          badgeIcon = `<svg class="w-3.5 h-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
          badgeText = "Mengirim...";
        } else if (queuedCount > 0 || syncCount < totalStores) {
          badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
          badgeIcon = `<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
          badgeText = `${syncCount}/${totalStores} Sinkron`;
        }

        let tagsArr = [];
        if (selisih !== 0) tagsArr.push("Cek Fisik");

        let tagsHtml = tagsArr.map(t => {
          let tCls = t === "Cek Fisik" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800";
          return `<span class="px-1.5 py-0.2 rounded ${tCls} text-[9.5px] font-bold shrink-0">${t}</span>`;
        }).join('');

        return `
          <tr id="row-${row.id}" class="hover:bg-cream-canvas/50 transition-colors align-middle h-[64px] ${highlightClass}">
            <td class="py-3 px-3 align-middle text-left">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-navy line-clamp-2 leading-snug">${row.name}</span>
                ${tagsHtml}
              </div>
              <div class="text-[10.5px] text-navy-muted truncate mt-0.5">${row.sku}</div>
            </td>
            <td class="py-3 px-3 font-mono-code text-[11.5px] whitespace-nowrap align-middle text-left">${row.batch}</td>
            <td class="py-3 px-3 text-center tabular-nums align-middle">${row.db}</td>
            <td class="py-3 px-3 text-center align-middle">
              <div class="inline-flex items-center gap-1 bg-cream-canvas px-2 py-1 rounded-lg border border-warm-border">
                <button type="button" onclick="changePhysicalCount('${row.id}', -1)" class="w-5 h-5 rounded bg-white hover:bg-slate-100 border text-xs font-bold shadow-2xs transition-colors">−</button>
                <span class="w-6 text-center tabular-nums font-bold ${selisih !== 0 ? 'text-rose-600' : ''}">${row.fisik}</span>
                <button type="button" onclick="changePhysicalCount('${row.id}', 1)" class="w-5 h-5 rounded bg-white hover:bg-slate-100 border text-xs font-bold shadow-2xs transition-colors">+</button>
              </div>
            </td>
            <td class="py-3 px-3 text-center tabular-nums ${selisihClass} align-middle">${selisihText}</td>
            <td class="py-3 px-3 text-center align-middle">
              <button onclick="openStoreSyncModal('${row.id}')" class="inline-flex items-center justify-center gap-1.5 w-[120px] h-[32px] rounded-xl border ${badgeBg} font-jakarta font-bold text-[11.5px] shadow-2xs hover:opacity-90 transition-opacity whitespace-nowrap mx-auto" title="Klik untuk lihat detail sinkronisasi toko">
                ${badgeIcon}
                <span>${badgeText}</span>
              </button>
            </td>
            <td class="py-3 px-3 text-center align-middle">
              <div class="flex justify-center">
                ${actionHtml}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      const totalStats = document.getElementById('opname-total-stats');
      if (totalStats) {
        totalStats.textContent = `Menampilkan ${filtered.length} dari ${state.opnameRows.length} SKU`;
      }
    }

    // Canvas panning and zooming handlers
    let canvasZoomLevel = 0.72;
    let isPanning = false;
    let startX = 0, startY = 0;
    let scrollLeft = 0, scrollTop = 0;

    function fitCanvasToViewport() {
      const viewport = document.getElementById('canvas-scroll-viewport');
      if (!viewport) return;
      canvasZoomLevel = 0.72;
      applyCanvasZoom();
      viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
    }

    function adjustCanvasZoom(delta) {
      canvasZoomLevel = Math.max(0.4, Math.min(1.5, canvasZoomLevel + delta));
      applyCanvasZoom();
    }

    function applyCanvasZoom() {
      const stage = document.getElementById('canvas-zoom-stage');
      const zoomLabel = document.getElementById('canvas-zoom-label');
      if (stage) {
        stage.style.transform = `scale(${canvasZoomLevel})`;
      }
      if (zoomLabel) {
        zoomLabel.textContent = `${Math.round(canvasZoomLevel * 100)}%`;
      }
    }

    function initCanvasPanAndZoom() {
      const viewport = document.getElementById('canvas-scroll-viewport');
      if (!viewport) return;

      viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.wf-node-card')) return;
        isPanning = true;
        startX = e.pageX - viewport.offsetLeft;
        startY = e.pageY - viewport.offsetTop;
        scrollLeft = viewport.scrollLeft;
        scrollTop = viewport.scrollTop;
      });

      viewport.addEventListener('mouseleave', () => { isPanning = false; });
      viewport.addEventListener('mouseup', () => { isPanning = false; });

      viewport.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const y = e.pageY - viewport.offsetTop;
        const walkX = (x - startX) * 1.2;
        const walkY = (y - startY) * 1.2;
        viewport.scrollLeft = scrollLeft - walkX;
        viewport.scrollTop = scrollTop - walkY;
      });
    }

    // Debounced physical input handler & Activity feed push helpers
    let debounceTimers = {};

    function handlePhysicalInputChangeWithDebounce(rowId, oldFisik, newFisik, skuCode) {
      if (state.opnameSession.aktif) {
        return; // During active session, do not log per item change
      }
      if (debounceTimers[rowId]) {
        clearTimeout(debounceTimers[rowId]);
      }
      debounceTimers[rowId] = setTimeout(() => {
        pushActivityFeed('opname', `${currentUser.name} mengubah fisik ${skuCode} dari ${oldFisik} ke ${newFisik} pcs.`, skuCode);
      }, 1500);
    }

    function pushActivityFeed(type, text, skuRelated = null, extra = null) {
      const newEntry = {
        id: 'f-' + Date.now() + '-' + Math.floor(Math.random()*1000),
        type: type,
        timestamp: Date.now(),
        actor: type === 'sync' ? 'Sistem natahub' : currentUser.name,
        initials: type === 'sync' ? 'AI' : currentUser.initials,
        text: text,
        sku: skuRelated,
        extra: extra
      };
      state.activityFeed.unshift(newEntry);
      if (state.activityFeed.length > 30) {
        state.activityFeed.pop();
      }
      renderActivityFeed();
    }

    function setFeedFilter(filter) {
      state.feedFilter = filter;
      ['all', 'opname', 'sync', 'error'].forEach(f => {
        const btn = document.getElementById(`feed-chip-${f}`);
        if (btn) {
          if (f === filter) {
            btn.className = "px-2.5 py-1 rounded-md bg-navy text-white font-semibold transition-colors whitespace-nowrap";
          } else {
            btn.className = "px-2.5 py-1 rounded-md bg-cream-canvas text-navy-muted hover:text-navy transition-colors whitespace-nowrap";
          }
        }
      });
      renderActivityFeed();
    }

    function renderActivityFeed() {
      const container = document.getElementById('live-activity-feed-container');
      if (!container) return;

      let feedToRender = [...state.activityFeed];
      if (state.feedFilter !== 'all') {
        feedToRender = feedToRender.filter(f => f.type === state.feedFilter);
      }

      feedToRender.sort((a, b) => {
        if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
        return b.id.localeCompare(a.id);
      });

      container.innerHTML = feedToRender.map(entry => {
        const timeFormatted = formatWibTime(entry.timestamp);
        const timeRelative = formatRelativeTime(entry.timestamp);
        const avatarBg = entry.actor === 'Sistem natahub' ? 'bg-purple-600' : 'bg-sage-dark';

        let skuPillsHtml = '';
        if (entry.extra && entry.extra.skuList) {
          skuPillsHtml = `<div class="flex items-center gap-1 mt-1.5 flex-wrap">` + 
            entry.extra.skuList.slice(0, 5).map(s => `<span onclick="filterOpnameBySkuCode('${s}')" class="px-1.5 py-0.5 rounded bg-cream-canvas hover:bg-sage-soft text-navy font-mono-code font-bold text-[10.5px] border border-warm-border cursor-pointer">${s}</span>`).join('') +
            (entry.extra.skuList.length > 5 ? `<span class="text-[10px] text-navy-muted">+${entry.extra.skuList.length - 5} lainnya</span>` : '') +
            `</div>`;
        }

        return `
          <div class="p-2.5 rounded-xl bg-cream-canvas/80 border border-warm-border flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">${entry.initials}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between text-[10.5px] text-navy-muted mb-0.5">
                <span class="font-bold text-navy">${entry.actor}</span>
                <span>${timeFormatted} • ${timeRelative}</span>
              </div>
              <p class="text-[11.5px] text-navy leading-snug">${entry.text}</p>
              ${skuPillsHtml}
            </div>
          </div>
        `;
      }).join('');
    }

    function filterOpnameBySkuCode(code) {
      const input = document.getElementById('opname-search-input');
      if (input) {
        input.value = code;
        renderOpnameTable();
        showToast(`Memfilter tabel ke SKU ${code}.`, 'info');
      }
    }

    function resetMockData() {
      lastCompletedOpnameSummary = null;
      state.opnameRows = getInitialOpnameRows();
      state.fastOpnameActive = false;
      state.opnameSession = { aktif: false, mulaiPada: null, pelaku: null, perubahan: [] };
      state.activeStoreFilter = null;
      renderAllOpnameViews();
      showToast('Data contoh berhasil di-reset ke kondisi awal.', 'success');
    }

    document.addEventListener('DOMContentLoaded', () => {
      syncCodeLineNumbers();
      fitCanvasToViewport();
      initCanvasPanAndZoom();
      renderAllOpnameViews();

      const dateLabel = document.getElementById('sidebar-current-date-label');
      if (dateLabel) {
        dateLabel.textContent = getJakartaDateLabel();
      }

      setInterval(() => {
        renderActivityFeed();
      }, 30000);

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          renderActivityFeed();
        }
      });

      window.addEventListener('resize', fitCanvasToViewport);

      document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('store-dropdown');
        const btn = document.getElementById('store-selector-btn');
        if (dropdown && btn && !dropdown.contains(event.target) && !btn.contains(event.target)) {
          dropdown.classList.add('hidden');
        }
      });
    });
  

;
/* ===== opname ===== */
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

;
/* ===== supplier ===== */
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

;
/* ===== ai-usage ===== */
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

;
/* ===== fulfillment ===== */
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

;
/* ===== inbox ===== */
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

;
/* ===== auth ===== */
/* Login & daftar: gerbang masuk sebelum dashboard.
   Dibungkus IIFE; hanya window.NataAuth.logout() yang dibuka ke luar. */
(function () {
  var $ = function (id) {
    return document.getElementById(id);
  };

  var LOGO = "logo.png";

  var scr = "login";
  var lg = { e: "", p: "" };
  var sp = false;
  var reg = { name: "", email: "", store: "", pass: "" };
  var err = "";
  var ok = "";

  var U = { name: "", store: "", shops: [] };

  /* Akun tersimpan di browser (localStorage). Tanpa server: akun hanya ada di perangkat ini. */
  var KEY = "natahub.users.v1";
  var memUsers = [];

  function loadUsers() {
    try {
      var raw = localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return memUsers;
    }
  }

  function saveUsers(list) {
    memUsers = list;
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function findUser(email) {
    var m = String(email).trim().toLowerCase();
    var list = loadUsers();
    for (var i = 0; i < list.length; i++) {
      if (list[i].email === m) return list[i];
    }
    return null;
  }

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

          '<label for="le">Email bisnis</label>' +
          '<input type="text" id="le" placeholder="owner@tokokamu.co.id" value="' + esc(lg.e) + '">' +

          '<label for="lp">Kata sandi</label>' +
          '<div class="pw">' +
            '<input type="' + (sp ? "text" : "password") + '" id="lp" value="' + esc(lg.p) + '">' +
            '<button class="lk" id="tp" type="button">' + (sp ? "Sembunyikan" : "Tampilkan") + '</button>' +
          '</div>' +

          '<label class="chk"><input type="checkbox" checked> Ingat saya di perangkat ini</label>' +
          (ok ? '<div style="margin:10px 0 0;padding:10px 12px;border-radius:10px;background:#ecfdf3;color:#067647;font-size:13px;font-weight:600">' + esc(ok) + '</div>' : '') +
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

          '<label for="rpw">Kata sandi <i>*</i> <small>(minimal 6 karakter)</small></label>' +
          '<input type="password" id="rpw" autocomplete="new-password" value="' + esc(reg.pass) + '">' +

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
          '<p class="lbl ac" style="margin:0">Periksa data di bawah. Setelah ini kamu masuk dengan email dan kata sandi yang baru dibuat.</p>' +

          '<div class="sum">' +
            '<div class="row"><span class="lbl">Status asisten</span><span class="badge b-g">AKTIF</span></div>' +
            '<div class="row"><span class="lbl">Toko terhubung</span><span>' + selShops().join(", ") + '</span></div>' +
            '<div class="row"><span class="lbl">Bisnis terdaftar</span><b>' + esc(reg.store) + '</b></div>' +
            '<div class="row"><span class="lbl">Mode pengawasan</span><span>Otomatis dengan persetujuan manual</span></div>' +
          '</div>' +

          '<p class="lbl" style="margin:0 0 4px">✓ Stok dan katalog disinkronkan otomatis<br>✓ Draf balasan dan PO menunggu persetujuan kamu</p>' +

          '<div class="btns">' +
            '<button class="btn ghost" id="bk2">← Kembali</button>' +
            '<button class="btn" id="go">Selesai &amp; daftar akun →</button>' +
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
        ok = "";
        draw();
      };
    });

    v("le", function (x) { lg.e = x; });
    v("lp", function (x) { lg.p = x; });
    v("rn", function (x) { reg.name = x; });
    v("re", function (x) { reg.email = x; });
    v("rs", function (x) { reg.store = x; });
    v("rpw", function (x) { reg.pass = x; });

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

      var u = findUser(lg.e);

      if (!u) {
        err = "Email belum terdaftar. Silakan daftar dulu lewat “Daftar Bisnis”.";
        ok = "";
        draw();
        return;
      }

      if (u.pass !== lg.p) {
        err = "Kata sandi salah. Coba lagi.";
        ok = "";
        draw();
        return;
      }

      U = { name: u.name, store: u.store, shops: u.shops };
      ok = "";
      enter();
    });

    g("n1", function () {
      if (!reg.name.trim() || !reg.store.trim() || reg.email.indexOf("@") < 1) {
        err = "Lengkapi nama, email yang valid, dan nama toko.";
        draw();
        return;
      }

      if (reg.pass.length < 6) {
        err = "Kata sandi minimal 6 karakter.";
        draw();
        return;
      }

      if (findUser(reg.email)) {
        err = "Email ini sudah terdaftar. Silakan masuk.";
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

    g("go", function () {
      if (findUser(reg.email)) {
        err = "Email ini sudah terdaftar. Silakan masuk.";
        scr = "r1";
        draw();
        return;
      }

      var list = loadUsers().slice();
      list.push({
        name: reg.name.trim(),
        email: reg.email.trim().toLowerCase(),
        pass: reg.pass,
        store: reg.store.trim(),
        shops: selShops()
      });
      saveUsers(list);

      /* Daftar dulu, lalu masuk lewat halaman login. */
      lg = { e: reg.email.trim(), p: "" };
      reg = { name: "", email: "", store: "", pass: "" };
      err = "";
      ok = "Pendaftaran berhasil! Silakan masuk dengan email dan kata sandi kamu.";
      scr = "login";
      draw();
    });
  }

  function initials(name) {
    var p = String(name).trim().split(/\s+/);
    return ((p[0] || "").charAt(0) + (p[1] || "").charAt(0)).toUpperCase() || "NH";
  }

  function showApp() {
    $("auth").hidden = true;
    $("app-root").hidden = false;

    if (U && U.name) {
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
      ok = "";
      draw();
      window.scrollTo(0, 0);
    }
  };

  draw();
})();

;
