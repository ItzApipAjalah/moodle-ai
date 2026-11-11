// DGX & Jupyter Notebook Downloader Module (PDF & HTML Export)

// Injected into the active tab to expand all notebook cells, outputs, plots, and trigger window.print
function runJupyterPdfExport() {
  try {
    // 1. Expand all collapsed cells & details
    document.querySelectorAll(".jp-mod-collapsed, [aria-expanded='false'], details:not([open])").forEach((el) => {
      el.classList.remove("jp-mod-collapsed");
      if (el.tagName === "DETAILS") el.open = true;
      if (el.hasAttribute("aria-expanded")) el.setAttribute("aria-expanded", "true");
    });

    // 2. Remove scroll limits, clipping, and max-height on all output areas
    const outputSelectors = [
      ".output_scroll",
      ".output_subarea",
      ".output_area",
      ".output",
      ".jp-OutputArea-child",
      ".jp-OutputArea-output",
      ".jp-RenderedText",
      ".jp-OutputArea",
      ".jp-Cell-outputWrapper"
    ];
    document.querySelectorAll(outputSelectors.join(", ")).forEach((el) => {
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("overflow", "visible", "important");
      el.classList.remove("output_scroll");
    });

    // 3. Expand CodeMirror / Monaco editor scrollers so full code is rendered
    document.querySelectorAll(".CodeMirror, .CodeMirror-scroll, .cm-editor, .cm-scroller").forEach((el) => {
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("overflow", "visible", "important");
    });

    // 4. Expand tables & Pandas DataFrames
    document.querySelectorAll(".dataframe, .jp-RenderedHTMLCommon table, table.dataframe").forEach((t) => {
      t.style.setProperty("max-width", "100%", "important");
      t.style.setProperty("overflow", "visible", "important");
      t.style.setProperty("display", "table", "important");
      if (t.parentElement) {
        t.parentElement.style.setProperty("overflow", "visible", "important");
        t.parentElement.style.setProperty("max-width", "100%", "important");
      }
    });

    // 5. Ensure all plot images (matplotlib, seaborn, plotly) fit page width cleanly
    document.querySelectorAll(".output_subarea img, .jp-OutputArea-output img, .output_png img").forEach((img) => {
      img.style.setProperty("max-width", "100%", "important");
      img.style.setProperty("height", "auto", "important");
      img.style.setProperty("display", "block", "important");
    });

    // 6. Inject or update high-priority print styles
    const styleId = "moodle-ai-jupyter-print-style";
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 12mm 10mm;
        }
        *, *::before, *::after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          background: #ffffff !important;
          color: #0f172a !important;
          height: auto !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Hide JupyterLab / Classic toolbars, menus, sidebars, footer */
        #jp-top-panel, #jp-menu-panel, #jp-left-stack, #jp-right-stack, #jp-bottom-panel,
        .jp-Toolbar, .jp-SideBar, .jp-StatusBar, .lm-TabBar,
        #header, #menubar, #maintoolbar, #pager, .header-bar,
        #moodle-ai-widget, .moodle-ai-header, #moodle-copy-helper-btn {
          display: none !important;
        }
        /* Expand main dock / notebook */
        #jp-main-dock-panel, .jp-NotebookPanel, .jp-Notebook,
        #notebook, #notebook-container, #site {
          position: static !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          overflow: visible !important;
          box-shadow: none !important;
          border: none !important;
        }
        /* Prevent cells from awkward splitting across pages */
        .jp-Cell, .cell {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 14px !important;
          overflow: visible !important;
          border-radius: 4px !important;
          box-shadow: none !important;
        }
        /* Outputs unscroll */
        .output_scroll, .output_area, .output_subarea,
        .jp-OutputArea, .jp-OutputArea-child, .jp-OutputArea-output, .jp-RenderedText {
          max-height: none !important;
          height: auto !important;
          overflow: visible !important;
        }
        /* CodeMirror */
        .CodeMirror, .cm-editor, .cm-scroller, .CodeMirror-scroll {
          max-height: none !important;
          height: auto !important;
          overflow: visible !important;
        }
        /* Tables */
        .dataframe, table {
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        /* Plots */
        img, svg {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    `;

    // 7. Scroll from top to bottom and back to top to trigger any lazy-loaded / windowed elements
    window.scrollTo(0, document.body.scrollHeight);
    setTimeout(() => {
      window.scrollTo(0, 0);
      setTimeout(() => {
        window.print();
      }, 250);
    }, 150);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Injected into the active tab to capture clean standalone HTML and trigger download
function runJupyterHtmlExport() {
  try {
    const titleEl = document.querySelector("#notebook_name, .jp-Notebook-title, title");
    let name = (titleEl ? (titleEl.textContent || titleEl.value) : "notebook").trim();
    name = name.replace(/[^a-zA-Z0-9_\-\.]/g, "_") || "jupyter_notebook";
    if (!name.endsWith(".html")) name += ".html";

    const nbEl = document.querySelector(".jp-Notebook, #notebook-container, #site") || document.body;
    const clone = nbEl.cloneNode(true);

    clone.querySelectorAll(".jp-mod-collapsed").forEach((el) => el.classList.remove("jp-mod-collapsed"));
    clone.querySelectorAll(".output_scroll").forEach((el) => {
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
      el.classList.remove("output_scroll");
    });

    let cssText = "";
    document.querySelectorAll("style, link[rel='stylesheet']").forEach((sheet) => {
      if (sheet.tagName === "STYLE") {
        cssText += sheet.textContent + "\n";
      } else if (sheet.href) {
        cssText += `@import url("${sheet.href}");\n`;
      }
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${name.replace(".html", "")}</title>
  <style>
    ${cssText}
    body { background: #ffffff !important; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .output_scroll { max-height: none !important; overflow: visible !important; }
    .jp-Cell, .cell { margin-bottom: 16px !important; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 1000);

    return { success: true, filename: name };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Export functions for popup script
window.JupyterDownloader = {
  async downloadPdf(statusCallback) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        statusCallback("Tidak dapat mendeteksi tab aktif.", "error");
        return;
      }

      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("chrome-extension://")) {
        statusCallback("Buka tab notebook DGX/Jupyter terlebih dahulu.", "error");
        return;
      }

      statusCallback("Menyiapkan dokumen PDF...", "loading");

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: runJupyterPdfExport
      });

      if (results && results[0] && results[0].result && results[0].result.success) {
        statusCallback("Dialog cetak PDF dibuka! Pilih 'Save as PDF'.", "success");
      } else {
        statusCallback("Gagal menyiapkan PDF.", "error");
      }
    } catch (err) {
      statusCallback(`Error: ${err.message}`, "error");
    }
  },

  async downloadHtml(statusCallback) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        statusCallback("Tidak dapat mendeteksi tab aktif.", "error");
        return;
      }

      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("chrome-extension://")) {
        statusCallback("Buka tab notebook DGX/Jupyter terlebih dahulu.", "error");
        return;
      }

      statusCallback("Mengekspor HTML offline...", "loading");

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: runJupyterHtmlExport
      });

      if (results && results[0] && results[0].result && results[0].result.success) {
        statusCallback("File HTML berhasil diunduh!", "success");
      } else {
        statusCallback("Gagal mengunduh HTML.", "error");
      }
    } catch (err) {
      statusCallback(`Error: ${err.message}`, "error");
    }
  }
};

