// Script running on https://gemini.google.com to auto-paste Moodle questions & auto-extract answers

(function () {
  chrome.storage.local.get(
    ["pendingGeminiPrompt", "pendingGeminiImages", "moodleTabId", "autoPilot"],
    async (data) => {
      const promptText = data.pendingGeminiPrompt;
      if (!promptText) return;

      const images = data.pendingGeminiImages || [];
      const moodleTabId = data.moodleTabId;
      const isAutoPilot = !!data.autoPilot;

      chrome.storage.local.remove(["pendingGeminiPrompt", "pendingGeminiImages"]);

      let attempts = 0;
      const maxAttempts = 60;

      const checkInterval = setInterval(async () => {
        attempts++;
        const editor = document.querySelector(
          'rich-textarea .ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"]'
        );

        if (editor) {
          clearInterval(checkInterval);

          if (images.length > 0) {
            await attachImagesToGemini(editor, images);
          }

          insertAndSend(editor, promptText, moodleTabId, isAutoPilot);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn("Moodle Solver: Kolom input Gemini tidak ditemukan.");
        }
      }, 500);
    }
  );

  async function attachImagesToGemini(editor, images) {
    if (!images || images.length === 0) return;

    showGlassToast(`Mengunggah ${images.length} gambar soal ke Gemini...`, "loading");

    const files = images
      .map((img, i) => {
        if (!img.dataUrl) return null;
        const filename = img.alt || `soal_${img.qNum || i + 1}_gambar_${i + 1}.jpg`;
        return dataURLtoFile(img.dataUrl, filename);
      })
      .filter(Boolean);

    if (files.length === 0) return;

    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));

    // 1. Check for file input element in Gemini DOM
    let fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      try {
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        fileInput.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (_) {}
    }

    // 2. Dispatch synthetic paste event on rich-textarea
    editor.focus();
    try {
      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dt
      });
      editor.dispatchEvent(pasteEvent);
    } catch (_) {}

    // 3. Dispatch drag-and-drop on dropzone or main text input container
    try {
      const dropZone =
        document.querySelector('div[xapfileselectordropzone], .text-input-field, rich-textarea') || editor;
      const dropEvent = new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      dropZone.dispatchEvent(dropEvent);
    } catch (_) {}

    // Give Gemini Web time to process the image attachment thumbnails
    await new Promise((resolve) => setTimeout(resolve, 1800));
  }

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(",");
    const mime = (arr[0].match(/:(.*?);/) || [])[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  function insertAndSend(editor, text, moodleTabId, isAutoPilot) {
    editor.focus();

    setTimeout(() => {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      sel.removeAllRanges();
      sel.addRange(range);

      const inserted = document.execCommand("insertText", false, text);

      if (!inserted || editor.innerText.trim() === "") {
        editor.innerHTML = `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;
        editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      }

      editor.dispatchEvent(new Event("input", { bubbles: true }));
      editor.dispatchEvent(new Event("change", { bubbles: true }));

      showGlassToast("Soal berhasil ditempelkan. Mengirim ke Gemini...", "info");

      // Submit prompt
      setTimeout(() => {
        const sendBtn = document.querySelector(
          'button[aria-label*="Kirim"], button[aria-label*="Send"], button.send-button, [data-test-id="send-button"], .send-button-container button'
        );

        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
        } else {
          if (sendBtn) {
            sendBtn.removeAttribute("disabled");
            sendBtn.click();
          }
          const enterDown = new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          });
          editor.dispatchEvent(enterDown);

          const enterUp = new KeyboardEvent("keyup", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          });
          editor.dispatchEvent(enterUp);
        }

        if (isAutoPilot && moodleTabId) {
          showGlassToast("Auto-Pilot Aktif: Menunggu respon Gemini...", "loading");
          waitForGeminiCompletionAndReturn(moodleTabId);
        } else {
          addCopyAnswerHelper();
        }
      }, 700);
    }, 400);
  }

  function extractCleanGeminiText(responseEl) {
    if (!responseEl) return "";

    // Temporarily hide citation chips, buttons, and grounding tags in the live element
    // so that innerText preserves all line breaks without including chip text
    const chips = responseEl.querySelectorAll(
      "source-chip, citation-chip, inline-citation, attachment-chip, grounding-chip, sources-carousel, mat-chip, button, .citation, .source-chip, .sources-container, .grounding-container, [class*='citation'], [class*='source-chip'], [class*='grounding']"
    );

    const prevDisplays = [];
    chips.forEach((c) => {
      prevDisplays.push({ el: c, display: c.style.display });
      c.style.display = "none";
    });

    // Read innerText directly from the live attached element (preserves \n between list items!)
    let text = responseEl.innerText || "";

    // Restore original display styles
    prevDisplays.forEach(({ el, display }) => {
      el.style.display = display;
    });

    if (!text) {
      text = responseEl.textContent || "";
    }

    // Clean inline file references while strictly preserving newlines (\r?\n)
    text = text.replace(/[\(\[\{]?[ \t]*Gambar_Soal_[^\r\n\)\]\}]+[ \t]*[\)\]\}]?/gi, "");
    text = text.replace(/[\(\[\{]?[ \t]*soal_\d+_[^\r\n\)\]\}]+\.(?:jpg|jpeg|png|webp|gif)[ \t]*[\)\]\}]?/gi, "");
    text = text.replace(/[\(\[\{]?[ \t]*[\w\-_]+\.(?:jpg|jpeg|png|webp|gif)[ \t]*[\)\]\}]?/gi, "");
    text = text.replace(/\[Gambar\s*\d+[^\]]*\]/gi, "");

    return text.trim();
  }

  function waitForGeminiCompletionAndReturn(moodleTabId) {
    let stableChecks = 0;
    let lastText = "";
    let checkCount = 0;
    const maxWaitChecks = 120; // up to 60 seconds

    const pollInterval = setInterval(() => {
      checkCount++;

      // Find all model responses and get the latest clean text
      const responses = document.querySelectorAll(
        "model-response message-content, message-content, .model-response-text, [data-test-id='model-response']"
      );

      let currentText = "";
      if (responses.length > 0) {
        currentText = extractCleanGeminiText(responses[responses.length - 1]);
      }

      // Check if stop button is present (meaning still streaming)
      const stopBtn = document.querySelector(
        'button[aria-label*="Hentikan"], button[aria-label*="Stop"], button.stop-button, [data-test-id="stop-button"]'
      );

      const hasContent = currentText.length > 15;
      const isTextSame = currentText === lastText && currentText.length > 0;

      if (hasContent && isTextSame && !stopBtn) {
        stableChecks++;
      } else {
        stableChecks = 0;
      }

      lastText = currentText;

      // When text has been completely stable for 3 checks (~1.8 seconds) and stop button is gone
      if (stableChecks >= 3 && hasContent) {
        clearInterval(pollInterval);
        showGlassToast("Jawaban selesai diterima. Kembali ke kuis Moodle...", "success");

        setTimeout(() => {
          chrome.runtime.sendMessage({
            action: "AUTO_PILOT_ANSWER_READY",
            text: currentText,
            moodleTabId: moodleTabId
          });
        }, 500);
      } else if (checkCount >= maxWaitChecks) {
        clearInterval(pollInterval);
        if (currentText.length > 0) {
          chrome.runtime.sendMessage({
            action: "AUTO_PILOT_ANSWER_READY",
            text: currentText,
            moodleTabId: moodleTabId
          });
        } else {
          showGlassToast("Batas waktu menunggu respon terlampaui.", "error");
        }
      }
    }, 600);
  }

  function addCopyAnswerHelper() {
    if (document.getElementById("moodle-copy-helper-btn")) return;

    const btn = document.createElement("button");
    btn.id = "moodle-copy-helper-btn";
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
      <span>Salin Jawaban ke Moodle</span>
    `;
    btn.style.position = "fixed";
    btn.style.bottom = "85px";
    btn.style.right = "24px";
    btn.style.zIndex = "9999999";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.gap = "8px";
    btn.style.padding = "10px 18px";
    btn.style.background = "rgba(16, 185, 129, 0.85)";
    btn.style.backdropFilter = "blur(12px)";
    btn.style.webkitBackdropFilter = "blur(12px)";
    btn.style.color = "#ffffff";
    btn.style.border = "1px solid rgba(255, 255, 255, 0.3)";
    btn.style.borderRadius = "30px";
    btn.style.fontWeight = "600";
    btn.style.fontSize = "13px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 8px 32px rgba(16, 185, 129, 0.35)";
    btn.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    btn.style.transition = "all 0.2s ease";

    btn.onmouseover = () => {
      btn.style.transform = "translateY(-2px)";
      btn.style.boxShadow = "0 12px 36px rgba(16, 185, 129, 0.45)";
    };
    btn.onmouseout = () => {
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow = "0 8px 32px rgba(16, 185, 129, 0.35)";
    };

    btn.onclick = () => {
      const responses = document.querySelectorAll(
        "model-response message-content, message-content, .model-response-text, [data-test-id='model-response']"
      );
      let latestText = "";
      if (responses.length > 0) {
        latestText = extractCleanGeminiText(responses[responses.length - 1]);
      }

      if (!latestText) {
        showGlassToast("Jawaban Gemini belum selesai dibuat.", "error");
        return;
      }

      navigator.clipboard.writeText(latestText).then(() => {
        showGlassToast("Jawaban berhasil disalin ke clipboard.", "success");
      });
    };

    document.body.appendChild(btn);
  }

  function showGlassToast(message, type = "info") {
    let toast = document.getElementById("moodle-glass-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "moodle-glass-toast";
      document.body.appendChild(toast);
    }

    let iconSvg = "";
    let borderTint = "rgba(255, 255, 255, 0.3)";

    if (type === "success") {
      borderTint = "rgba(16, 185, 129, 0.5)";
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
    } else if (type === "loading") {
      borderTint = "rgba(59, 130, 246, 0.5)";
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
    } else if (type === "error") {
      borderTint = "rgba(239, 68, 68, 0.5)";
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`;
    } else {
      borderTint = "rgba(99, 102, 241, 0.5)";
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
    }

    toast.innerHTML = `
      <style>
        @keyframes spin { 100% { transform: rotate(360deg); } }
      </style>
      <div style="display:flex; align-items:center; gap:10px;">
        ${iconSvg}
        <span style="color:#0f172a; font-size:13px; font-weight:500;">${escapeHtml(message)}</span>
      </div>
    `;

    toast.style.position = "fixed";
    toast.style.top = "24px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "rgba(255, 255, 255, 0.88)";
    toast.style.backdropFilter = "blur(20px) saturate(180%)";
    toast.style.webkitBackdropFilter = "blur(20px) saturate(180%)";
    toast.style.padding = "10px 22px";
    toast.style.borderRadius = "50px";
    toast.style.border = `1px solid ${borderTint}`;
    toast.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0,0,0,0.06)";
    toast.style.zIndex = "10000000";
    toast.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "1";

    if (type !== "loading") {
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
      }, 4500);
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
