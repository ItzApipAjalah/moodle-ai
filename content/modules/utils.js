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

  // Draggable floating widget with touch support, click-to-expand, and viewport clamping
  app.makeDraggable = function (element, handle) {
    let posX = 0,
      posY = 0,
      mouseX = 0,
      mouseY = 0;
    let startX = 0,
      startY = 0;
    let isDragging = false;

    handle.addEventListener("mousedown", onPointerDown);
    handle.addEventListener("touchstart", onPointerDown, { passive: false });

    function getCoords(e) {
      if (e.touches && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      return { clientX: e.clientX, clientY: e.clientY };
    }

    function onPointerDown(e) {
      const target = e.target;
      if (
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.tagName === "INPUT" ||
        target.tagName === "LABEL"
      ) {
        return;
      }

      const coords = getCoords(e);
      startX = coords.clientX;
      startY = coords.clientY;
      isDragging = false;
      mouseX = coords.clientX;
      mouseY = coords.clientY;

      document.addEventListener("mousemove", onPointerMove);
      document.addEventListener("touchmove", onPointerMove, { passive: false });
      document.addEventListener("mouseup", onPointerUp);
      document.addEventListener("touchend", onPointerUp);
    }

    function onPointerMove(e) {
      const coords = getCoords(e);
      const dist = Math.hypot(coords.clientX - startX, coords.clientY - startY);
      if (dist > 6) {
        isDragging = true;
      }
      if (!isDragging) return;

      if (e.cancelable) e.preventDefault();

      posX = mouseX - coords.clientX;
      posY = mouseY - coords.clientY;
      mouseX = coords.clientX;
      mouseY = coords.clientY;

      let newTop = element.offsetTop - posY;
      let newLeft = element.offsetLeft - posX;

      // Viewport boundary clamping so widget never gets lost offscreen on mobile
      const pad = 8;
      const maxLeft = Math.max(0, window.innerWidth - element.offsetWidth - pad);
      const maxTop = Math.max(0, window.innerHeight - element.offsetHeight - pad);

      newLeft = Math.max(pad, Math.min(newLeft, maxLeft));
      newTop = Math.max(pad, Math.min(newTop, maxTop));

      element.style.top = newTop + "px";
      element.style.left = newLeft + "px";
      element.style.bottom = "auto";
      element.style.right = "auto";
    }

    function onPointerUp() {
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("touchmove", onPointerMove);
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("touchend", onPointerUp);

      // If user tapped without dragging while minimized, expand the widget
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

