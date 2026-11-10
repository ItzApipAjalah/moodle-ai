// Moodle AI Solver - 1-Click Auto-Pilot Workflow & Background Bridge Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // Initialize background message listener for Auto-Pilot response (with mobile fallback)
  app.initAutoPilotListener = function () {
    // 1. Runtime message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "AUTO_PILOT_EXECUTE") {
        console.log(
          "%c[Moodle AI]%c Jawaban AI diterima, menerapkan ke kuis...",
          "background:#10b981; color:#fff; padding:2px 6px; border-radius:3px; font-weight:bold;",
          "color:#0f172a; font-weight:bold;"
        );
        chrome.storage.local.remove(["pendingAnswersText"]);
        app.updateStatus("Menerapkan jawaban AI...", "loading");
        app.parseAndApplyPastedAnswers(message.answersText, true);
        sendResponse({ success: true });
      }
    });

    // 2. Mobile tab focus / visibility fallback (Android sleeping tab recovery)
    const checkPendingAnswers = () => {
      chrome.storage.local.get(["pendingAnswersText"], (data) => {
        if (data && data.pendingAnswersText) {
          console.log("[Moodle AI] Mengambil jawaban tertunda dari storage (Mobile Fallback)...");
          chrome.storage.local.remove(["pendingAnswersText"]);
          app.updateStatus("Menerapkan jawaban AI...", "loading");
          app.parseAndApplyPastedAnswers(data.pendingAnswersText, true);
        }
      });
    };

    window.addEventListener("focus", checkPendingAnswers);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkPendingAnswers();
    });
  };

  // 1-Click Auto-Pilot Master Function
  app.startFullAutoPilot = async function () {
    if (app.state.isWorking) return;
    app.state.isWorking = true;

    const runBtn = document.getElementById("moodle-ai-btn-autopilot-run");
    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (runBtn) runBtn.disabled = true;
    if (toggle) toggle.checked = true;

    sessionStorage.setItem(app.STORAGE_AUTOLOOP_KEY, "true");
    app.updateStatus("Mengumpulkan soal kuis & mengunduh gambar...", "loading");

    try {
      const allQuestions = await app.collectAllQuizQuestions();
      if (allQuestions.length === 0) {
        app.updateStatus("Tidak ditemukan soal kuis.", "error");
        app.state.isWorking = false;
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

      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      app.updateStatus(
        isMobile
          ? "Membuka Gemini... AI sedang menjawab, akan otomatis kembali."
          : allImages.length > 0
          ? `Menjalankan Gemini di background (${allImages.length} gambar)...`
          : "Menjalankan Gemini di background (tidak terlihat). Menunggu AI menjawab...",
        "loading"
      );

      // Send prompt AND images to background service worker
      chrome.runtime.sendMessage({
        action: "START_AUTO_PILOT",
        prompt: prompt,
        images: allImages
      });

      app.state.isWorking = false;
      if (runBtn) runBtn.disabled = false;
    } catch (err) {
      app.state.isWorking = false;
      if (runBtn) runBtn.disabled = false;
      app.updateStatus(`Gagal: ${err.message}`, "error");
    }
  };

  // Cancel currently running background processes
  app.cancelActiveWork = function () {
    chrome.runtime.sendMessage({ action: "CANCEL_AUTO_PILOT" });
    if (app.state.activeAbortController) {
      app.state.activeAbortController.abort();
      app.state.activeAbortController = null;
    }
    if (app.state.timerInterval) {
      clearInterval(app.state.timerInterval);
      app.state.timerInterval = null;
    }
    app.state.isWorking = false;
    const runBtn = document.getElementById("moodle-ai-btn-autopilot-run");
    if (runBtn) runBtn.disabled = false;
    const cancelBtn = document.getElementById("moodle-ai-btn-cancel");
    if (cancelBtn) cancelBtn.style.display = "none";
    app.updateStatus("Proses dibatalkan.", "ready");
  };
})(window.MoodleAI);

