// Moodle AI Solver - Helper Utilities Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // HTML escaping helper
  app.escapeHtml = function (str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  // Semantic version comparison
  app.isNewerVersion = function (remote, local) {
    if (!remote || !local) return false;
    const r = remote.split(".").map((n) => parseInt(n, 10) || 0);
    const l = local.split(".").map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(r.length, l.length); i++) {
      const rv = r[i] || 0;
      const lv = l[i] || 0;
      if (rv > lv) return true;
      if (rv < lv) return false;
    }
    return false;
  };

  // Draggable floating widget with click-to-expand support
  app.makeDraggable = function (element, handle) {
    let posX = 0,
      posY = 0,
      mouseX = 0,
      mouseY = 0;
    let startX = 0,
      startY = 0;
    let isDragging = false;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (
        e.target.tagName === "BUTTON" ||
        e.target.closest("button") ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "LABEL"
      ) {
        return;
      }
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist > 4) {
        isDragging = true;
      }
      if (!isDragging) return;

      e.preventDefault();
      posX = mouseX - e.clientX;
      posY = mouseY - e.clientY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      element.style.top = element.offsetTop - posY + "px";
      element.style.left = element.offsetLeft - posX + "px";
      element.style.bottom = "auto";
      element.style.right = "auto";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;

      // If user clicked the minimized pill without dragging, expand the widget
      if (!isDragging && element.classList.contains("minimized")) {
        element.classList.remove("minimized");
        const minBtn = document.getElementById("moodle-ai-btn-min");
        if (minBtn) {
          minBtn.innerHTML = app.ICONS.MINUS;
          minBtn.title = "Minimize";
        }
      }
    }
  };
})(window.MoodleAI);

