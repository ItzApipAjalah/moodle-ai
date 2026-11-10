// Moodle AI Solver - Floating UI Widget & Modal Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // Update status notification bar inside the floating widget
  app.updateStatus = function (text, type = "ready") {
    const box = document.getElementById("moodle-ai-status");
    if (!box) return;
    box.className = `moodle-ai-status-box ${type}`;

    let iconHtml = app.ICONS.CHECK;
    if (type === "loading") {
      iconHtml = app.ICONS.SPINNER;
    } else if (type === "error") {
      iconHtml = app.ICONS.CLOSE;
    }

    const indicator = box.querySelector(".moodle-ai-status-indicator");
    if (indicator) indicator.innerHTML = iconHtml;

    const textEl = box.querySelector(".moodle-ai-status-text");
    if (textEl) textEl.textContent = text;
  };

  // Render the modal showing all quiz answers with copy and print options
  app.renderAnswerModal = function () {
    const existing = document.getElementById("moodle-ai-modal-overlay");
    if (existing) existing.remove();

    const questionsRaw = localStorage.getItem(app.STORAGE_QUESTIONS_KEY);
    const answersRaw = localStorage.getItem(app.STORAGE_ANSWERS_KEY);

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
          .map((i) =>
            q.options[i] ? `${String.fromCharCode(65 + i)}. ${q.options[i].text}` : `Pilihan ${i + 1}`
          )
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
          ${qText ? `<div class="card-qtext">${app.escapeHtml(qText)}</div>` : ""}
          ${
            ans.codeAnswer
              ? `<div class="card-ans" style="background:#0f172a; color:#f8fafc; border-radius:8px; padding:10px;"><pre style="margin:0; white-space:pre-wrap; font-family:monospace; font-size:11px;">${app.escapeHtml(ans.codeAnswer)}</pre></div>`
              : `<div class="card-ans">Jawaban: <strong>${app.escapeHtml(answerDisplay)}</strong></div>`
          }
          ${ans.explanation ? `<div class="card-reason">${app.escapeHtml(ans.explanation)}</div>` : ""}
        </div>
      `;
    });

    const modalOverlay = document.createElement("div");
    modalOverlay.id = "moodle-ai-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="moodle-ai-modal">
        <div class="moodle-ai-modal-header">
          <h3>
            ${app.ICONS.DOC}
            <span>Kunci Jawaban Kuis (${answers.length} Soal)</span>
          </h3>
          <button class="moodle-ai-btn-icon" id="moodle-ai-close-modal" style="color:#0f172a; background:rgba(0,0,0,0.06);">${app.ICONS.CLOSE}</button>
        </div>
        <div class="moodle-ai-modal-body">
          ${itemsHtml}
        </div>
        <div class="moodle-ai-modal-footer">
          <button class="moodle-ai-btn-secondary" id="moodle-ai-copy-btn" style="width:auto; padding:8px 16px;">
            ${app.ICONS.DOC}
            <span>Salin Jawaban</span>
          </button>
          <button class="moodle-ai-btn-primary" id="moodle-ai-print-btn" style="width:auto; padding:8px 16px;">
            ${app.ICONS.CHECK}
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
  };

  // Build and inject floating widget into page DOM
  app.initWidget = function () {
    const isQuizPage = document.querySelector(".que") || window.location.href.includes("/mod/quiz/");
    if (!isQuizPage) return;

    const cachedAnswers = app.getCachedAnswers();
    const hasAnswers = cachedAnswers && cachedAnswers.length > 0;
    const isAutoLoopActive = sessionStorage.getItem(app.STORAGE_AUTOLOOP_KEY) === "true";

    const widget = document.createElement("div");
    widget.id = "moodle-ai-widget";
    widget.innerHTML = `
      <style>
        @keyframes moodleSpin { 100% { transform: rotate(360deg); } }
      </style>
      <div class="moodle-ai-header" id="moodle-ai-drag-handle">
        <div class="moodle-ai-title-wrap">
          <span class="moodle-ai-header-icon">${app.ICONS.AI}</span>
          <span class="moodle-ai-title">Moodle AI Solver</span>
        </div>
        <div class="moodle-ai-controls">
          <button class="moodle-ai-btn-icon" id="moodle-ai-btn-min" title="Minimize">${app.ICONS.MINUS}</button>
        </div>
      </div>
      <div class="moodle-ai-body">
        <div class="moodle-ai-status-box ready" id="moodle-ai-status">
          <div class="moodle-ai-status-indicator">${app.ICONS.CHECK}</div>
          <span class="moodle-ai-status-text">
            ${
              hasAnswers
                ? `${cachedAnswers.length} jawaban siap di penyimpanan lokal.`
                : "Sistem siap mendeteksi dan menjawab kuis."
            }
          </span>
        </div>

        <!-- GitHub Update Notification Banner -->
        <div id="moodle-ai-update-box" style="display:none; margin-bottom:10px;"></div>

        <!-- 1-Click Auto-Pilot Hero Toggle Card -->
        <div class="moodle-ai-autopilot-card">
          <div class="moodle-ai-autopilot-info">
            <span class="moodle-ai-autopilot-label">
              ${app.ICONS.ZAP}
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
            ${app.ICONS.ZAP}
            <span id="moodle-ai-btn-autopilot-label">Jalankan Auto-Pilot (Web Gemini)</span>
          </button>

          <button class="moodle-ai-btn-secondary" id="moodle-ai-btn-cancel" style="display:none; background:rgba(254, 242, 242, 0.85); color:#b91c1c; border-color:rgba(252, 165, 165, 0.7);">
            ${app.ICONS.CLOSE}
            <span>Batalkan Proses</span>
          </button>

          <div class="moodle-ai-sub-actions">
            <button class="moodle-ai-btn-secondary" id="moodle-ai-btn-print" ${hasAnswers ? "" : "disabled"}>
              ${app.ICONS.DOC}
              <span>Lihat Kunci</span>
            </button>
            <button class="moodle-ai-btn-success" id="moodle-ai-btn-autofill" ${hasAnswers ? "" : "disabled"}>
              ${app.ICONS.CHECK}
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
              ${app.ICONS.TRASH}
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
            <button type="button" class="moodle-ai-link-btn" id="moodle-ai-btn-check-update" title="Periksa pembaruan dari GitHub">
              ${app.ICONS.REFRESH}
              <span>Cek Update</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Event listeners
    const autoPilotBtn = document.getElementById("moodle-ai-btn-autopilot-run");
    const autoPilotToggle = document.getElementById("moodle-ai-autopilot-toggle");

    autoPilotBtn.addEventListener("click", () => app.startFullAutoPilot());

    autoPilotToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        app.startFullAutoPilot();
      } else {
        sessionStorage.removeItem(app.STORAGE_AUTOLOOP_KEY);
        app.updateStatus("Mode Auto-Pilot dimatikan.", "ready");
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
        alert("Gunakan shortcut Ctrl+V (atau tekan lama area teks di HP) untuk menempelkan teks jawaban.");
      }
    });

    document.getElementById("moodle-ai-btn-apply-paste").addEventListener("click", () => {
      const rawText = document.getElementById("moodle-ai-paste-text").value.trim();
      if (!rawText) return alert("Silakan tempel teks jawaban terlebih dahulu.");
      app.parseAndApplyPastedAnswers(rawText, false);
    });

    document.getElementById("moodle-ai-btn-cancel").addEventListener("click", () => app.cancelActiveWork());
    document.getElementById("moodle-ai-btn-print").addEventListener("click", () => app.renderAnswerModal());
    document.getElementById("moodle-ai-btn-autofill").addEventListener("click", () => app.startAutoFillLoop());
    document
      .getElementById("moodle-ai-btn-fill-page")
      .addEventListener("click", () => app.applyCachedAnswersToCurrentPage(true));
    document.getElementById("moodle-ai-btn-clear").addEventListener("click", () => app.clearAllCache());

    const minBtn = document.getElementById("moodle-ai-btn-min");
    const header = document.getElementById("moodle-ai-drag-handle");

    const toggleMinimize = (e) => {
      if (e) e.stopPropagation();
      const isMin = widget.classList.toggle("minimized");
      minBtn.innerHTML = isMin ? app.ICONS.PLUS : app.ICONS.MINUS;
      minBtn.title = isMin ? "Buka Moodle AI Solver" : "Minimize";
    };

    minBtn.addEventListener("click", toggleMinimize);

    // Clicking anywhere on the minimized pill expands it back
    header.addEventListener("click", (e) => {
      if (widget.classList.contains("minimized")) {
        toggleMinimize(e);
      }
    });

    app.makeDraggable(widget, header);

    document.getElementById("moodle-ai-btn-check-update")?.addEventListener("click", () => {
      app.checkGitHubUpdate(true);
    });

    // Auto-check for updates silently on load
    setTimeout(() => {
      app.checkGitHubUpdate(false);
    }, 1500);
  };
})(window.MoodleAI);

