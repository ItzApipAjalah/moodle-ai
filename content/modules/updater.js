// Moodle AI Solver - GitHub Version & Update Checker Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // Check for updates by fetching manifest.json from GitHub raw URL
  app.checkGitHubUpdate = async function (isManual = false) {
    if (isManual) app.updateStatus("Memeriksa pembaruan di GitHub...", "loading");

    try {
      const cached = sessionStorage.getItem("moodle_ai_gh_update_check");
      if (cached && !isManual) {
        const data = JSON.parse(cached);
        if (data && data.hasUpdate) {
          app.renderUpdateBanner(data.versionInfo);
        }
        return;
      }

      const res = await fetch(`${app.GITHUB_RAW_MANIFEST_URL}?t=${Date.now()}`, {
        cache: "no-store"
      });

      if (!res.ok) {
        if (isManual) app.updateStatus(`Gagal cek update: HTTP ${res.status}`, "error");
        return;
      }

      const remoteManifest = await res.json();
      const latestVersion = remoteManifest.version || "";
      const hasUpdate = app.isNewerVersion(latestVersion, app.CURRENT_VERSION);

      const versionInfo = {
        latestVersion,
        currentVersion: app.CURRENT_VERSION
      };

      sessionStorage.setItem(
        "moodle_ai_gh_update_check",
        JSON.stringify({
          hasUpdate,
          versionInfo,
          timestamp: Date.now()
        })
      );

      if (hasUpdate) {
        app.renderUpdateBanner(versionInfo);
        if (isManual) app.updateStatus(`Pembaruan versi baru (v${latestVersion}) ditemukan!`, "success");
      } else {
        if (isManual) app.updateStatus(`Ekstensi Anda sudah versi terbaru (v${app.CURRENT_VERSION}).`, "success");
      }
    } catch (err) {
      if (isManual) app.updateStatus(`Gagal cek update: ${err.message}`, "error");
    }
  };

  // Render the update notification banner into the widget
  app.renderUpdateBanner = function (info) {
    const box = document.getElementById("moodle-ai-update-box");
    if (!box) return;
    box.style.display = "block";
    box.innerHTML = `
      <div class="moodle-ai-update-banner">
        <div class="moodle-ai-update-top">
          <span class="moodle-ai-update-badge">
            ${app.ICONS.ZAP} Update Tersedia: v${app.escapeHtml(info.latestVersion)}
          </span>
          <span class="moodle-ai-update-date">Aktif: v${app.escapeHtml(info.currentVersion)}</span>
          <button class="moodle-ai-btn-icon" id="moodle-ai-btn-dismiss-update" title="Tutup pemberitahuan" style="margin-left:auto; padding:2px; color:#78350f; background:rgba(217, 119, 6, 0.15); border:none;">
            ${app.ICONS.CLOSE}
          </button>
        </div>
        <div class="moodle-ai-update-commit">
          Versi baru <strong>v${app.escapeHtml(info.latestVersion)}</strong> telah dirilis di GitHub. Perbarui ekstensi Anda untuk mendapatkan fitur dan perbaikan terbaru.
        </div>
        <div class="moodle-ai-update-actions">
          <button type="button" class="moodle-ai-btn-update-download" id="moodle-ai-btn-download-zip">
            ${app.ICONS.DOWNLOAD}
            <span>Unduh Update (.ZIP)</span>
          </button>
          <a class="moodle-ai-btn-update-link" href="${app.GITHUB_REPO_URL}" target="_blank" rel="noopener noreferrer">
            Buka Repositori
          </a>
        </div>
      </div>
    `;

    document.getElementById("moodle-ai-btn-download-zip")?.addEventListener("click", () => {
      window.open(app.GITHUB_ZIP_URL, "_blank");
      app.updateStatus("Unduhan ZIP dimulai. Ekstrak & reload ekstensi di chrome://extensions.", "success");
    });

    document.getElementById("moodle-ai-btn-dismiss-update")?.addEventListener("click", () => {
      box.style.display = "none";
    });
  };
})(window.MoodleAI);

