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
  
