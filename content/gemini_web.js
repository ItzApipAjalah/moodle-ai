// Script running on https://gemini.google.com to auto-paste Moodle questions & auto-extract answers

(function () {
  chrome.storage.local.get(
    [
      "pendingGeminiPrompt",
      "pendingGeminiImages",
      "pendingChatPrompt",
      "pendingChatFiles",
      "moodleTabId",
      "autoPilot",
      "isChat",
      "isMobile"
    ],
    async (data) => {
      // Determine if this is a chat request
      const isChat = !!data.isChat;
      const promptText = isChat ? data.pendingChatPrompt : data.pendingGeminiPrompt;
      if (!promptText) return;

      const images = isChat ? data.pendingChatFiles : data.pendingGeminiImages || [];
      const moodleTabId = data.moodleTabId;
      const isAutoPilot = !!data.autoPilot && !isChat;

      // Clean up storage for the used prompt keys
      const keysToRemove = [
        "pendingGeminiPrompt",
        "pendingGeminiImages",
        "pendingChatPrompt",
        "pendingChatFiles",
        "isChat"
      ];
      if (data.autoPilot) keysToRemove.push("autoPilot");
      chrome.storage.local.remove(keysToRemove);

      let attempts = 0;
      const maxAttempts = 60;

      const checkInterval = setInterval(async () => {
        attempts++;
        const editor = document.querySelector(
          'rich-textarea .ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"], [contenteditable="true"].ql-blank, div[contenteditable="true"], textarea.text-input-field, textarea'
        );

        if (editor) {
          clearInterval(checkInterval);

          if (images.length > 0) {
            await attachImagesToGemini(editor, images);
          }

          insertAndSend(editor, promptText, moodleTabId, isAutoPilot, isChat);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn("Moodle/Chat: Kolom input Gemini tidak ditemukan.");
          if (isChat) {
            chrome.runtime.sendMessage({
              action: "CHAT_ANSWER_READY",
              text: "Gagal menghubungkan ke Gemini: Kolom input Gemini tidak ditemukan. Pastikan Anda sudah login ke gemini.google.com."
            });
          }
        }
      }, 500);
    }
  );

  async function attachImagesToGemini(editor, images) {
    if (!images || images.length === 0) return;

    showGlassToast(`Mengunggah ${images.length} file ke Gemini...`, "loading");

    const files = images
      .map((img, i) => {
        if (!img.dataUrl) return null;
        const filename = img.name || img.alt || `file_${i + 1}`;
        const mimeType = img.type || "";
        return dataURLtoFile(img.dataUrl, filename, mimeType);
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

    // Give Gemini Web time to process the file attachments
    await new Promise((resolve) => setTimeout(resolve, 2200));
  }

  function dataURLtoFile(dataurl, filename, customMime) {
    const arr = dataurl.split(",");
    const mime = customMime || (arr[0].match(/:(.*?);/) || [])[1] || "application/octet-stream";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  function insertAndSend(editor, text, moodleTabId, isAutoPilot, isChat = false) {
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

      showGlassToast(isChat ? "Pesan dikirim ke Gemini..." : "Soal berhasil ditempelkan. Mengirim ke Gemini...", "info");

      // Submit prompt
      setTimeout(() => {
        const sendBtn = document.querySelector(
          'button[aria-label*="Kirim"], button[aria-label*="Send"], button.send-button, [data-test-id="send-button"], .send-button-container button, button[aria-label*="Submit"]'
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
          const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
          showGlassToast(
            isMobile
              ? "Auto-Pilot Mobile: Menunggu jawaban AI, tab akan otomatis kembali ke kuis..."
              : "Auto-Pilot Aktif: Menunggu respon Gemini...",
            "loading"
          );
          waitForGeminiCompletionAndReturn(moodleTabId, false);
        } else if (isChat) {
          showGlassToast("Menunggu respon AI untuk ditampilkan di popup...", "loading");
          waitForGeminiCompletionAndReturn(null, true);
        } else {
          addCopyAnswerHelper();
        }
      }, 700);
    }, 400);
  }

  function extractCleanGeminiText(responseEl) {
    if (!responseEl) return "";

    // Clone element to safely manipulate DOM without affecting the live page
    const clone = responseEl.cloneNode(true);

    // 1. Remove unwanted elements: citation chips, source carousels, footnotes, buttons
    const removeSelectors = [
      "sources-carousel",
      "sources-carousel-inline",
      "source-inline-chip",
      "source-chip",
      "source-footnote",
      "citation-chip",
      "inline-citation",
      "attachment-chip",
      "grounding-chip",
      "mat-chip",
      ".citation",
      ".source-chip",
      ".sources-container",
      ".grounding-container",
      ".code-block-decoration",
      "gem-icon-button",
      "button"
    ];
    clone.querySelectorAll(removeSelectors.join(", ")).forEach((el) => {
      try { el.remove(); } catch (_) {}
    });

    // 2. Format code blocks into markdown ```lang\ncode\n```
    const codeBlocks = clone.querySelectorAll("code-block, pre");
    codeBlocks.forEach((cb) => {
      const codeEl = cb.querySelector("code") || cb;
      const codeText = codeEl.innerText || codeEl.textContent || "";
      const textNode = document.createTextNode(`\n\n\`\`\`\n${codeText.trim()}\n\`\`\`\n\n`);
      try { cb.replaceWith(textNode); } catch (_) {}
    });

    // 3. Format headings
    clone.querySelectorAll("h1, h2, h3, h4").forEach((h) => {
      const level = h.tagName.toLowerCase();
      const prefix = level === "h1" ? "# " : level === "h2" ? "## " : "### ";
      const text = h.innerText || h.textContent || "";
      const textNode = document.createTextNode(`\n\n${prefix}${text.trim()}\n\n`);
      try { h.replaceWith(textNode); } catch (_) {}
    });

    // 4. Ensure paragraphs and list items have clean separation
    clone.querySelectorAll("p").forEach((p) => {
      p.appendChild(document.createTextNode("\n\n"));
    });
    clone.querySelectorAll("li").forEach((li) => {
      li.prepend(document.createTextNode("\n• "));
    });

    // 5. Attach offscreen to document body so Chromium computes layout geometry (newlines between blocks)
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "800px";
    clone.style.visibility = "hidden";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    let text = clone.innerText || clone.textContent || "";
    clone.remove();

    // 6. Clean up any leftover internal image artifacts while strictly preserving newlines
    text = text.replace(/[\(\[\{]?[ \t]*Gambar_Soal_[^\r\n\)\]\}]+[ \t]*[\)\]\}]?/gi, "");
    text = text.replace(/\[Gambar\s*\d+[^\]]*\]/gi, "");

    // Normalize multiple empty lines
    text = text.replace(/\n{3,}/g, "\n\n");

    return text.trim();
  }

  function isGeminiGenerating() {
    // 1. Check for any stop/cancel button
    const stopBtn = document.querySelector(
      'button[aria-label*="Hentikan" i], button[aria-label*="Stop" i], button[aria-label*="Batal" i], button.stop-button, [data-test-id="stop-button"], mat-icon[fonticonname="stop"], mat-icon[data-mat-icon-name="stop"], [aria-label*="Jeda" i]'
    );
    if (stopBtn && stopBtn.offsetParent !== null) return true;

    // 2. Check for spinners
    const spinner = document.querySelector('mat-progress-spinner, mat-spinner, .loading-spinner, .sparkle-animation');
    if (spinner && spinner.offsetParent !== null) return true;

    // 3. Check for aria-busy element
    const busyEl = document.querySelector('[aria-busy="true"]');
    if (busyEl) return true;

    // 4. Check send button: when generating, send button is disabled or hidden
    const sendBtn = document.querySelector(
      'button[aria-label*="Kirim" i], button[aria-label*="Send" i], button.send-button, [data-test-id="send-button"], .send-button-container button'
    );
    if (sendBtn && sendBtn.disabled) return true;

    return false;
  }

  function waitForGeminiCompletionAndReturn(moodleTabId, isChat = false) {
    let stableChecks = 0;
    let lastText = "";
    let checkCount = 0;
    const maxWaitChecks = 150; // up to 90 seconds
    const requiredStableChecks = 7; // ~4.2 seconds of stable text without any busy indicators

    const pollInterval = setInterval(() => {
      checkCount++;

      // Find all model responses and get the latest clean text
      const responses = document.querySelectorAll(
        ".markdown-main-panel, model-response message-content, message-content .markdown, message-content, .model-response-text, [data-test-id='model-response']"
      );

      let currentText = "";
      if (responses.length > 0) {
        currentText = extractCleanGeminiText(responses[responses.length - 1]);
      }

      const generating = isGeminiGenerating();
      const hasContent = currentText.length > 10;
      const isTextSame = currentText === lastText && currentText.length > 0;

      if (hasContent && isTextSame && !generating) {
        stableChecks++;
      } else {
        stableChecks = 0;
      }

      lastText = currentText;

      // When text has been completely stable for required checks (~4.2 seconds) and no busy indicators
      if (stableChecks >= requiredStableChecks && hasContent) {
        clearInterval(pollInterval);
        showGlassToast("Jawaban selesai diterima.", "success");

        setTimeout(() => {
          if (isChat) {
            chrome.runtime.sendMessage({
              action: "CHAT_ANSWER_READY",
              text: currentText
            });
          } else {
            chrome.runtime.sendMessage({
              action: "AUTO_PILOT_ANSWER_READY",
              text: currentText,
              moodleTabId: moodleTabId
            });
          }
        }, 500);
      } else if (checkCount >= maxWaitChecks) {
        clearInterval(pollInterval);
        if (currentText.length > 0) {
          if (isChat) {
            chrome.runtime.sendMessage({
              action: "CHAT_ANSWER_READY",
              text: currentText
            });
          } else {
            chrome.runtime.sendMessage({
              action: "AUTO_PILOT_ANSWER_READY",
              text: currentText,
              moodleTabId: moodleTabId
            });
          }
        } else {
          showGlassToast("Batas waktu menunggu respon terlampaui.", "error");
          if (isChat) {
            chrome.runtime.sendMessage({
              action: "CHAT_ANSWER_READY",
              text: "Batas waktu menunggu jawaban Gemini terlampaui (timeout)."
            });
          }
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
