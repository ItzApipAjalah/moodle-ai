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

  // GitHub Update Checker Logic
  const GITHUB_REPO = "ItzApipAjalah/moodle-ai";
  const CURRENT_COMMIT_SHA = "d01fc4d3c9bcfdb71facafeacca1da4c6d500835";
  const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`;
  const GITHUB_ZIP_URL = `https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip`;

  const checkUpdateBtn = document.getElementById("popupCheckUpdateBtn");
  const updateStatusEl = document.getElementById("popupUpdateStatus");
  const updateActionsEl = document.getElementById("popupUpdateActions");
  const downloadZipBtn = document.getElementById("popupDownloadZipBtn");

  async function checkPopupGitHubUpdate() {
    if (updateStatusEl) updateStatusEl.textContent = "Memeriksa commit GitHub...";
    try {
      const res = await fetch(GITHUB_API_URL, {
        headers: { Accept: "application/vnd.github.v3+json" }
      });
      if (!res.ok) {
        if (updateStatusEl) updateStatusEl.textContent = `Status: HTTP ${res.status}`;
        return;
      }
      const commits = await res.json();
      if (!commits || !commits[0]) return;

      const latestCommit = commits[0];
      const latestSha = latestCommit.sha;
      const shortSha = latestSha.substring(0, 7);
      const commitMsg = (latestCommit.commit.message || "").split("\n")[0];

      const hasUpdate = !latestSha.toLowerCase().startsWith(CURRENT_COMMIT_SHA.substring(0, 7).toLowerCase());

      if (hasUpdate) {
        if (updateStatusEl) {
          updateStatusEl.innerHTML = `<span style="color:#b45309; font-weight:600;">Update Baru!</span> <code>${shortSha}</code>: ${escapeHtml(commitMsg)}`;
        }
        if (updateActionsEl) updateActionsEl.style.display = "block";
      } else {
        if (updateStatusEl) {
          updateStatusEl.innerHTML = `<span style="color:#15803d; font-weight:600;">Versi Terbaru:</span> <code>${shortSha}</code> (${escapeHtml(commitMsg)})`;
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
