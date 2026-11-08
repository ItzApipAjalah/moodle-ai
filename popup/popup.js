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

  function showStatus(text, type) {
    statusMsg.textContent = text;
    statusMsg.className = `status-msg ${type}`;
    statusMsg.style.display = "block";
    setTimeout(() => {
      statusMsg.style.display = "none";
    }, 3000);
  }
});
