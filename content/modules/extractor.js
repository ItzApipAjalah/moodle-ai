// Moodle AI Solver - DOM Question Extractor & Scraper Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // Convert question image to Base64 (Canvas first, then same-origin fetch)
  app.getBase64FromImage = async function (img) {
    if (!img || !img.src) return null;

    // 1. Fast canvas extraction if already rendered in current DOM
    if (img.complete && img.naturalWidth > 0) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        if (dataUrl && dataUrl.length > 100) return dataUrl;
      } catch (_) {}
    }

    // 2. Fetch directly with same-origin credentials (cookie authenticated)
    try {
      const res = await fetch(img.src, { credentials: "same-origin" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("Gagal mengunduh gambar soal:", img.src, err);
      return null;
    }
  };

  // Extract structured question objects from a Document
  app.extractQuestions = async function (doc, fetchImages = false) {
    const questionEls = doc.querySelectorAll(".que");
    const list = [];

    for (let index = 0; index < questionEls.length; index++) {
      const el = questionEls[index];
      const id = el.id || `q_${index + 1}`;
      const qnoEl = el.querySelector(".qno") || el.querySelector(".no");
      const qNum = qnoEl ? qnoEl.innerText.replace(/[^0-9]/g, "") : `${index + 1}`;

      const qtextEl = el.querySelector(".qtext") || el.querySelector(".formulation");
      let questionText = qtextEl ? qtextEl.innerText.trim() : "";

      // Extract all valid images in the question (ignoring flags & tiny icons)
      const rawImgs = Array.from(el.querySelectorAll(".formulation img, .qtext img, .content img, table img"));
      const validImgs = rawImgs.filter((img) => {
        if (img.classList.contains("questionflagimage")) return false;
        if (
          img.src &&
          (img.src.includes("/i/unflagged") ||
            img.src.includes("/i/flagged") ||
            img.src.includes("/theme/image.php/"))
        ) {
          return false;
        }
        if (img.naturalWidth && img.naturalWidth < 25 && img.naturalHeight && img.naturalHeight < 25) {
          return false;
        }
        return true;
      });

      const images = [];
      if (fetchImages && validImgs.length > 0) {
        for (let i = 0; i < validImgs.length; i++) {
          const img = validImgs[i];
          const dataUrl = await app.getBase64FromImage(img);
          if (dataUrl) {
            images.push({
              qNum,
              index: i + 1,
              dataUrl,
              src: img.src,
              alt: img.alt || `Gambar_Soal_${qNum}_${i + 1}.jpg`
            });
          }
        }
      }

      if (validImgs.length > 0) {
        validImgs.forEach((img, i) => {
          const desc = img.alt ? `Alt: ${img.alt}` : `Src: ${img.src}`;
          questionText += `\n[Gambar ${i + 1}: ${desc}]`;
        });
      }

      let type = "unknown";
      const options = [];

      // Check if CodeRunner question
      const isCodeRunner =
        el.classList.contains("coderunner") ||
        el.querySelector("textarea.coderunner-answer, textarea.edit_code");
      if (isCodeRunner) {
        type = "coderunner";
        const codeTextarea = el.querySelector(
          "textarea.coderunner-answer, textarea.edit_code, textarea[name*='_answer']"
        );
        const lang = codeTextarea?.getAttribute("data-lang") || "Python3";
        const starterCode = codeTextarea
          ? codeTextarea.value
          : codeTextarea?.getAttribute("data-reload-text") || "";

        const formEl = el.querySelector(".formulation");
        if (formEl) {
          const formClone = formEl.cloneNode(true);
          formClone
            .querySelectorAll(
              ".uiloadfailed, .ui_wrapper, textarea, .im-controls, .prompt, .answer_reset_btn"
            )
            .forEach((n) => n.remove());
          questionText = formClone.innerText.trim();
        }

        list.push({
          id,
          number: qNum,
          type: "coderunner",
          lang,
          starterCode,
          question: questionText,
          images,
          options: [],
          domElement: el
        });
        continue;
      }

      const radios = el.querySelectorAll('.answer input[type="radio"]');
      const checkboxes = el.querySelectorAll('.answer input[type="checkbox"]:not([name*="flagged"])');
      const textInputs = el.querySelectorAll('.answer input[type="text"]');
      const selects = el.querySelectorAll(".answer select, table select");

      if (radios.length > 0) {
        type = "radio";
        radios.forEach((r, optIdx) => {
          const lbl = el.querySelector(`label[for="${r.id}"]`) || r.closest("label");
          const labelText = lbl
            ? lbl.innerText.trim()
            : r.parentElement
            ? r.parentElement.innerText.trim()
            : r.value;
          options.push({ index: optIdx, id: r.id, text: labelText });
        });
      } else if (checkboxes.length > 0) {
        type = "checkbox";
        checkboxes.forEach((cb, optIdx) => {
          const lbl = el.querySelector(`label[for="${cb.id}"]`) || cb.closest("label");
          const labelText = lbl
            ? lbl.innerText.trim()
            : cb.parentElement
            ? cb.parentElement.innerText.trim()
            : cb.value;
          options.push({ index: optIdx, id: cb.id, text: labelText });
        });
      } else if (selects.length > 0) {
        type = "select";
        selects.forEach((sel, sIdx) => {
          const row = sel.closest("tr") || sel.parentElement;
          const subText = row ? row.querySelector(".text")?.innerText.trim() : "";
          const subOptions = Array.from(sel.querySelectorAll("option"))
            .filter((o) => o.value)
            .map((o, oIdx) => ({ index: oIdx, value: o.value, text: o.innerText.trim() }));
          options.push({
            selectIndex: sIdx,
            subText: subText || `Sub question ${sIdx + 1}`,
            subOptions
          });
        });
      } else if (textInputs.length > 0) {
        type = "text";
      }

      list.push({
        id,
        number: qNum,
        type,
        question: questionText,
        images,
        options,
        domElement: el
      });
    }

    return list;
  };

  // Collect questions and images across all pages in the quiz attempt
  app.collectAllQuizQuestions = async function () {
    app.updateStatus("Membaca soal & mengunduh gambar...", "loading");

    const currentQuestions = await app.extractQuestions(document, true);
    const questionsMap = new Map();
    currentQuestions.forEach((q) => questionsMap.set(q.number || q.id, q));

    const navButtons = document.querySelectorAll("#mod_quiz_navblock a.qnbutton");
    const pageUrls = new Set();

    navButtons.forEach((btn) => {
      const href = btn.getAttribute("href");
      if (href && !href.startsWith("#") && href.includes("attempt.php")) {
        pageUrls.add(href.split("#")[0]);
      }
    });

    const otherUrls = Array.from(pageUrls).filter((u) => u !== window.location.href.split("#")[0]);

    let fetchedCount = 0;
    for (const url of otherUrls) {
      fetchedCount++;
      app.updateStatus(
        `Mengambil soal & gambar halaman ${fetchedCount + 1}/${otherUrls.length + 1}...`,
        "loading"
      );
      try {
        const response = await fetch(url, { credentials: "same-origin" });
        if (response.ok) {
          const html = await response.text();
          const pageDoc = new DOMParser().parseFromString(html, "text/html");
          const pageQuestions = await app.extractQuestions(pageDoc, true);
          pageQuestions.forEach((q) => questionsMap.set(q.number || q.id, q));
        }
      } catch (err) {
        console.warn("Gagal fetch halaman:", url, err);
      }
    }

    const allQuestions = Array.from(questionsMap.values());
    allQuestions.sort((a, b) => (parseInt(a.number, 10) || 0) - (parseInt(b.number, 10) || 0));

    const storagePayload = allQuestions.map((q) => ({
      id: q.id,
      number: q.number,
      type: q.type,
      lang: q.lang,
      starterCode: q.starterCode,
      question: q.question,
      options: q.options,
      hasImages: (q.images || []).length > 0
    }));
    localStorage.setItem(app.STORAGE_QUESTIONS_KEY, JSON.stringify(storagePayload));
    return allQuestions;
  };
})(window.MoodleAI);

