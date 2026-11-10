// Background service worker for Web Gemini Auto-Pilot (Silent Background Window)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Manual trigger: Buka Gemini Web dari popup
  if (message.action === "OPEN_GEMINI_WEB") {
    chrome.storage.local.set(
      {
        pendingGeminiPrompt: message.prompt,
        pendingGeminiImages: message.images || []
      },
      () => {
        chrome.tabs.create({ url: "https://gemini.google.com/app?hl=id" }, (tab) => {
          sendResponse({ success: true, tabId: tab.id });
        });
      }
    );
    return true;
  }

  // Web Gemini Auto-Pilot (Desktop: Silent Background Window | Mobile: Active Tab with Auto-Return)
  if (message.action === "START_AUTO_PILOT") {
    const moodleTabId = sender.tab ? sender.tab.id : null;
    const isMobile =
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      typeof chrome.windows === "undefined" ||
      !chrome.windows?.create;

    chrome.storage.local.set(
      {
        pendingGeminiPrompt: message.prompt,
        pendingGeminiImages: message.images || [],
        moodleTabId: moodleTabId,
        autoPilot: true,
        isMobile: isMobile
      },
      () => {
        // Mobile Mode (Android Lemur/Kiwi): Android freezes inactive tabs, so open active tab with auto-return
        if (isMobile) {
          chrome.tabs.create(
            { url: "https://gemini.google.com/app?hl=id", active: true },
            (tab) => {
              chrome.storage.local.set({ geminiTabId: tab.id });
              sendResponse({ success: true, geminiTabId: tab.id, isMobile: true });
            }
          );
        } else {
          // Desktop Mode: Silent minimized popup background window
          try {
            chrome.windows.create(
              {
                url: "https://gemini.google.com/app?hl=id",
                type: "popup",
                state: "minimized",
                focused: false
              },
              (win) => {
                if (chrome.runtime.lastError || !win) {
                  chrome.tabs.create({ url: "https://gemini.google.com/app?hl=id", active: false }, (fallbackTab) => {
                    chrome.storage.local.set({ geminiTabId: fallbackTab.id });
                    sendResponse({ success: true, geminiTabId: fallbackTab.id });
                  });
                } else {
                  const tabId = win.tabs && win.tabs[0] ? win.tabs[0].id : null;
                  chrome.storage.local.set({ geminiWindowId: win.id, geminiTabId: tabId });
                  sendResponse({ success: true, geminiWindowId: win.id });
                }
              }
            );
          } catch (_) {
            chrome.tabs.create({ url: "https://gemini.google.com/app?hl=id", active: false }, (fallbackTab) => {
              chrome.storage.local.set({ geminiTabId: fallbackTab.id });
              sendResponse({ success: true, geminiTabId: fallbackTab.id });
            });
          }
        }
      }
    );
    return true;
  }

  // Web Gemini selesai menjawab dan mengembalikan teks jawaban
  if (message.action === "AUTO_PILOT_ANSWER_READY") {
    const { text, moodleTabId } = message;

    chrome.storage.local.get(["geminiWindowId", "geminiTabId", "isMobile"], (stored) => {
      // 1. Simpan jawaban ke storage sebagai fallback jika Moodle tab di mobile sempat tertidur
      chrome.storage.local.set({ pendingAnswersText: text });

      // 2. Tutup tab/window Gemini
      if (stored.geminiWindowId) {
        chrome.windows.remove(stored.geminiWindowId).catch(() => {});
      } else if (stored.geminiTabId) {
        chrome.tabs.remove(stored.geminiTabId).catch(() => {});
      }
      chrome.storage.local.remove(["geminiWindowId", "geminiTabId"]);

      // 3. Alihkan kembali pengguna ke tab Moodle dan kirim jawaban
      if (moodleTabId) {
        chrome.tabs.update(moodleTabId, { active: true }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(moodleTabId, {
              action: "AUTO_PILOT_EXECUTE",
              answersText: text
            }).catch(() => {});
          }, 350);
        });
      }
    });

    sendResponse({ success: true });
    return true;
  }

  // Batalkan Auto-Pilot jika pengguna menekan tombol batalkan
  if (message.action === "CANCEL_AUTO_PILOT") {
    chrome.storage.local.get(["geminiWindowId", "geminiTabId"], (stored) => {
      if (stored.geminiWindowId) chrome.windows.remove(stored.geminiWindowId).catch(() => {});
      if (stored.geminiTabId) chrome.tabs.remove(stored.geminiTabId).catch(() => {});
      chrome.storage.local.remove(["geminiWindowId", "geminiTabId", "pendingGeminiPrompt", "pendingGeminiImages", "autoPilot"]);
    });
    sendResponse({ success: true });
    return true;
  }
});
