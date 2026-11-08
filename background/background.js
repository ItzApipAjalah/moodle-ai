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

  // Web Gemini Auto-Pilot (Silent Background Window)
  if (message.action === "START_AUTO_PILOT") {
    const moodleTabId = sender.tab ? sender.tab.id : null;

    chrome.storage.local.set(
      {
        pendingGeminiPrompt: message.prompt,
        pendingGeminiImages: message.images || [],
        moodleTabId: moodleTabId,
        autoPilot: true
      },
      () => {
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
    );
    return true;
  }

  // Web Gemini selesai menjawab dan mengembalikan teks jawaban
  if (message.action === "AUTO_PILOT_ANSWER_READY") {
    const { text, moodleTabId } = message;

    chrome.storage.local.get(["geminiWindowId", "geminiTabId"], (stored) => {
      if (stored.geminiWindowId) {
        chrome.windows.remove(stored.geminiWindowId).catch(() => {});
      } else if (stored.geminiTabId) {
        chrome.tabs.remove(stored.geminiTabId).catch(() => {});
      }
      chrome.storage.local.remove(["geminiWindowId", "geminiTabId"]);

      if (moodleTabId) {
        chrome.tabs.sendMessage(moodleTabId, {
          action: "AUTO_PILOT_EXECUTE",
          answersText: text
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
