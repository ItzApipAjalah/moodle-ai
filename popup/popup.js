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

  // Check update silently on popup open
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
