document.addEventListener("DOMContentLoaded", () => {
  const delayInput = document.getElementById("delay");
  const saveBtn = document.getElementById("saveBtn");
  const openGeminiBtn = document.getElementById("openGeminiBtn");
  const statusMsg = document.getElementById("statusMessage");

  // Load saved settings
  chrome.storage.sync.get(["delay"], (data) => {
    if (data.delay) delayInput.value = data.delay;
  });

  function saveSettings(notify = true) {
    const delay = parseInt(delayInput.value, 10) || 2000;

    chrome.storage.sync.set({ delay }, () => {
      if (notify) showStatus("Pengaturan berhasil disimpan.", "success");
    });
  }

  saveBtn.addEventListener("click", () => saveSettings(true));

  openGeminiBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://gemini.google.com/app?hl=id" });
  });

  // GitHub Update Checker Logic (Version-based via manifest.json)
  const GITHUB_REPO = "ItzApipAjalah/moodle-ai";
  const GITHUB_RAW_MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/manifest.json`;
  const GITHUB_ZIP_URL = `https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip`;
  const CURRENT_VERSION = (typeof chrome !== "undefined" && chrome.runtime?.getManifest?.()?.version) || "1.2.0";

  const checkUpdateBtn = document.getElementById("popupCheckUpdateBtn");
  const updateStatusEl = document.getElementById("popupUpdateStatus");
  const updateActionsEl = document.getElementById("popupUpdateActions");
  const downloadZipBtn = document.getElementById("popupDownloadZipBtn");

  function isNewerVersion(remote, local) {
    if (!remote || !local) return false;
    const r = remote.split(".").map(n => parseInt(n, 10) || 0);
    const l = local.split(".").map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(r.length, l.length); i++) {
      const rv = r[i] || 0;
      const lv = l[i] || 0;
      if (rv > lv) return true;
      if (rv < lv) return false;
    }
    return false;
  }

  async function checkPopupGitHubUpdate() {
    if (updateStatusEl) updateStatusEl.textContent = `Versi: v${CURRENT_VERSION}. Memeriksa update...`;
    try {
      const res = await fetch(`${GITHUB_RAW_MANIFEST_URL}?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!res.ok) {
        if (updateStatusEl) updateStatusEl.textContent = `Status: HTTP ${res.status}`;
        return;
      }
      const remoteManifest = await res.json();
      const latestVersion = remoteManifest.version || "";

      const hasUpdate = isNewerVersion(latestVersion, CURRENT_VERSION);

      if (hasUpdate) {
        if (updateStatusEl) {
          updateStatusEl.innerHTML = `<span style="color:#b45309; font-weight:600;">Update Baru: v${escapeHtml(latestVersion)}</span> (aktif: v${escapeHtml(CURRENT_VERSION)})`;
        }
        if (updateActionsEl) updateActionsEl.style.display = "block";
      } else {
        if (updateStatusEl) {
          updateStatusEl.innerHTML = `<span style="color:#15803d; font-weight:600;">Versi Terbaru:</span> v${escapeHtml(CURRENT_VERSION)} (Sudah versi terbaru)`;
        }
        if (updateActionsEl) updateActionsEl.style.display = "none";
      }
    } catch (err) {
      if (updateStatusEl) updateStatusEl.textContent = `Error: ${err.message}`;
    }
  }

  if (checkUpdateBtn) {
    checkUpdateBtn.addEventListener("click", () => checkPopupGitHubUpdate());
  }

  if (downloadZipBtn) {
    downloadZipBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: GITHUB_ZIP_URL });
    });
  }

  // DGX / Jupyter Downloader Handlers
  const jupyterPdfBtn = document.getElementById("popupDownloadJupyterPdfBtn");
  const jupyterHtmlBtn = document.getElementById("popupDownloadJupyterHtmlBtn");
  const jupyterStatus = document.getElementById("popupJupyterStatus");

  function setJupyterStatus(text, type) {
    if (!jupyterStatus) return;
    jupyterStatus.textContent = text;
    jupyterStatus.style.display = "block";
    if (type === "loading") {
      jupyterStatus.style.background = "#eff6ff";
      jupyterStatus.style.color = "#1d4ed8";
    } else if (type === "success") {
      jupyterStatus.style.background = "#dcfce7";
      jupyterStatus.style.color = "#15803d";
    } else {
      jupyterStatus.style.background = "#fee2e2";
      jupyterStatus.style.color = "#b91c1c";
    }
    if (type !== "loading") {
      setTimeout(() => {
        jupyterStatus.style.display = "none";
      }, 4000);
    }
  }

  if (jupyterPdfBtn && window.JupyterDownloader) {
    jupyterPdfBtn.addEventListener("click", () => {
      window.JupyterDownloader.downloadPdf(setJupyterStatus);
    });
  }

  if (jupyterHtmlBtn && window.JupyterDownloader) {
    jupyterHtmlBtn.addEventListener("click", () => {
      window.JupyterDownloader.downloadHtml(setJupyterStatus);
    });
  }

  // Chat UI Handlers (Background Gemini Chat)
  const chatInput = document.getElementById("popupChatInput");
  const chatFilesInput = document.getElementById("popupChatFiles");
  const chatFileList = document.getElementById("popupChatFileList");
  const chatSendBtn = document.getElementById("popupChatSendBtn");
  const chatSendBtnText = document.getElementById("popupChatSendBtnText");
  const chatResult = document.getElementById("popupChatResult");
  const chatClearBtn = document.getElementById("popupChatClearBtn");

  if (chatFilesInput && chatFileList) {
    chatFilesInput.addEventListener("change", () => {
      const count = chatFilesInput.files.length;
      if (count > 0) {
        chatFileList.style.display = "block";
        const names = Array.from(chatFilesInput.files).map(f => f.name).join(", ");
        chatFileList.textContent = `File terpilih (${count}): ${names}`;
      } else {
        chatFileList.style.display = "none";
        chatFileList.textContent = "";
      }
    });
  }

  function renderFormattedMarkdown(text) {
    if (!text) return "";
    let escaped = escapeHtml(text);

    // Code blocks ```lang\ncode```
    escaped = escaped.replace(/```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      const trimmedCode = code.replace(/^\n+|\n+$/g, "");
      const langHeader = lang ? `<div style="font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">${lang}</div>` : "";
      return `<pre style="background:#0f172a; color:#f8fafc; padding:9px 12px; border-radius:6px; overflow-x:auto; font-size:11px; margin:8px 0; font-family:Consolas, Monaco, monospace; line-height:1.45;">${langHeader}<code>${trimmedCode}</code></pre>`;
    });

    // Inline code `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#0f172a; padding:1px 5px; border-radius:3px; font-size:11px; font-family:Consolas, Monaco, monospace;">$1</code>');

    // Headings
    escaped = escaped.replace(/^### (.*$)/gim, '<strong style="display:block; font-size:12.5px; margin:10px 0 3px; color:#1e293b;">$1</strong>');
    escaped = escaped.replace(/^## (.*$)/gim, '<strong style="display:block; font-size:13px; margin:11px 0 4px; color:#0f172a;">$1</strong>');
    escaped = escaped.replace(/^# (.*$)/gim, '<strong style="display:block; font-size:14px; margin:12px 0 5px; color:#0f172a;">$1</strong>');

    // Bold & Italic
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points
    escaped = escaped.replace(/^[•\*\-] (.*$)/gim, '<div style="margin-left:10px; display:flex; gap:6px;"><span style="color:#2563eb;">•</span><span>$1</span></div>');

    // Numbered lists e.g. 1.
    escaped = escaped.replace(/^(\d+)\. (.*$)/gim, '<div style="margin-left:6px; display:flex; gap:6px; margin-top:3px;"><span style="color:#2563eb; font-weight:700;">$1.</span><span>$2</span></div>');

    // Handle paragraphs outside <pre>
    const parts = escaped.split(/(<pre[\s\S]*?<\/pre>)/gi);
    const formatted = parts.map(part => {
      if (part.startsWith("<pre")) return part;
      return part.replace(/\n{2,}/g, '<div style="height:6px;"></div>').replace(/\n/g, '<br>');
    }).join("");

    return formatted;
  }

  function renderChatState(state) {
    if (!state) return;

    if (state.status === "loading") {
      if (chatResult) {
        chatResult.style.display = "block";
        chatResult.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; color:#2563eb; font-weight:500;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span>Gemini sedang berpikir dan memproses di background...</span>
          </div>
        `;
      }
      if (chatSendBtn) chatSendBtn.disabled = true;
      if (chatSendBtnText) chatSendBtnText.textContent = "Memproses...";
      if (chatClearBtn) chatClearBtn.style.display = "inline";
    } else if (state.status === "done") {
      if (chatResult) {
        chatResult.style.display = "block";
        const formattedHtml = renderFormattedMarkdown(state.answer || "(Tidak ada jawaban yang diterima)");
        chatResult.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:7px;">
            <span style="font-weight:600; color:#1e40af; font-size:11px;">Jawaban AI Gemini:</span>
            <button type="button" id="copyChatResultBtn" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; font-size:10.5px; padding:2px 8px; cursor:pointer; color:#334155;">Salin Teks</button>
          </div>
          <div id="chatResultBody">${formattedHtml}</div>
        `;

        const copyBtn = document.getElementById("copyChatResultBtn");
        if (copyBtn) {
          copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(state.answer || "").then(() => {
              copyBtn.textContent = "Disalin!";
              setTimeout(() => { copyBtn.textContent = "Salin Teks"; }, 2000);
            });
          });
        }
      }
      if (chatSendBtn) chatSendBtn.disabled = false;
      if (chatSendBtnText) chatSendBtnText.textContent = "Kirim ke Gemini";
      if (chatClearBtn) chatClearBtn.style.display = "inline";
    }
  }

  // Bersihkan badge notifikasi saat popup dibuka
  try {
    if (chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ text: "" });
    }
  } catch (_) {}

  // Cek chatState tersimpan ketika popup dibuka
  chrome.storage.local.get(["chatState"], (res) => {
    if (res.chatState) {
      renderChatState(res.chatState);
    }
  });

  // Pantau update storage secara real-time
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.chatState) {
      renderChatState(changes.chatState.newValue);
    }
  });

  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", async () => {
      const prompt = chatInput ? chatInput.value.trim() : "";
      const hasFiles = chatFilesInput && chatFilesInput.files && chatFilesInput.files.length > 0;

      if (!prompt && !hasFiles) {
        showStatus("Ketik pertanyaan atau pilih file terlebih dahulu.", "error");
        return;
      }

      // Render file jadi data URL
      const files = [];
      if (hasFiles) {
        const readFile = (file) => new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res({ name: file.name, type: file.type, dataUrl: reader.result });
          reader.readAsDataURL(file);
        });
        for (const f of chatFilesInput.files) {
          files.push(await readFile(f));
        }
      }

      // Update state loading
      renderChatState({ status: "loading" });

      // Kirim ke background service worker
      chrome.runtime.sendMessage({
        action: "START_CHAT",
        prompt: prompt || "Tolong analisis file terlampir berikut secara detail dan jelas.",
        files: files
      });
    });
  }

  if (chatClearBtn) {
    chatClearBtn.addEventListener("click", () => {
      chrome.storage.local.remove(["chatState"]);
      if (chatResult) {
        chatResult.innerHTML = "";
        chatResult.style.display = "none";
      }
      chatClearBtn.style.display = "none";
      if (chatInput) chatInput.value = "";
      if (chatFilesInput) chatFilesInput.value = "";
      if (chatFileList) {
        chatFileList.style.display = "none";
        chatFileList.textContent = "";
      }
      if (chatSendBtn) chatSendBtn.disabled = false;
      if (chatSendBtnText) chatSendBtnText.textContent = "Kirim ke Gemini";
    });
  }

  checkPopupGitHubUpdate();

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function showStatus(text, type) {
    statusMsg.textContent = text;
    statusMsg.className = `status-msg ${type}`;
    statusMsg.style.display = "block";
    setTimeout(() => {
      statusMsg.style.display = "none";
    }, 3000);
  }
});
