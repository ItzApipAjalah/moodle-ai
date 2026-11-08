// Moodle AI Quiz Solver - High Speed Batch Scraper & 1-Click Auto-Pilot

(function () {
  if (window.__moodleAiSolverInjected) return;
  window.__moodleAiSolverInjected = true;

  // Modern Geometric Vector Icons (Zero Emojis)
  const ICON_AI = `<svg width="16" height="16" viewBox="0 0 100 100" fill="currentColor" style="display:inline-block; vertical-align:middle;">
    <defs>
      <mask id="moodle-widget-cutout">
        <rect width="100" height="100" fill="white" />
        <path d="M 40 56 L 47 49 L 57.5 68 L 97 23" fill="none" stroke="black" stroke-width="21" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4" />
      </mask>
      <clipPath id="moodle-widget-clip">
        <rect x="40" y="0" width="60" height="100" />
      </clipPath>
    </defs>
    <rect x="14" y="42" width="14" height="44" rx="1.5" />
    <g mask="url(#moodle-widget-cutout)">
      <rect x="40" y="29" width="14" height="57" rx="1.5" />
      <rect x="66" y="14" width="14" height="72" rx="1.5" />
    </g>
    <path d="M 40 56 L 47 49 L 57.5 68 L 97 23" fill="none" stroke="currentColor" stroke-width="12.5" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4" clip-path="url(#moodle-widget-clip)" />
  </svg>`;
  const ICON_ZAP = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
  const ICON_GLOBE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const ICON_DOC = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>`;
  const ICON_TRASH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
  const ICON_MINUS = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>`;
  const ICON_PLUS = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`;
  const ICON_CLOSE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`;
  const ICON_SPINNER = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: moodleSpin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
  const ICON_DOWNLOAD = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;
  const ICON_REFRESH = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;

  // GitHub Repository Configuration
  const GITHUB_REPO = "ItzApipAjalah/moodle-ai";
  const CURRENT_COMMIT_SHA = "d01fc4d3c9bcfdb71facafeacca1da4c6d500835";
  const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`;
  const GITHUB_ZIP_URL = `https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip`;
  const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

  // Extract Attempt ID for caching
  const urlParams = new URLSearchParams(window.location.search);
  const attemptId = urlParams.get("attempt") || "default";

  const STORAGE_QUESTIONS_KEY = `moodle_ai_q_${attemptId}`;
  const STORAGE_ANSWERS_KEY = `moodle_ai_a_${attemptId}`;
  const STORAGE_AUTOLOOP_KEY = `moodle_ai_autoloop_${attemptId}`;

  let isWorking = false;
  let activeAbortController = null;
  let timerInterval = null;

  // Listen for messages from background (Web Gemini Auto-Pilot)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "AUTO_PILOT_EXECUTE") {
      console.log("%c[Moodle AI]%c Jawaban AI diterima, menerapkan ke kuis...", "background:#10b981; color:#fff; padding:2px 6px; border-radius:3px; font-weight:bold;", "color:#0f172a; font-weight:bold;");
      updateStatus("Menerapkan jawaban AI...", "loading");
      parseAndApplyPastedAnswers(message.answersText, true);
      sendResponse({ success: true });
    }
  });

  initWidget();
  checkCachedAnswersOnLoad();

  function initWidget() {
    const isQuizPage = document.querySelector(".que") || window.location.href.includes("/mod/quiz/");
    if (!isQuizPage) return;

    const cachedAnswers = getCachedAnswers();
    const hasAnswers = cachedAnswers && cachedAnswers.length > 0;
    const isAutoLoopActive = sessionStorage.getItem(STORAGE_AUTOLOOP_KEY) === "true";

    const widget = document.createElement("div");
    widget.id = "moodle-ai-widget";
    widget.innerHTML = `
      <style>
        @keyframes moodleSpin { 100% { transform: rotate(360deg); } }
      </style>
      <div class="moodle-ai-header" id="moodle-ai-drag-handle">
        <div class="moodle-ai-title-wrap">
          <span class="moodle-ai-header-icon">${ICON_AI}</span>
          <span class="moodle-ai-title">Moodle AI Solver</span>
        </div>
        <div class="moodle-ai-controls">
          <button class="moodle-ai-btn-icon" id="moodle-ai-btn-min" title="Minimize">${ICON_MINUS}</button>
        </div>
      </div>
      <div class="moodle-ai-body">
        <div class="moodle-ai-status-box ready" id="moodle-ai-status">
          <div class="moodle-ai-status-indicator">${ICON_CHECK}</div>
          <span class="moodle-ai-status-text">
            ${hasAnswers ? `${cachedAnswers.length} jawaban siap di penyimpanan lokal.` : "Sistem siap mendeteksi dan menjawab kuis."}
          </span>
        </div>

        <!-- GitHub Update Notification Banner -->
        <div id="moodle-ai-update-box" style="display:none; margin-bottom:10px;"></div>

        <!-- 1-Click Auto-Pilot Hero Toggle Card -->
        <div class="moodle-ai-autopilot-card">
          <div class="moodle-ai-autopilot-info">
            <span class="moodle-ai-autopilot-label">
              ${ICON_ZAP}
              <span>Auto-Pilot 1-Klik</span>
            </span>
            <span class="moodle-ai-autopilot-desc">Otomatis cari jawaban & isi semua soal</span>
          </div>
          <label class="moodle-glass-switch" title="Aktifkan Mode Auto-Pilot">
            <input type="checkbox" id="moodle-ai-autopilot-toggle" ${isAutoLoopActive ? "checked" : ""}>
            <span class="moodle-glass-slider"></span>
          </label>
        </div>

        <div class="moodle-ai-actions">
          <button class="moodle-ai-btn-primary" id="moodle-ai-btn-autopilot-run">
            ${ICON_ZAP}
            <span id="moodle-ai-btn-autopilot-label">Jalankan Auto-Pilot (Web Gemini)</span>
          </button>

          <button class="moodle-ai-btn-secondary" id="moodle-ai-btn-cancel" style="display:none; background:rgba(254, 242, 242, 0.85); color:#b91c1c; border-color:rgba(252, 165, 165, 0.7);">
            ${ICON_CLOSE}
            <span>Batalkan Proses</span>
          </button>

          <div class="moodle-ai-sub-actions">
            <button class="moodle-ai-btn-secondary" id="moodle-ai-btn-print" ${hasAnswers ? "" : "disabled"}>
              ${ICON_DOC}
              <span>Lihat Kunci</span>
            </button>
            <button class="moodle-ai-btn-success" id="moodle-ai-btn-autofill" ${hasAnswers ? "" : "disabled"}>
              ${ICON_CHECK}
              <span>Isi Semua Halaman</span>
            </button>
          </div>

          <!-- Secondary Options Toggle -->
          <div class="moodle-ai-toggle-wrap">
            <button class="moodle-ai-btn-secondary" id="moodle-ai-btn-fill-page" style="width:auto; padding:5px 9px; font-size:11px;">
              Isi Halaman Ini
            </button>
            <button class="moodle-ai-btn-secondary" id="moodle-ai-btn-toggle-paste" style="width:auto; padding:5px 9px; font-size:11px;">
              Manual Paste
            </button>
            <button class="moodle-ai-btn-icon" id="moodle-ai-btn-clear" style="color:#64748b; padding:4px;" title="Reset cache jawaban">
              ${ICON_TRASH}
            </button>
          </div>

          <div class="moodle-ai-paste-wrap" id="moodle-ai-paste-container" style="display:none;">
            <textarea id="moodle-ai-paste-text" placeholder="Tempel jawaban teks di sini (1. True, 2. B, dst)..."></textarea>
            <div class="moodle-ai-paste-actions">
              <button class="moodle-ai-btn-secondary" id="moodle-ai-btn-paste-clip" style="flex:1; padding:6px; font-size:11px;">Clipboard</button>
              <button class="moodle-ai-btn-success" id="moodle-ai-btn-apply-paste" style="flex:1; padding:6px; font-size:11px;">Terapkan & Klik</button>
            </div>
          </div>

          <!-- GitHub Update & Info Footer Bar -->
          <div class="moodle-ai-footer-bar">
            <span style="color:#64748b; font-size:10px; font-weight:500;">ItzApipAjalah/moodle-ai</span>
            <button type="button" class="moodle-ai-link-btn" id="moodle-ai-btn-check-update" title="Periksa commit pembaruan dari GitHub">
              ${ICON_REFRESH}
              <span>Cek Update</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Event handlers
    const autoPilotBtn = document.getElementById("moodle-ai-btn-autopilot-run");
    const autoPilotToggle = document.getElementById("moodle-ai-autopilot-toggle");

    autoPilotBtn.addEventListener("click", () => startFullAutoPilot());

    autoPilotToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        startFullAutoPilot();
      } else {
        sessionStorage.removeItem(STORAGE_AUTOLOOP_KEY);
        updateStatus("Mode Auto-Pilot dimatikan.", "ready");
      }
    });

    document.getElementById("moodle-ai-btn-toggle-paste").addEventListener("click", () => {
      const pasteBox = document.getElementById("moodle-ai-paste-container");
      pasteBox.style.display = pasteBox.style.display === "none" ? "flex" : "none";
    });

    document.getElementById("moodle-ai-btn-paste-clip").addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) document.getElementById("moodle-ai-paste-text").value = text;
      } catch (_) {
        alert("Gunakan shortcut Ctrl+V untuk menempelkan teks jawaban.");
      }
    });

    document.getElementById("moodle-ai-btn-apply-paste").addEventListener("click", () => {
      const rawText = document.getElementById("moodle-ai-paste-text").value.trim();
      if (!rawText) return alert("Silakan tempel teks jawaban terlebih dahulu.");
      parseAndApplyPastedAnswers(rawText, false);
    });

    document.getElementById("moodle-ai-btn-cancel").addEventListener("click", () => cancelActiveWork());
    document.getElementById("moodle-ai-btn-print").addEventListener("click", () => renderAnswerModal());
    document.getElementById("moodle-ai-btn-autofill").addEventListener("click", () => startAutoFillLoop());
    document.getElementById("moodle-ai-btn-fill-page").addEventListener("click", () => applyCachedAnswersToCurrentPage(true));
    document.getElementById("moodle-ai-btn-clear").addEventListener("click", () => clearAllCache());

    const minBtn = document.getElementById("moodle-ai-btn-min");
    const header = document.getElementById("moodle-ai-drag-handle");

    const toggleMinimize = (e) => {
      if (e) e.stopPropagation();
      const isMin = widget.classList.toggle("minimized");
      minBtn.innerHTML = isMin ? ICON_PLUS : ICON_MINUS;
      minBtn.title = isMin ? "Buka Moodle AI Solver" : "Minimize";
    };

    minBtn.addEventListener("click", toggleMinimize);

    // Clicking anywhere on the minimized pill expands it back
    header.addEventListener("click", (e) => {
      if (widget.classList.contains("minimized")) {
        toggleMinimize(e);
      }
    });

    makeDraggable(widget, header);

    document.getElementById("moodle-ai-btn-check-update")?.addEventListener("click", () => {
      checkGitHubUpdate(true);
    });

    // Auto-check for updates silently on load (cached 20 mins)
    setTimeout(() => {
      checkGitHubUpdate(false);
    }, 1500);
  }

  async function checkGitHubUpdate(isManual = false) {
    if (isManual) updateStatus("Memeriksa pembaruan di GitHub...", "loading");

    try {
      // Check cache in sessionStorage to prevent hitting GitHub rate limits (60 requests/hr)
      const cached = sessionStorage.getItem("moodle_ai_gh_update_check");
      if (cached && !isManual) {
        const data = JSON.parse(cached);
        if (data && data.hasUpdate) {
          renderUpdateBanner(data.commit);
        }
        return;
      }

      const res = await fetch(GITHUB_API_URL, {
        headers: { Accept: "application/vnd.github.v3+json" }
      });

      if (!res.ok) {
        if (isManual) updateStatus(`Gagal cek update: HTTP ${res.status}`, "error");
        return;
      }

      const commits = await res.json();
      if (!commits || !commits[0]) return;

      const latestCommit = commits[0];
      const latestSha = latestCommit.sha;
      const shortSha = latestSha.substring(0, 7);
      const commitMsg = (latestCommit.commit.message || "").split("\n")[0];
      const commitDate = new Date(latestCommit.commit.author.date).toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric"
      });

      // Compare with the baseline commit of this build
      const hasUpdate = !latestSha.toLowerCase().startsWith(CURRENT_COMMIT_SHA.substring(0, 7).toLowerCase());

      sessionStorage.setItem("moodle_ai_gh_update_check", JSON.stringify({
        hasUpdate,
        commit: { shortSha, commitMsg, commitDate, sha: latestSha },
        timestamp: Date.now()
      }));

      if (hasUpdate) {
        renderUpdateBanner({ shortSha, commitMsg, commitDate, sha: latestSha });
        if (isManual) updateStatus("Pembaruan baru ditemukan di GitHub!", "success");
      } else {
        if (isManual) updateStatus("Ekstensi Anda sudah menggunakan commit terbaru.", "success");
      }
    } catch (err) {
      if (isManual) updateStatus(`Gagal cek update: ${err.message}`, "error");
    }
  }

  function renderUpdateBanner(info) {
    const box = document.getElementById("moodle-ai-update-box");
    if (!box) return;
    box.style.display = "block";
    box.innerHTML = `
      <div class="moodle-ai-update-banner">
        <div class="moodle-ai-update-top">
          <span class="moodle-ai-update-badge">
            ${ICON_ZAP} Update Tersedia
          </span>
          <span class="moodle-ai-update-date">${info.commitDate || ""}</span>
          <button class="moodle-ai-btn-icon" id="moodle-ai-btn-dismiss-update" title="Tutup pemberitahuan" style="margin-left:auto; padding:2px; color:#78350f; background:rgba(217, 119, 6, 0.15); border:none;">
            ${ICON_CLOSE}
          </button>
        </div>
        <div class="moodle-ai-update-commit">
          <span class="moodle-ai-update-sha">${info.shortSha}</span>: ${escapeHtml(info.commitMsg)}
        </div>
        <div class="moodle-ai-update-actions">
          <button type="button" class="moodle-ai-btn-update-download" id="moodle-ai-btn-download-zip">
            ${ICON_DOWNLOAD}
            <span>Unduh Update (.ZIP)</span>
          </button>
          <a class="moodle-ai-btn-update-link" href="${GITHUB_REPO_URL}/commit/${info.sha}" target="_blank" rel="noopener noreferrer">
            Lihat Perubahan
          </a>
        </div>
      </div>
    `;

    document.getElementById("moodle-ai-btn-download-zip")?.addEventListener("click", () => {
      window.open(GITHUB_ZIP_URL, "_blank");
      updateStatus("Unduhan ZIP dimulai. Ekstrak & reload ekstensi di chrome://extensions.", "success");
    });

    document.getElementById("moodle-ai-btn-dismiss-update")?.addEventListener("click", () => {
      box.style.display = "none";
    });
  }

  function updateStatus(text, type = "ready") {
    const box = document.getElementById("moodle-ai-status");
    if (!box) return;
    box.className = `moodle-ai-status-box ${type}`;

    let iconHtml = ICON_CHECK;
    if (type === "loading") {
      iconHtml = ICON_SPINNER;
    } else if (type === "error") {
      iconHtml = ICON_CLOSE;
    }

    box.querySelector(".moodle-ai-status-indicator").innerHTML = iconHtml;
    box.querySelector(".moodle-ai-status-text").textContent = text;
  }

  function getCachedAnswers() {
    try {
      const raw = localStorage.getItem(STORAGE_ANSWERS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function clearAllCache() {
    localStorage.removeItem(STORAGE_QUESTIONS_KEY);
    localStorage.removeItem(STORAGE_ANSWERS_KEY);
    sessionStorage.removeItem(STORAGE_AUTOLOOP_KEY);
    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (toggle) toggle.checked = false;
    document.getElementById("moodle-ai-btn-print").disabled = true;
    document.getElementById("moodle-ai-btn-autofill").disabled = true;
    updateStatus("Data cache kuis berhasil direset.", "ready");
  }

  function cancelActiveWork() {
    chrome.runtime.sendMessage({ action: "CANCEL_AUTO_PILOT" });
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isWorking = false;
    document.getElementById("moodle-ai-btn-autopilot-run").disabled = false;
    document.getElementById("moodle-ai-btn-cancel").style.display = "none";
    updateStatus("Proses dibatalkan.", "ready");
  }

  async function checkCachedAnswersOnLoad() {
    const isAutoLoopActive = sessionStorage.getItem(STORAGE_AUTOLOOP_KEY) === "true";
    const answers = getCachedAnswers();

    if (answers && answers.length > 0) {
      await applyCachedAnswersToCurrentPage(false);

      if (isAutoLoopActive) {
        if (window.location.href.includes("summary.php") || !document.querySelector(".que")) {
          sessionStorage.removeItem(STORAGE_AUTOLOOP_KEY);
          updateStatus("Semua halaman soal selesai diisi.", "success");
          return;
        }

        updateStatus("Mengisi halaman ini secara otomatis...", "loading");
        setTimeout(() => {
          proceedToNextPage();
        }, 1100);
      }
    }
  }

  async function getBase64FromImage(img) {
    if (!img || !img.src) return null;

    // 1. Fast canvas extraction if already rendered in current DOM
    if (img.complete && img.naturalWidth > 0) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        if (dataUrl && dataUrl.length > 100) return dataUrl;
      } catch (_) {}
    }

    // 2. Fetch directly with same-origin credentials (cookie authenticated)
    try {
      const res = await fetch(img.src, { credentials: "same-origin" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("Gagal mengunduh gambar soal:", img.src, err);
      return null;
    }
  }

  async function extractQuestions(doc, fetchImages = false) {
    const questionEls = doc.querySelectorAll(".que");
    const list = [];

    for (let index = 0; index < questionEls.length; index++) {
      const el = questionEls[index];
      const id = el.id || `q_${index + 1}`;
      const qnoEl = el.querySelector(".qno") || el.querySelector(".no");
      const qNum = qnoEl ? qnoEl.innerText.replace(/[^0-9]/g, "") : `${index + 1}`;

      const qtextEl = el.querySelector(".qtext") || el.querySelector(".formulation");
      let questionText = qtextEl ? qtextEl.innerText.trim() : "";

      // Extract all valid images in the question (ignoring flags & tiny icons)
      const rawImgs = Array.from(el.querySelectorAll(".formulation img, .qtext img, .content img, table img"));
      const validImgs = rawImgs.filter((img) => {
        if (img.classList.contains("questionflagimage")) return false;
        if (img.src && (img.src.includes("/i/unflagged") || img.src.includes("/i/flagged") || img.src.includes("/theme/image.php/"))) return false;
        if (img.naturalWidth && img.naturalWidth < 25 && img.naturalHeight && img.naturalHeight < 25) return false;
        return true;
      });

      const images = [];
      if (fetchImages && validImgs.length > 0) {
        for (let i = 0; i < validImgs.length; i++) {
          const img = validImgs[i];
          const dataUrl = await getBase64FromImage(img);
          if (dataUrl) {
            images.push({
              qNum,
              index: i + 1,
              dataUrl,
              src: img.src,
              alt: img.alt || `Gambar_Soal_${qNum}_${i + 1}.jpg`
            });
          }
        }
      }

      if (validImgs.length > 0) {
        validImgs.forEach((img, i) => {
          const desc = img.alt ? `Alt: ${img.alt}` : `Src: ${img.src}`;
          questionText += `\n[Gambar ${i + 1}: ${desc}]`;
        });
      }

      let type = "unknown";
      const options = [];

      // Check if CodeRunner question
      const isCodeRunner = el.classList.contains("coderunner") || el.querySelector("textarea.coderunner-answer, textarea.edit_code");
      if (isCodeRunner) {
        type = "coderunner";
        const codeTextarea = el.querySelector("textarea.coderunner-answer, textarea.edit_code, textarea[name*='_answer']");
        const lang = codeTextarea?.getAttribute("data-lang") || "Python3";
        const starterCode = codeTextarea ? codeTextarea.value : (codeTextarea?.getAttribute("data-reload-text") || "");

        const formEl = el.querySelector(".formulation");
        if (formEl) {
          const formClone = formEl.cloneNode(true);
          formClone.querySelectorAll(".uiloadfailed, .ui_wrapper, textarea, .im-controls, .prompt, .answer_reset_btn").forEach((n) => n.remove());
          questionText = formClone.innerText.trim();
        }

        list.push({
          id,
          number: qNum,
          type: "coderunner",
          lang,
          starterCode,
          question: questionText,
          images,
          options: [],
          domElement: el
        });
        continue;
      }

      const radios = el.querySelectorAll('.answer input[type="radio"]');
      const checkboxes = el.querySelectorAll('.answer input[type="checkbox"]:not([name*="flagged"])');
      const textInputs = el.querySelectorAll('.answer input[type="text"]');
      const selects = el.querySelectorAll(".answer select, table select");

      if (radios.length > 0) {
        type = "radio";
        radios.forEach((r, optIdx) => {
          const lbl = el.querySelector(`label[for="${r.id}"]`) || r.closest("label");
          const labelText = lbl ? lbl.innerText.trim() : (r.parentElement ? r.parentElement.innerText.trim() : r.value);
          options.push({ index: optIdx, id: r.id, text: labelText });
        });
      } else if (checkboxes.length > 0) {
        type = "checkbox";
        checkboxes.forEach((cb, optIdx) => {
          const lbl = el.querySelector(`label[for="${cb.id}"]`) || cb.closest("label");
          const labelText = lbl ? lbl.innerText.trim() : (cb.parentElement ? cb.parentElement.innerText.trim() : cb.value);
          options.push({ index: optIdx, id: cb.id, text: labelText });
        });
      } else if (selects.length > 0) {
        type = "select";
        selects.forEach((sel, sIdx) => {
          const row = sel.closest("tr") || sel.parentElement;
          const subText = row ? row.querySelector(".text")?.innerText.trim() : "";
          const subOptions = Array.from(sel.querySelectorAll("option"))
            .filter((o) => o.value)
            .map((o, oIdx) => ({ index: oIdx, value: o.value, text: o.innerText.trim() }));
          options.push({
            selectIndex: sIdx,
            subText: subText || `Sub question ${sIdx + 1}`,
            subOptions
          });
        });
      } else if (textInputs.length > 0) {
        type = "text";
      }

      list.push({
        id,
        number: qNum,
        type,
        question: questionText,
        images,
        options,
        domElement: el
      });
    }

    return list;
  }

  async function collectAllQuizQuestions() {
    updateStatus("Membaca soal & mengunduh gambar...", "loading");

    const currentQuestions = await extractQuestions(document, true);
    const questionsMap = new Map();
    currentQuestions.forEach((q) => questionsMap.set(q.number || q.id, q));

    const navButtons = document.querySelectorAll("#mod_quiz_navblock a.qnbutton");
    const pageUrls = new Set();

    navButtons.forEach((btn) => {
      const href = btn.getAttribute("href");
      if (href && !href.startsWith("#") && href.includes("attempt.php")) {
        pageUrls.add(href.split("#")[0]);
      }
    });

    const otherUrls = Array.from(pageUrls).filter((u) => u !== window.location.href.split("#")[0]);

    let fetchedCount = 0;
    for (const url of otherUrls) {
      fetchedCount++;
      updateStatus(`Mengambil soal & gambar halaman ${fetchedCount + 1}/${otherUrls.length + 1}...`, "loading");
      try {
        const response = await fetch(url, { credentials: "same-origin" });
        if (response.ok) {
          const html = await response.text();
          const pageDoc = new DOMParser().parseFromString(html, "text/html");
          const pageQuestions = await extractQuestions(pageDoc, true);
          pageQuestions.forEach((q) => questionsMap.set(q.number || q.id, q));
        }
      } catch (err) {
        console.warn("Gagal fetch halaman:", url, err);
      }
    }

    const allQuestions = Array.from(questionsMap.values());
    allQuestions.sort((a, b) => (parseInt(a.number, 10) || 0) - (parseInt(b.number, 10) || 0));

    const storagePayload = allQuestions.map((q) => ({
      id: q.id,
      number: q.number,
      type: q.type,
      lang: q.lang,
      starterCode: q.starterCode,
      question: q.question,
      options: q.options,
      hasImages: (q.images || []).length > 0
    }));
    localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(storagePayload));
    return allQuestions;
  }

  // 1-Click Auto-Pilot Master Function
  async function startFullAutoPilot() {
    if (isWorking) return;
    isWorking = true;

    const runBtn = document.getElementById("moodle-ai-btn-autopilot-run");
    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (runBtn) runBtn.disabled = true;
    if (toggle) toggle.checked = true;

    sessionStorage.setItem(STORAGE_AUTOLOOP_KEY, "true");
    updateStatus("Mengumpulkan soal kuis & mengunduh gambar...", "loading");

    try {
      const allQuestions = await collectAllQuizQuestions();
      if (allQuestions.length === 0) {
        updateStatus("Tidak ditemukan soal kuis.", "error");
        isWorking = false;
        if (runBtn) runBtn.disabled = false;
        return;
      }

      // Collect all images from all questions
      const allImages = [];
      allQuestions.forEach((q) => {
        if (q.images && q.images.length > 0) {
          q.images.forEach((img) => allImages.push(img));
        }
      });

      let prompt = `Tolong jawab ${allQuestions.length} soal kuis berikut secara LANGSUNG, TEPAT, dan RINGKAS.\n\n`;
      if (allImages.length > 0) {
        prompt += `PEMBERITAHUAN GAMBAR:\nAda ${allImages.length} gambar soal yang diunggah ke chat ini. Cermati isi gambar tersebut untuk menjawab nomor yang bersangkutan!\n\n`;
      }
      prompt += `ATURAN FORMAT JAWABAN (SANGAT KETAT & WAJIB DIIKUTI):\n`;
      prompt += `1. Tuliskan HANYA nomor soal dan huruf opsi jawaban yang benar (A, B, C, D, E atau True/False).\n`;
      prompt += `2. Pilihan ganda tunggal: HANYA tulis nomor dan huruf atau teks singkat, contoh: "1. B" atau "2. A. [Teks]".\n`;
      prompt += `3. Pilihan ganda LEBIH DARI SATU ("Select one or more" / Checkbox): HANYA SEBUTKAN HURUF-HURUF PILIHAN YANG BENAR DIPISAH KOMA! CONTOH: "4. B, C, D" atau "13. A, C". JANGAN mengulang teks opsi panjang ataupun membuat tanda kurung "(atau...)".\n`;
      prompt += `4. True/False: HANYA tulis "1. True" atau "1. False".\n`;
      prompt += `5. DILARANG MENYEBUTKAN nama file gambar (seperti Gambar_Soal_... atau *.jpg), tag sitasi, ataupun penjelasan tambahan!\n\n`;
      prompt += `Contoh format output yang BENAR:\n`;
      prompt += `1. False\n`;
      prompt += `2. A\n`;
      prompt += `3. A\n`;
      prompt += `4. B, C, D\n`;
      prompt += `5. D\n`;
      prompt += `6. D\n`;
      prompt += `7. A\n`;
      prompt += `8. C\n`;
      prompt += `9. D\n`;
      prompt += `10. D\n`;
      prompt += `11. D\n`;
      prompt += `12. False\n`;
      prompt += `13. A, C\n`;
      prompt += `14. B\n`;
      prompt += `15. True\n\n`;
      prompt += `================== DAFTAR SOAL ==================\n\n`;

      allQuestions.forEach((q, idx) => {
        const num = q.number || idx + 1;
        prompt += `=================================================\n`;

        // Explicit notice if question has image (even without "Perhatikan gambar berikut!")
        if (q.images && q.images.length > 0) {
          prompt += `[INFORMASI KHUSUS SOAL ${num}]:\n`;
          prompt += `Soal nomor ${num} ini MEMILIKI GAMBAR TERLAMPIR yang diupload ke chat (${q.images.length} gambar).\n`;
          prompt += `Perhatian: Soal ini WAJIB dijawab berdasarkan analisis isi gambar yang dilampirkan (baca diagram / tabel / alamat memori / teks di dalam gambar)!\n\n`;
        }

        if (q.type === "coderunner") {
          prompt += `SOAL CODING ${num} (CodeRunner - ${q.lang || "Python3"}):\n`;
          prompt += `${q.question}\n\n`;
          if (q.starterCode) {
            prompt += `KODE TEMPLATE:\n\`\`\`${(q.lang || "python").toLowerCase()}\n${q.starterCode}\n\`\`\`\n\n`;
          }
        } else {
          prompt += `Soal ${num}:\n${q.question}\n`;
          if (q.type === "checkbox") {
            prompt += `[TIPE: Pilihan lebih dari satu (Select one or more / Checkbox). Pilih SEMUA jawaban yang benar! Jawab HANYA huruf-hurufnya dipisah koma, contoh: "${num}. B, C, D"]\n`;
          }
          if (q.options && q.options.length > 0) {
            prompt += `Pilihan:\n`;
            q.options.forEach((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              if (q.type === "select") {
                prompt += `- ${opt.subText}: ${opt.subOptions.map((so) => so.text).join(" / ")}\n`;
              } else {
                prompt += `${letter}. ${opt.text}\n`;
              }
            });
          }
        }
        prompt += `\n`;
      });

      prompt += `=================================================\n`;
      prompt += `Jawab sekarang sesuai contoh format di atas secara terurut!`;


      updateStatus(
        allImages.length > 0
          ? `Menjalankan Gemini di background (${allImages.length} gambar)...`
          : "Menjalankan Gemini di background (tidak terlihat). Menunggu AI menjawab...",
        "loading"
      );

      // Send prompt AND images to background
      chrome.runtime.sendMessage({
        action: "START_AUTO_PILOT",
        prompt: prompt,
        images: allImages
      });

      isWorking = false;
      if (runBtn) runBtn.disabled = false;

    } catch (err) {
      isWorking = false;
      if (runBtn) runBtn.disabled = false;
      updateStatus(`Gagal: ${err.message}`, "error");
    }
  }

  // Parse raw text answers from Gemini Web and auto-apply / click
  async function parseAndApplyPastedAnswers(rawText, isAutoPilotMode = false) {
    if (!rawText || !rawText.trim()) {
      alert("Teks jawaban kosong.");
      return;
    }

    // Special detection for CodeRunner code
    const isCode = /```(?:python|py)?[\s\S]*?```/i.test(rawText) || /class\s+\w+|def\s+\w+\s*\(/.test(rawText);
    const currentQuestions = await extractQuestions(document, false);
    const codeRunnerQ = currentQuestions.find((q) => q.type === "coderunner");

    if (isCode && codeRunnerQ) {
      let code = rawText.trim();
      const fenceMatch = rawText.match(/```(?:python|py|java|c|cpp)?\s*([\s\S]*?)```/i);
      if (fenceMatch) {
        code = fenceMatch[1].trim();
      }

      setCodeRunnerAnswer(codeRunnerQ.domElement, code);
      codeRunnerQ.domElement.classList.add("moodle-ai-highlight");

      const codeAnswers = [
        {
          number: codeRunnerQ.number,
          id: codeRunnerQ.id,
          codeAnswer: code,
          explanation: "Kode implementasi CodeRunner"
        }
      ];
      localStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(codeAnswers));

      updateStatus("Kode berhasil dimasukkan ke editor CodeRunner.", "success");
      return;
    }

    // 1. Sanitize text: strip markdown bullets, inline image tags/filenames while preserving newlines
    let textToParse = rawText.replace(/^[ \t]*[\*\-\•]\s*/gm, "");
    textToParse = textToParse.replace(/[\(\[\{]?[ \t]*Gambar_Soal_[^\r\n\)\]\}]+[ \t]*[\)\]\}]?/gi, "");
    textToParse = textToParse.replace(/[\(\[\{]?[ \t]*soal_\d+_[^\r\n\)\]\}]+\.(?:jpg|jpeg|png|webp|gif)[ \t]*[\)\]\}]?/gi, "");
    textToParse = textToParse.replace(/[\(\[\{]?[ \t]*[\w\-_]+\.(?:jpg|jpeg|png|webp|gif)[ \t]*[\)\]\}]?/gi, "");
    textToParse = textToParse.replace(/\[Gambar\s*\d+[^\]]*\]/gi, "");

    // 2. Filter out non-answer lines (standalone image filenames, citations, conversational chatter)
    const lines = textToParse.split("\n").map((l) => l.trim()).filter((line) => {
      if (!line) return false;
      if (/^(?:Gambar_Soal_|soal_\d+)[\w\-\.]+/i.test(line)) return false;
      if (/^[\w\-\.]+\.(?:jpg|jpeg|png|webp|gif)$/i.test(line)) return false;
      if (/^\[?\s*(?:source|citation|sumber|lampiran|gambar)[\s\d\:\-_]*\]?$/i.test(line)) return false;
      if (/^(?:berikut(?:\s+adalah)?\s+jawaban|jawaban(?:\s+kuis)?\s*[\:\-]|semoga(?:\s+membantu)?|catatan[\:\-]|penjelasan[\:\-])/i.test(line)) return false;
      return true;
    });

    if (lines.length === 0) {
      alert("Teks jawaban tidak ditemukan.");
      return;
    }

    const rawQuestions = localStorage.getItem(STORAGE_QUESTIONS_KEY);
    const cachedQuestions = rawQuestions ? JSON.parse(rawQuestions) : [];

    const answers = [];
    let currentNum = 0;
    let listOffset = 0;

    lines.forEach((line) => {
      let qNum = "";
      let answerPart = "";

      const match = line.match(/^(?:Soal\s*|No\.?\s*)?(\d+)[\.\)\:\-]\s*([\s\S]+)/i);
      if (match) {
        const explicitNum = parseInt(match[1], 10);
        // Detect if numbering restarted from 1 mid-list due to an image chip/block break
        if (explicitNum <= currentNum && currentNum >= 3 && listOffset === 0) {
          listOffset = currentNum;
        }
        const actualNum = explicitNum + listOffset;
        qNum = String(actualNum);
        currentNum = actualNum;
        answerPart = match[2].trim();
      } else {
        // Line without explicit number: accept if it contains option letter (A-E) or True/False
        const hasOptionLetter = /(?:^|[\s,;&/]|dan|and)+([A-E])(?:\.|\b)/i.test(line);
        const isBoolean = /\b(?:true|false)\b/i.test(line);
        if (hasOptionLetter || isBoolean) {
          currentNum++;
          qNum = String(currentNum);
          answerPart = line;
        } else {
          return; // Ignore commentary/explanation lines
        }
      }

      let selectedIndex = undefined;
      let selectedIndices = [];
      let selectedText = answerPart;

      // Extract all option letters (e.g. "A. opcode dan D. operands", "A, D", "A dan D", "A & D", "A, C, D")
      const letterRegex = /(?:^|[\s,;&/]|dan|and)+([A-E])(?:\.|\b)/gi;
      let lMatch;
      const foundLetters = [];
      while ((lMatch = letterRegex.exec(answerPart)) !== null) {
        const char = lMatch[1].toUpperCase();
        if (!foundLetters.includes(char)) {
          foundLetters.push(char);
        }
      }

      if (foundLetters.length > 0) {
        foundLetters.forEach((char) => {
          const idx = char.charCodeAt(0) - 65;
          if (!selectedIndices.includes(idx)) {
            selectedIndices.push(idx);
          }
        });
        selectedIndex = selectedIndices[0];
        const firstSub = answerPart.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim();
        if (firstSub) selectedText = firstSub;
      } else if (/^true\b/i.test(answerPart)) {
        selectedText = "True";
        selectedIndex = 0;
        selectedIndices = [0];
      } else if (/^false\b/i.test(answerPart)) {
        selectedText = "False";
        selectedIndex = 1;
        selectedIndices = [1];
      }

      // Check against cachedQuestions
      if (cachedQuestions.length > 0) {
        const q = cachedQuestions.find((item) => item.number == qNum);
        if (q && q.options && q.options.length > 0) {
          if (q.type === "checkbox") {
            // For checkbox questions, also match option text in answerPart
            q.options.forEach((opt) => {
              const cleanOpt = opt.text.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
              if (cleanOpt.length >= 2) {
                const lowerAns = answerPart.toLowerCase();
                if (lowerAns.includes(cleanOpt)) {
                  if (!selectedIndices.includes(opt.index)) {
                    selectedIndices.push(opt.index);
                  }
                }
              }
            });
            if (selectedIndex === undefined && selectedIndices.length > 0) {
              selectedIndex = selectedIndices[0];
            }
          } else if (selectedIndex === undefined) {
            // For single-choice, only match text if no letter was found
            const matchedOpt = q.options.find((opt) => {
              const cleanOpt = opt.text.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
              const cleanAns = answerPart.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
              return cleanOpt.includes(cleanAns) || cleanAns.includes(cleanOpt);
            });
            if (matchedOpt) {
              selectedIndex = matchedOpt.index;
              selectedIndices = [matchedOpt.index];
            }
          }
        }
      }

      if (selectedIndices.length === 0 && selectedIndex !== undefined) {
        selectedIndices.push(selectedIndex);
      }

      answers.push({
        number: qNum,
        selectedIndex,
        selectedIndices,
        selectedText,
        explanation: line
      });
    });

    if (answers.length === 0) {
      alert("Tidak ditemukan format jawaban yang sesuai.");
      return;
    }

    localStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(answers));

    const printBtn = document.getElementById("moodle-ai-btn-print");
    const autofillBtn = document.getElementById("moodle-ai-btn-autofill");
    if (printBtn) printBtn.disabled = false;
    if (autofillBtn) autofillBtn.disabled = false;

    await applyCachedAnswersToCurrentPage(true);
    updateStatus(`${answers.length} jawaban berhasil diterapkan dan dipilih.`, "success");

    // If in Auto-Pilot mode, proceed to next page automatically
    if (isAutoPilotMode || sessionStorage.getItem(STORAGE_AUTOLOOP_KEY) === "true") {
      updateStatus("Jawaban diterapkan. Lanjut ke halaman berikutnya...", "loading");
      setTimeout(() => {
        proceedToNextPage();
      }, 1000);
    }
  }

  async function applyCachedAnswersToCurrentPage(showMessage = false) {
    const answers = getCachedAnswers();
    if (!answers || answers.length === 0) return;

    const answerMap = new Map();
    answers.forEach((a) => {
      if (a.number) answerMap.set(String(a.number), a);
      if (a.id) answerMap.set(String(a.id), a);
    });

    const currentQuestions = await extractQuestions(document, false);
    let appliedCount = 0;

    currentQuestions.forEach((q) => {
      const ans = answerMap.get(String(q.number)) || answerMap.get(String(q.id));
      if (!ans) return;

      const el = q.domElement || document.getElementById(q.id) || document.querySelector(`.que[id="${q.id}"]`) || document.querySelector(".que");
      if (!el) return;

      el.classList.add("moodle-ai-highlight");

      // 1. Radio (Pilihan Ganda)
      if (q.type === "radio") {
        const radios = el.querySelectorAll('.answer input[type="radio"]');
        let targetRadio = null;

        if (ans.selectedIndex !== undefined && radios[ans.selectedIndex]) {
          targetRadio = radios[ans.selectedIndex];
        } else if (ans.selectedText) {
          const cleanAns = ans.selectedText.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
          q.options.forEach((opt, idx) => {
            const cleanOpt = opt.text.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
            if (
              cleanOpt.includes(cleanAns) ||
              cleanAns.includes(cleanOpt) ||
              opt.text.toLowerCase().includes(ans.selectedText.toLowerCase())
            ) {
              targetRadio = radios[idx];
            }
          });
        }

        if (targetRadio) {
          targetRadio.checked = true;
          targetRadio.click();
          targetRadio.dispatchEvent(new Event("input", { bubbles: true }));
          targetRadio.dispatchEvent(new Event("change", { bubbles: true }));

          const lbl = el.querySelector(`label[for="${targetRadio.id}"]`) || targetRadio.closest("label");
          if (lbl) {
            lbl.click();
            lbl.classList.add("moodle-ai-option-highlight");
          }
          appliedCount++;
        }
      }

      // 2. Checkbox
      else if (q.type === "checkbox") {
        const checkboxes = el.querySelectorAll('.answer input[type="checkbox"]:not([name*="flagged"]), .ablock input[type="checkbox"]:not([name*="flagged"])');
        const indices = (ans.selectedIndices && ans.selectedIndices.length > 0)
          ? ans.selectedIndices
          : (ans.selectedIndex !== undefined ? [ans.selectedIndex] : []);

        checkboxes.forEach((cb, cbIdx) => {
          const shouldBeChecked = indices.includes(cbIdx);
          const lbl = el.querySelector(`label[for="${cb.id}"]`) || cb.closest("label");

          if (shouldBeChecked) {
            if (!cb.checked) {
              cb.click();
            }
            cb.checked = true;
            cb.dispatchEvent(new Event("input", { bubbles: true }));
            cb.dispatchEvent(new Event("change", { bubbles: true }));
            if (lbl) lbl.classList.add("moodle-ai-option-highlight");
          } else if (cb.checked) {
            cb.click();
            cb.checked = false;
            cb.dispatchEvent(new Event("input", { bubbles: true }));
            cb.dispatchEvent(new Event("change", { bubbles: true }));
            if (lbl) lbl.classList.remove("moodle-ai-option-highlight");
          }
        });
        if (indices.length > 0) appliedCount++;
      }

      // 3. Text
      else if (q.type === "text" && ans.textAnswer) {
        const input = el.querySelector('.answer input[type="text"]');
        if (input) {
          input.value = ans.textAnswer;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          appliedCount++;
        }
      }

      // 4. Select
      else if (q.type === "select" && ans.matches) {
        const selects = el.querySelectorAll(".answer select, table select");
        ans.matches.forEach((m) => {
          const sel = selects[m.selectIndex];
          if (sel) {
            const options = Array.from(sel.querySelectorAll("option")).filter((o) => o.value);
            if (options[m.choiceIndex]) {
              sel.value = options[m.choiceIndex].value;
              sel.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        });
        appliedCount++;
      }

      // 5. CodeRunner (Coding)
      else if (q.type === "coderunner" && (ans.codeAnswer || ans.textAnswer || ans.explanation)) {
        const codeToSet = ans.codeAnswer || ans.textAnswer || ans.explanation;
        setCodeRunnerAnswer(el, codeToSet);
        appliedCount++;
      }

      // Glass Explanation badge
      if (ans.explanation && !el.querySelector(".moodle-ai-explanation-badge")) {
        const badge = document.createElement("div");
        badge.className = "moodle-ai-explanation-badge";
        badge.innerHTML = `<strong>Jawaban Gemini:</strong> ${escapeHtml(ans.explanation)}`;
        const contentArea = el.querySelector(".content") || el;
        contentArea.appendChild(badge);
      }
    });

    if (showMessage) {
      updateStatus(`${appliedCount} soal pada halaman ini telah diisi.`, "success");
    }
  }

  function setCodeRunnerAnswer(queEl, code) {
    if (!queEl || !code) return;

    let cleanCode = code.trim();
    const match = cleanCode.match(/```(?:python|py|java|c|cpp)?\s*([\s\S]*?)```/i);
    if (match) {
      cleanCode = match[1].trim();
    }

    const textarea = queEl.querySelector("textarea.coderunner-answer, textarea.edit_code, textarea[name*='_answer']");
    if (textarea) {
      textarea.value = cleanCode;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const aceEl = queEl.querySelector(".ui_wrapper, .ace_editor");
    if (aceEl && window.ace) {
      try {
        const editor = window.ace.edit(aceEl);
        if (editor) {
          editor.setValue(cleanCode, -1);
        }
      } catch (_) {}
    }
  }

  async function startAutoFillLoop() {
    sessionStorage.setItem(STORAGE_AUTOLOOP_KEY, "true");
    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (toggle) toggle.checked = true;

    await applyCachedAnswersToCurrentPage(false);
    updateStatus("Mengisi halaman & lanjut otomatis...", "loading");

    setTimeout(() => {
      proceedToNextPage();
    }, 1100);
  }

  function proceedToNextPage() {
    // 1. Next button
    const nextBtn = document.querySelector(
      'input[name="next"], button[name="next"], input#mod_quiz-next-nav, .mod_quiz-next-nav, input[value*="Next"], input[value*="Selanjutnya"], input[value*="Next page"]'
    );

    if (nextBtn) {
      nextBtn.click();
      return;
    }

    // 2. Next question in navigation block
    const navNext = document.querySelector("#mod_quiz_navblock a.thispage + a.qnbutton");
    if (navNext) {
      navNext.click();
      return;
    }

    // 3. Finished all pages
    sessionStorage.removeItem(STORAGE_AUTOLOOP_KEY);
    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (toggle) toggle.checked = false;
    updateStatus("Seluruh soal kuis telah selesai diisi.", "success");
  }

  function renderAnswerModal() {
    const existing = document.getElementById("moodle-ai-modal-overlay");
    if (existing) existing.remove();

    const questionsRaw = localStorage.getItem(STORAGE_QUESTIONS_KEY);
    const answersRaw = localStorage.getItem(STORAGE_ANSWERS_KEY);

    if (!answersRaw) {
      alert("Belum ada jawaban tersimpan.");
      return;
    }

    const questions = questionsRaw ? JSON.parse(questionsRaw) : [];
    const answers = JSON.parse(answersRaw);

    let itemsHtml = "";
    let copyText = `=== KUNCI JAWABAN KUIS MOODLE ===\nTotal: ${answers.length} Soal\n\n`;

    answers.forEach((ans, idx) => {
      const qNum = ans.number || idx + 1;
      const q = questions.find((item) => item.number == qNum || item.id == ans.id);
      const qText = q ? q.question : "";

      let answerDisplay = "";
      if (ans.codeAnswer) {
        answerDisplay = ans.codeAnswer;
      } else if (ans.selectedIndices && ans.selectedIndices.length > 1 && q && q.options) {
        answerDisplay = ans.selectedIndices
          .map((i) => (q.options[i] ? `${String.fromCharCode(65 + i)}. ${q.options[i].text}` : `Pilihan ${i + 1}`))
          .join(" & ");
      } else if (ans.selectedText) {
        answerDisplay = ans.selectedText;
      } else if (ans.selectedIndex !== undefined && q && q.options && q.options[ans.selectedIndex]) {
        answerDisplay = q.options[ans.selectedIndex].text;
      } else if (ans.textAnswer) {
        answerDisplay = ans.textAnswer;
      } else {
        answerDisplay = `Pilihan ${(ans.selectedIndex ?? 0) + 1}`;
      }

      copyText += `No ${qNum}:\n${answerDisplay}\n`;
      if (ans.explanation) copyText += `Penjelasan: ${ans.explanation}\n`;
      copyText += `---------------------------------\n`;

      itemsHtml += `
        <div class="moodle-ai-answer-card">
          <div class="card-head">
            <span>Nomor ${qNum} ${q && q.type === "coderunner" ? "(CodeRunner)" : ""}</span>
          </div>
          ${qText ? `<div class="card-qtext">${escapeHtml(qText)}</div>` : ""}
          ${
            ans.codeAnswer
              ? `<div class="card-ans" style="background:#0f172a; color:#f8fafc; border-radius:8px; padding:10px;"><pre style="margin:0; white-space:pre-wrap; font-family:monospace; font-size:11px;">${escapeHtml(ans.codeAnswer)}</pre></div>`
              : `<div class="card-ans">Jawaban: <strong>${escapeHtml(answerDisplay)}</strong></div>`
          }
          ${ans.explanation ? `<div class="card-reason">${escapeHtml(ans.explanation)}</div>` : ""}
        </div>
      `;
    });

    const modalOverlay = document.createElement("div");
    modalOverlay.id = "moodle-ai-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="moodle-ai-modal">
        <div class="moodle-ai-modal-header">
          <h3>
            ${ICON_DOC}
            <span>Kunci Jawaban Kuis (${answers.length} Soal)</span>
          </h3>
          <button class="moodle-ai-btn-icon" id="moodle-ai-close-modal" style="color:#0f172a; background:rgba(0,0,0,0.06);">${ICON_CLOSE}</button>
        </div>
        <div class="moodle-ai-modal-body">
          ${itemsHtml}
        </div>
        <div class="moodle-ai-modal-footer">
          <button class="moodle-ai-btn-secondary" id="moodle-ai-copy-btn" style="width:auto; padding:8px 16px;">
            ${ICON_DOC}
            <span>Salin Jawaban</span>
          </button>
          <button class="moodle-ai-btn-primary" id="moodle-ai-print-btn" style="width:auto; padding:8px 16px;">
            ${ICON_CHECK}
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    document.getElementById("moodle-ai-close-modal").addEventListener("click", () => modalOverlay.remove());
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) modalOverlay.remove();
    });

    document.getElementById("moodle-ai-print-btn").addEventListener("click", () => {
      window.print();
    });

    document.getElementById("moodle-ai-copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(copyText).then(() => {
        alert("Semua kunci jawaban berhasil disalin.");
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function makeDraggable(element, handle) {
    let posX = 0,
      posY = 0,
      mouseX = 0,
      mouseY = 0;
    let startX = 0,
      startY = 0;
    let isDragging = false;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.tagName === "BUTTON" || e.target.closest("button") || e.target.tagName === "INPUT" || e.target.tagName === "LABEL") return;
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist > 4) {
        isDragging = true;
      }
      if (!isDragging) return;

      e.preventDefault();
      posX = mouseX - e.clientX;
      posY = mouseY - e.clientY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      element.style.top = element.offsetTop - posY + "px";
      element.style.left = element.offsetLeft - posX + "px";
      element.style.bottom = "auto";
      element.style.right = "auto";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;

      // If user clicked the minimized pill without dragging, expand the widget
      if (!isDragging && element.classList.contains("minimized")) {
        element.classList.remove("minimized");
        const minBtn = document.getElementById("moodle-ai-btn-min");
        if (minBtn) {
          minBtn.innerHTML = ICON_MINUS;
          minBtn.title = "Minimize";
        }
      }
    }
  }
})();
