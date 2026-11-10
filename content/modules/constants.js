// Moodle AI Solver - Constants & Configuration Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // Geometric Vector Icons (Zero Emojis)
  app.ICONS = {
    AI: `<svg width="16" height="16" viewBox="0 0 100 100" fill="currentColor" style="display:inline-block; vertical-align:middle;">
      <defs>
        <mask id="moodle-widget-cutout">
          <rect width="100" height="100" fill="white" />
          <path d="M 40 56 L 47 49 L 57.5 68 L 97 23" fill="none" stroke="black" stroke-width="21" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4" />
        </mask>
        <clipPath id="moodle-widget-clip">
          <rect x="40" y="0" width="60" height="100" />
        </clipPath>
      </defs>
      <rect x="14" y="42" width="14" height="44" rx="1.5" />
      <g mask="url(#moodle-widget-cutout)">
        <rect x="40" y="29" width="14" height="57" rx="1.5" />
        <rect x="66" y="14" width="14" height="72" rx="1.5" />
      </g>
      <path d="M 40 56 L 47 49 L 57.5 68 L 97 23" fill="none" stroke="currentColor" stroke-width="12.5" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4" clip-path="url(#moodle-widget-clip)" />
    </svg>`,
    ZAP: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    GLOBE: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    CHECK: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    DOC: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>`,
    TRASH: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    MINUS: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>`,
    PLUS: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`,
    CLOSE: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,
    SPINNER: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: moodleSpin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    DOWNLOAD: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
    REFRESH: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`
  };

  // GitHub Repository Configuration
  app.GITHUB_REPO = "ItzApipAjalah/moodle-ai";
  app.GITHUB_RAW_MANIFEST_URL = `https://raw.githubusercontent.com/${app.GITHUB_REPO}/main/manifest.json`;
  app.GITHUB_ZIP_URL = `https://github.com/${app.GITHUB_REPO}/archive/refs/heads/main.zip`;
  app.GITHUB_REPO_URL = `https://github.com/${app.GITHUB_REPO}`;
  app.CURRENT_VERSION = (typeof chrome !== "undefined" && chrome.runtime?.getManifest?.()?.version) || "1.2.0";

  // Quiz Attempt Storage Keys
  const urlParams = new URLSearchParams(window.location.search);
  app.attemptId = urlParams.get("attempt") || "default";

  app.STORAGE_QUESTIONS_KEY = `moodle_ai_q_${app.attemptId}`;
  app.STORAGE_ANSWERS_KEY = `moodle_ai_a_${app.attemptId}`;
  app.STORAGE_AUTOLOOP_KEY = `moodle_ai_autoloop_${app.attemptId}`;

  // Runtime State
  app.state = {
    isWorking: false,
    activeAbortController: null,
    timerInterval: null
  };
})(window.MoodleAI);

