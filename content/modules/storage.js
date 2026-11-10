// Moodle AI Solver - Storage & Cache Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // Retrieve parsed answers from localStorage
  app.getCachedAnswers = function () {
    try {
      const raw = localStorage.getItem(app.STORAGE_ANSWERS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  // Reset all cached questions, answers, and auto-loop states
  app.clearAllCache = function () {
    localStorage.removeItem(app.STORAGE_QUESTIONS_KEY);
    localStorage.removeItem(app.STORAGE_ANSWERS_KEY);
    sessionStorage.removeItem(app.STORAGE_AUTOLOOP_KEY);

    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (toggle) toggle.checked = false;

    const printBtn = document.getElementById("moodle-ai-btn-print");
    const autofillBtn = document.getElementById("moodle-ai-btn-autofill");
    if (printBtn) printBtn.disabled = true;
    if (autofillBtn) autofillBtn.disabled = true;

    app.updateStatus("Data cache kuis berhasil direset.", "ready");
  };

  // Check cached answers on page load and auto-fill / auto-next if auto-pilot loop is active
  app.checkCachedAnswersOnLoad = async function () {
    const isAutoLoopActive = sessionStorage.getItem(app.STORAGE_AUTOLOOP_KEY) === "true";
    const answers = app.getCachedAnswers();

    if (answers && answers.length > 0) {
      await app.applyCachedAnswersToCurrentPage(false);

      if (isAutoLoopActive) {
        if (window.location.href.includes("summary.php") || !document.querySelector(".que")) {
          sessionStorage.removeItem(app.STORAGE_AUTOLOOP_KEY);
          app.updateStatus("Semua halaman soal selesai diisi.", "success");
          return;
        }

        app.updateStatus("Mengisi halaman ini secara otomatis...", "loading");
        setTimeout(() => {
          app.proceedToNextPage();
        }, 1100);
      }
    }
  };
})(window.MoodleAI);

