// Moodle AI Solver - Answer Parser & DOM Injection Module
window.MoodleAI = window.MoodleAI || {};

(function (app) {
  // Inject code into CodeRunner textarea and Ace Editor (if active)
  app.setCodeRunnerAnswer = function (queEl, code) {
    if (!queEl || !code) return;

    let cleanCode = code.trim();
    const match = cleanCode.match(/```(?:python|py|java|c|cpp)?\s*([\s\S]*?)```/i);
    if (match) {
      cleanCode = match[1].trim();
    }

    const textarea = queEl.querySelector(
      "textarea.coderunner-answer, textarea.edit_code, textarea[name*='_answer']"
    );
    if (textarea) {
      textarea.value = cleanCode;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const aceEl = queEl.querySelector(".ui_wrapper, .ace_editor");
    if (aceEl && window.ace) {
      try {
        const editor = window.ace.edit(aceEl);
        if (editor) {
          editor.setValue(cleanCode, -1);
        }
      } catch (_) {}
    }
  };

  // Apply stored answers to the currently loaded DOM page
  app.applyCachedAnswersToCurrentPage = async function (showMessage = false) {
    const answers = app.getCachedAnswers();
    if (!answers || answers.length === 0) return;

    const answerMap = new Map();
    answers.forEach((a) => {
      if (a.number) answerMap.set(String(a.number), a);
      if (a.id) answerMap.set(String(a.id), a);
    });

    const currentQuestions = await app.extractQuestions(document, false);
    let appliedCount = 0;

    currentQuestions.forEach((q) => {
      const ans = answerMap.get(String(q.number)) || answerMap.get(String(q.id));
      if (!ans) return;

      const el =
        q.domElement ||
        document.getElementById(q.id) ||
        document.querySelector(`.que[id="${q.id}"]`) ||
        document.querySelector(".que");
      if (!el) return;

      el.classList.add("moodle-ai-highlight");

      // 1. Radio (Pilihan Ganda Tunggal)
      if (q.type === "radio") {
        const radios = el.querySelectorAll('.answer input[type="radio"]');
        let targetRadio = null;

        if (ans.selectedIndex !== undefined && radios[ans.selectedIndex]) {
          targetRadio = radios[ans.selectedIndex];
        } else if (ans.selectedText) {
          const cleanAns = ans.selectedText.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
          q.options.forEach((opt, idx) => {
            const cleanOpt = opt.text.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
            if (
              cleanOpt.includes(cleanAns) ||
              cleanAns.includes(cleanOpt) ||
              opt.text.toLowerCase().includes(ans.selectedText.toLowerCase())
            ) {
              targetRadio = radios[idx];
            }
          });
        }

        if (targetRadio) {
          targetRadio.checked = true;
          targetRadio.click();
          targetRadio.dispatchEvent(new Event("input", { bubbles: true }));
          targetRadio.dispatchEvent(new Event("change", { bubbles: true }));

          const lbl = el.querySelector(`label[for="${targetRadio.id}"]`) || targetRadio.closest("label");
          if (lbl) {
            lbl.click();
            lbl.classList.add("moodle-ai-option-highlight");
          }
          appliedCount++;
        }
      }

      // 2. Checkbox (Pilihan Ganda Multi-Select)
      else if (q.type === "checkbox") {
        const checkboxes = el.querySelectorAll(
          '.answer input[type="checkbox"]:not([name*="flagged"]), .ablock input[type="checkbox"]:not([name*="flagged"])'
        );
        const indices =
          ans.selectedIndices && ans.selectedIndices.length > 0
            ? ans.selectedIndices
            : ans.selectedIndex !== undefined
            ? [ans.selectedIndex]
            : [];

        checkboxes.forEach((cb, cbIdx) => {
          const shouldBeChecked = indices.includes(cbIdx);
          const lbl = el.querySelector(`label[for="${cb.id}"]`) || cb.closest("label");

          if (shouldBeChecked) {
            if (!cb.checked) {
              cb.click();
            }
            cb.checked = true;
            cb.dispatchEvent(new Event("input", { bubbles: true }));
            cb.dispatchEvent(new Event("change", { bubbles: true }));
            if (lbl) lbl.classList.add("moodle-ai-option-highlight");
          } else if (cb.checked) {
            cb.click();
            cb.checked = false;
            cb.dispatchEvent(new Event("input", { bubbles: true }));
            cb.dispatchEvent(new Event("change", { bubbles: true }));
            if (lbl) lbl.classList.remove("moodle-ai-option-highlight");
          }
        });
        if (indices.length > 0) appliedCount++;
      }

      // 3. Text (Isian Singkat)
      else if (q.type === "text" && ans.textAnswer) {
        const input = el.querySelector('.answer input[type="text"]');
        if (input) {
          input.value = ans.textAnswer;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          appliedCount++;
        }
      }

      // 4. Select (Dropdown / Menjodohkan)
      else if (q.type === "select" && ans.matches && ans.matches.length > 0) {
        const selects = el.querySelectorAll(".answer select, table select, select.form-select, select.select");
        ans.matches.forEach((m) => {
          const sel = selects[m.selectIndex];
          if (sel) {
            // Priority 1: match by value directly if present in options
            if (m.value !== undefined && Array.from(sel.options).some((o) => o.value == m.value)) {
              sel.value = String(m.value);
            } else if (m.text) {
              // Priority 2: match by option text
              const optByText = Array.from(sel.options).find(
                (o) => o.innerText.trim().toLowerCase() === m.text.toLowerCase()
              );
              if (optByText) {
                sel.value = optByText.value;
              }
            } else if (m.choiceIndex !== undefined) {
              // Priority 3: match by valid non-zero choiceIndex
              const validOptions = Array.from(sel.querySelectorAll("option")).filter((o) => {
                const txt = o.innerText.trim().toLowerCase();
                return (
                  o.value !== "" &&
                  o.value !== "0" &&
                  !txt.startsWith("choose") &&
                  !txt.startsWith("pilih") &&
                  txt !== ""
                );
              });
              if (validOptions[m.choiceIndex]) {
                sel.value = validOptions[m.choiceIndex].value;
              }
            }

            sel.dispatchEvent(new Event("input", { bubbles: true }));
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            sel.classList.add("moodle-ai-option-highlight");
          }
        });
        appliedCount++;
      }

      // 5. CodeRunner (Koding)
      else if (q.type === "coderunner" && (ans.codeAnswer || ans.textAnswer || ans.explanation)) {
        const codeToSet = ans.codeAnswer || ans.textAnswer || ans.explanation;
        app.setCodeRunnerAnswer(el, codeToSet);
        appliedCount++;
      }

      // Explanation badge
      if (ans.explanation && !el.querySelector(".moodle-ai-explanation-badge")) {
        const badge = document.createElement("div");
        badge.className = "moodle-ai-explanation-badge";
        badge.innerHTML = `<strong>Jawaban Gemini:</strong> ${app.escapeHtml(ans.explanation)}`;
        const contentArea = el.querySelector(".content") || el;
        contentArea.appendChild(badge);
      }
    });

    if (showMessage) {
      app.updateStatus(`${appliedCount} soal pada halaman ini telah diisi.`, "success");
    }
  };

  // Parse raw text answers from Gemini Web and auto-apply / click
  app.parseAndApplyPastedAnswers = async function (rawText, isAutoPilotMode = false) {
    if (!rawText || !rawText.trim()) {
      alert("Teks jawaban kosong.");
      return;
    }

    // Special detection for CodeRunner code
    const isCode =
      /```(?:python|py)?[\s\S]*?```/i.test(rawText) || /class\s+\w+|def\s+\w+\s*\(/.test(rawText);
    const currentQuestions = await app.extractQuestions(document, false);
    const codeRunnerQ = currentQuestions.find((q) => q.type === "coderunner");

    if (isCode && codeRunnerQ) {
      let code = rawText.trim();
      const fenceMatch = rawText.match(/```(?:python|py|java|c|cpp)?\s*([\s\S]*?)```/i);
      if (fenceMatch) {
        code = fenceMatch[1].trim();
      }

      app.setCodeRunnerAnswer(codeRunnerQ.domElement, code);
      codeRunnerQ.domElement.classList.add("moodle-ai-highlight");

      const codeAnswers = [
        {
          number: codeRunnerQ.number,
          id: codeRunnerQ.id,
          codeAnswer: code,
          explanation: "Kode implementasi CodeRunner"
        }
      ];
      localStorage.setItem(app.STORAGE_ANSWERS_KEY, JSON.stringify(codeAnswers));

      app.updateStatus("Kode berhasil dimasukkan ke editor CodeRunner.", "success");
      return;
    }

    // 1. Sanitize text: strip markdown bullets, inline image tags/filenames while preserving newlines
    let textToParse = rawText.replace(/^[ \t]*[\*\-\•]\s*/gm, "");
    textToParse = textToParse.replace(/[\(\[\{]?[ \t]*Gambar_Soal_[^\r\n\)\]\}]+[ \t]*[\)\]\}]?/gi, "");
    textToParse = textToParse.replace(
      /[\(\[\{]?[ \t]*soal_\d+_[^\r\n\)\]\}]+\.(?:jpg|jpeg|png|webp|gif)[ \t]*[\)\]\}]?/gi,
      ""
    );
    textToParse = textToParse.replace(
      /[\(\[\{]?[ \t]*[\w\-_]+\.(?:jpg|jpeg|png|webp|gif)[ \t]*[\)\]\}]?/gi,
      ""
    );
    textToParse = textToParse.replace(/\[Gambar\s*\d+[^\]]*\]/gi, "");

    // 2. Filter out non-answer lines (standalone image filenames, citations, conversational chatter)
    const lines = textToParse
      .split("\n")
      .map((l) => l.trim())
      .filter((line) => {
        if (!line) return false;
        if (/^(?:Gambar_Soal_|soal_\d+)[\w\-\.]+/i.test(line)) return false;
        if (/^[\w\-\.]+\.(?:jpg|jpeg|png|webp|gif)$/i.test(line)) return false;
        if (/^\[?\s*(?:source|citation|sumber|lampiran|gambar)[\s\d\:\-_]*\]?$/i.test(line)) return false;
        if (
          /^(?:berikut(?:\s+adalah)?\s+jawaban|jawaban(?:\s+kuis)?\s*[\:\-]|semoga(?:\s+membantu)?|catatan[\:\-]|penjelasan[\:\-])/i.test(
            line
          )
        )
          return false;
        return true;
      });

    if (lines.length === 0) {
      alert("Teks jawaban tidak ditemukan.");
      return;
    }

    const rawQuestions = localStorage.getItem(app.STORAGE_QUESTIONS_KEY);
    const cachedQuestions = rawQuestions ? JSON.parse(rawQuestions) : [];

    const answers = [];
    let currentNum = 0;
    let listOffset = 0;

    lines.forEach((line) => {
      let qNum = "";
      let answerPart = "";

      const match = line.match(/^(?:Soal\s*|No\.?\s*)?(\d+)[\.\)\:\-]\s*([\s\S]+)/i);
      if (match) {
        const explicitNum = parseInt(match[1], 10);
        // Detect if numbering restarted from 1 mid-list due to an image chip/block break
        if (explicitNum <= currentNum && currentNum >= 3 && listOffset === 0) {
          listOffset = currentNum;
        }
        const actualNum = explicitNum + listOffset;
        qNum = String(actualNum);
        currentNum = actualNum;
        answerPart = match[2].trim();
      } else {
        // Line without explicit number: accept if it contains option letter (A-E) or True/False
        const hasOptionLetter = /(?:^|[\s,;&/]|dan|and)+([A-E])(?:\.|\b)/i.test(line);
        const isBoolean = /\b(?:true|false)\b/i.test(line);
        if (hasOptionLetter || isBoolean) {
          currentNum++;
          qNum = String(currentNum);
          answerPart = line;
        } else {
          return;
        }
      }

      let selectedIndex = undefined;
      let selectedIndices = [];
      let selectedText = answerPart;

      // Extract all option letters (e.g. "A, D", "A dan D", "4. B, C, D")
      const letterRegex = /(?:^|[\s,;&/]|dan|and)+([A-E])(?:\.|\b)/gi;
      let lMatch;
      const foundLetters = [];
      while ((lMatch = letterRegex.exec(answerPart)) !== null) {
        const char = lMatch[1].toUpperCase();
        if (!foundLetters.includes(char)) {
          foundLetters.push(char);
        }
      }

      if (foundLetters.length > 0) {
        foundLetters.forEach((char) => {
          const idx = char.charCodeAt(0) - 65;
          if (!selectedIndices.includes(idx)) {
            selectedIndices.push(idx);
          }
        });
        selectedIndex = selectedIndices[0];
        const firstSub = answerPart.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim();
        if (firstSub) selectedText = firstSub;
      } else if (/^true\b/i.test(answerPart)) {
        selectedText = "True";
        selectedIndex = 0;
        selectedIndices = [0];
      } else if (/^false\b/i.test(answerPart)) {
        selectedText = "False";
        selectedIndex = 1;
        selectedIndices = [1];
      }

      // Check against cachedQuestions
      if (cachedQuestions.length > 0) {
        const q = cachedQuestions.find((item) => item.number == qNum);

        // Special parsing for Select (Dropdown / Menjodohkan)
        if (q && q.type === "select") {
          const matches = [];
          const poolOptions = (q.options && q.options[0] && q.options[0].subOptions) || [];
          const subCount = q.options ? q.options.length : 10;

          // Parse explicit pairs like "1 = B", "Sub 1: B", "1 = 17, 9", "1 = (7, 4, 2)"
          // Uses lookahead so commas inside values like (7, 4, 2) or 17, 9 don't break the pair
          const pairRegex = /(?:sub\s*|no\.?\s*)?\b(\d+)\s*[\.\:\=\-\–]\s*([\s\S]*?)(?=(?:[;|\n]|\s*,\s*(?:sub\s*|no\.?\s*)?\d+\s*[\.\:\=\-\–]|$))/gi;
          const explicitPairs = new Map();
          let pMatch;
          while ((pMatch = pairRegex.exec(answerPart)) !== null) {
            const subIdx = parseInt(pMatch[1], 10) - 1;
            const valStr = pMatch[2].trim();
            if (valStr) explicitPairs.set(subIdx, valStr);
          }

          // If no explicit pairs found, check for sequential letters (e.g. "B, C, A")
          const fallbackLetters = [];
          if (explicitPairs.size === 0) {
            const lRegex = /(?:^|[\s,;&/|]|dan|and)+([A-Z])(?:\.|\b)/gi;
            let flMatch;
            while ((flMatch = lRegex.exec(answerPart)) !== null) {
              fallbackLetters.push(flMatch[1].toUpperCase());
            }
          }

          for (let sIdx = 0; sIdx < subCount; sIdx++) {
            const subOpt = q.options ? q.options[sIdx] : null;
            const subPool = (subOpt && subOpt.subOptions && subOpt.subOptions.length > 0) ? subOpt.subOptions : poolOptions;

            const givenVal = explicitPairs.get(sIdx) || fallbackLetters[sIdx];
            if (!givenVal) continue;

            let matchedChoiceIndex = undefined;
            let matchedValue = undefined;
            let matchedText = "";

            const cleanVal = givenVal.trim();
            // Check if it's a single letter (e.g. "A", "B", "C")
            if (/^[A-Z]$/i.test(cleanVal)) {
              const letterIdx = cleanVal.toUpperCase().charCodeAt(0) - 65;
              matchedChoiceIndex = letterIdx;
              if (subPool && subPool[letterIdx]) {
                matchedValue = subPool[letterIdx].value;
                matchedText = subPool[letterIdx].text;
              }
            } else {
              // Otherwise match by text content against options (exact match first)
              const lowerVal = cleanVal.toLowerCase();
              if (subPool && subPool.length > 0) {
                let optMatch = subPool.find((so) => so.text.toLowerCase() === lowerVal);
                if (!optMatch) {
                  optMatch = subPool.find((so) => {
                    const soText = so.text.toLowerCase();
                    return soText.includes(lowerVal) || lowerVal.includes(soText);
                  });
                }
                if (optMatch) {
                  matchedChoiceIndex = subPool.indexOf(optMatch);
                  matchedValue = optMatch.value;
                  matchedText = optMatch.text;
                } else {
                  matchedText = cleanVal;
                }
              } else {
                matchedText = cleanVal;
              }
            }

            matches.push({
              selectIndex: sIdx,
              choiceIndex: matchedChoiceIndex,
              value: matchedValue,
              text: matchedText
            });
          }

          if (matches.length > 0) {
            answers.push({
              number: qNum,
              type: "select",
              matches: matches,
              explanation: line
            });
            return;
          }
        }

        if (q && q.options && q.options.length > 0) {
          if (q.type === "checkbox") {
            // For checkbox questions, also match option text in answerPart
            q.options.forEach((opt) => {
              const cleanOpt = opt.text.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
              if (cleanOpt.length >= 2) {
                const lowerAns = answerPart.toLowerCase();
                if (lowerAns.includes(cleanOpt)) {
                  if (!selectedIndices.includes(opt.index)) {
                    selectedIndices.push(opt.index);
                  }
                }
              }
            });
            if (selectedIndex === undefined && selectedIndices.length > 0) {
              selectedIndex = selectedIndices[0];
            }
          } else if (selectedIndex === undefined) {
            // For single-choice, only match text if no letter was found
            const matchedOpt = q.options.find((opt) => {
              const cleanOpt = opt.text.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
              const cleanAns = answerPart.replace(/^[A-E][\.\)\:\-]\s*/i, "").trim().toLowerCase();
              return cleanOpt.includes(cleanAns) || cleanAns.includes(cleanOpt);
            });
            if (matchedOpt) {
              selectedIndex = matchedOpt.index;
              selectedIndices = [matchedOpt.index];
            }
          }
        }
      }

      if (selectedIndices.length === 0 && selectedIndex !== undefined) {
        selectedIndices.push(selectedIndex);
      }

      answers.push({
        number: qNum,
        selectedIndex,
        selectedIndices,
        selectedText,
        explanation: line
      });
    });

    if (answers.length === 0) {
      alert("Tidak ditemukan format jawaban yang sesuai.");
      return;
    }

    localStorage.setItem(app.STORAGE_ANSWERS_KEY, JSON.stringify(answers));

    const printBtn = document.getElementById("moodle-ai-btn-print");
    const autofillBtn = document.getElementById("moodle-ai-btn-autofill");
    if (printBtn) printBtn.disabled = false;
    if (autofillBtn) autofillBtn.disabled = false;

    await app.applyCachedAnswersToCurrentPage(true);
    app.updateStatus(`${answers.length} jawaban berhasil diterapkan dan dipilih.`, "success");

    // If in Auto-Pilot mode, proceed to next page automatically
    if (isAutoPilotMode || sessionStorage.getItem(app.STORAGE_AUTOLOOP_KEY) === "true") {
      app.updateStatus("Jawaban diterapkan. Lanjut ke halaman berikutnya...", "loading");
      setTimeout(() => {
        app.proceedToNextPage();
      }, 1000);
    }
  };

  // Proceed to next page in Moodle attempt
  app.proceedToNextPage = function () {
    // 1. Next button
    const nextBtn = document.querySelector(
      'input[name="next"], button[name="next"], input#mod_quiz-next-nav, .mod_quiz-next-nav, input[value*="Next"], input[value*="Selanjutnya"], input[value*="Next page"]'
    );

    if (nextBtn) {
      nextBtn.click();
      return;
    }

    // 2. Next question in navigation block
    const navNext = document.querySelector("#mod_quiz_navblock a.thispage + a.qnbutton");
    if (navNext) {
      navNext.click();
      return;
    }

    // 3. Finished all pages
    sessionStorage.removeItem(app.STORAGE_AUTOLOOP_KEY);
    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (toggle) toggle.checked = false;
    app.updateStatus("Seluruh soal kuis telah selesai diisi.", "success");
  };

  // Start sequential auto-fill loop across all pages
  app.startAutoFillLoop = async function () {
    sessionStorage.setItem(app.STORAGE_AUTOLOOP_KEY, "true");
    const toggle = document.getElementById("moodle-ai-autopilot-toggle");
    if (toggle) toggle.checked = true;

    await app.applyCachedAnswersToCurrentPage(false);
    app.updateStatus("Mengisi halaman & lanjut otomatis...", "loading");

    setTimeout(() => {
      app.proceedToNextPage();
    }, 1100);
  };
})(window.MoodleAI);

