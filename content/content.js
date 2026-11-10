// Moodle AI Quiz Solver - Bootstrap Entry Point
(function () {
  if (window.__moodleAiSolverInjected) return;
  window.__moodleAiSolverInjected = true;

  const app = window.MoodleAI;
  if (!app) return;

  // Initialize background message listener for Auto-Pilot
  app.initAutoPilotListener();

  // Initialize UI floating widget & check cached answers on page load
  app.initWidget();
  app.checkCachedAnswersOnLoad();
})();
