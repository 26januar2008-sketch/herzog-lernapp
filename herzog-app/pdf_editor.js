/* Herzog-KI PDF Editor
 * Minimalist in-browser PDF annotator: Signature, Text, Date stamp, Custom stamp
 * Libs: pdf.js (rendering), pdf-lib (creating annotations in PDF)
 */
(function() {
  const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const PDFLIB_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
  let pdfjsLoaded = false, pdfLibLoaded = false;

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  async function loadLibs() {
    if (!pdfjsLoaded) {
      await loadScript(PDFJS_CDN);
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      pdfjsLoaded = true;
    }
    if (!pdfLibLoaded) { await loadScript(PDFLIB_CDN); pdfLibLoaded = true; }
  }

  window.openPdfEditor = async function(url, filename, onSaved) {
    await loadLibs();
    const modal = document.createElement("div");
    modal.id = "pdfEditorModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:200;display:flex;flex-direction:column;overflow:hidden";
    modal.innerHTML = `
      <div style="background:#1e293b;padding:10px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #334155;flex-shrink:0;flex-wrap:wrap">
        <strong style="color:#e2e8f0;font-size:14px;margin-right:8px">✍ PDF bearbeiten</strong>
        <button id="pdfTool-sig" class="pdfed-tool" data-tool="sig">🖋 Signatur</button>
        <button id="pdfTool-text" class="pdfed-tool" data-tool="text">📝 Text</button>
        <button id="pdfTool-date" class="pdfed-tool" data-tool="date">📅 Datum</button>
        <button id="pdfTool-stamp" class="pdfed-tool" data-tool="stamp">🏷 Stempel</button>
        <span style="flex:1"></span>
        <span id="pdfEd-hint" style="color:#94a3b8;font-size:12px"></span>
        <span style="flex:1"></span>
        <button id="pdfEd-save" style="background:#16a34a;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600">💾 Speichern & anhaengen</button>
        <button id="pdfEd-download" style="background:#2563eb;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">⬇ Runterladen</button>
        <button id="pdfEd-close" style="background:#dc2626;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">✕ Schliessen</button>
      </div>
      <div id="pdfEd-pages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;align-items:center"></div>
      <style>
        .pdfed-tool { background:#334155;color:#cbd5e1;border:none;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer }
        .pdfed-tool.active { background:#2563eb;color:white }
        .pdfed-page-wrap { position:relative;box-shadow:0 2px 10px rgba(0,0,0,0.5);background:white }
        .pdfed-overlay { position:absolute;inset:0;cursor:crosshair }
        .pdfed-annot { position:absolute;border:1px dashed #2563eb;padding:2px 4px;background:rgba(255,255,255,0.9);cursor:move;user-select:none;white-space:pre;font-family:Arial,sans-serif }
        .pdfed-annot:hover { border-color:#dc2626 }
        .pdfed-annot .pdfed-del { position:absolute;top:-10px;right:-10px;background:#dc2626;color:white;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;line-height:1 }
        .pdfed-annot img { display:block;pointer-events:none }
      </style>
    `;
    document.body.appendChild(modal);

    let currentTool = null;
    let pageInfos = []; // {canvas, overlay, pageWidth, pageHeight, viewport}
    let annotations = []; // {page, type, x, y, w, h, data, element}
    let sigDataUrl = null;
    let stampDataUrl = localStorage.getItem("hki_stamp_url") || null;

    const hint = modal.querySelector("#pdfEd-hint");
    function setHint(t) { hint.textContent = t || ""; }

    modal.querySelectorAll(".pdfed-tool").forEach(b => {
      b.onclick = async () => {
        modal.querySelectorAll(".pdfed-tool").forEach(x => x.classList.remove("active"));
        const tool = b.dataset.tool;
        if (tool === "sig") {
          if (!sigDataUrl) {
            sigDataUrl = await promptSignature();
            if (!sigDataUrl) return;
          }
          b.classList.add("active"); currentTool = "sig";
          setHint("Klicke auf die Seite wo die Signatur platziert werden soll");
        } else if (tool === "text") {
          const t = prompt("Text eingeben:", "");
          if (!t) return;
          b.classList.add("active"); currentTool = "text:" + t;
          setHint("Klicke auf die Seite wo der Text platziert werden soll");
        } else if (tool === "date") {
          b.classList.add("active"); currentTool = "text:" + new Date().toLocaleDateString("de-DE");
          setHint("Klicke um das heutige Datum zu platzieren");
        } else if (tool === "stamp") {
          if (!stampDataUrl) {
            alert("Stempel einmalig einrichten: waehle ein Bild (PNG mit Transparenz)");
            const file = await pickImage();
            if (!file) return;
            stampDataUrl = await fileToDataUrl(file);
            localStorage.setItem("hki_stamp_url", stampDataUrl);
          }
          b.classList.add("active"); currentTool = "stamp";
          setHint("Klicke um den Stempel zu platzieren");
        }
      };
    });

    modal.querySelector("#pdfEd-close").onclick = () => modal.remove();
    modal.querySelector("#pdfEd-download").onclick = () => saveAnnotated(false);
    modal.querySelector("#pdfEd-save").onclick = () => saveAnnotated(true);

    // Load and render PDF
    setHint("Lade PDF...");
    let pdfBytes;
    try {
      const resp = await fetch(url); pdfBytes = await resp.arrayBuffer();
    } catch (e) { setHint("Fehler: " + e.message); return; }

    let pdfDoc;
    try { pdfDoc = await window.pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise; } catch (e) { setHint("PDF nicht lesbar: " + e.message); return; }

    const pagesEl = modal.querySelector("#pdfEd-pages");
    for (let p = 1; p <= pdfDoc.numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: 1.5 });
      const wrap = document.createElement("div"); wrap.className = "pdfed-page-wrap";
      wrap.style.width = viewport.width + "px"; wrap.style.height = viewport.height + "px";
      const canvas = document.createElement("canvas"); canvas.width = viewport.width; canvas.height = viewport.height;
      const overlay = document.createElement("div"); overlay.className = "pdfed-overlay"; overlay.dataset.page = p;
      wrap.appendChild(canvas); wrap.appendChild(overlay); pagesEl.appendChild(wrap);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      // Store original page size (PDF units) for later mapping
      const origViewport = page.getViewport({ scale: 1 });
      pageInfos.push({ wrap, canvas, overlay, viewport, origWidth: origViewport.width, origHeight: origViewport.height, scale: viewport.width / origViewport.width });
      overlay.addEventListener("click", handleClick);
    }
    setHint(`PDF geladen (${pdfDoc.numPages} Seiten). Waehle ein Werkzeug oben.`);

    function handleClick(e) {
      if (!currentTool) return;
      const overlay = e.currentTarget;
      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pageIdx = parseInt(overlay.dataset.page) - 1;
      placeAnnotation(pageIdx, x, y);
    }

    function placeAnnotation(pageIdx, x, y) {
      const info = pageInfos[pageIdx];
      const annot = { page: pageIdx + 1, x_screen: x, y_screen: y, type: "", data: "" };
      const div = document.createElement("div"); div.className = "pdfed-annot";
      div.style.left = x + "px"; div.style.top = y + "px";

      if (currentTool === "sig") {
        annot.type = "image"; annot.data = sigDataUrl; annot.width = 150; annot.height = 60;
        const img = document.createElement("img"); img.src = sigDataUrl; img.style.width = "150px"; img.style.height = "auto"; div.appendChild(img);
        div.style.padding = "0"; div.style.border = "1px dashed transparent"; div.style.background = "transparent";
      } else if (currentTool.startsWith("text:")) {
        const txt = currentTool.slice(5);
        annot.type = "text"; annot.data = txt; annot.size = 14;
        div.textContent = txt;
      } else if (currentTool === "stamp") {
        annot.type = "image"; annot.data = stampDataUrl; annot.width = 150; annot.height = 80;
        const img = document.createElement("img"); img.src = stampDataUrl; img.style.width = "150px"; img.style.height = "auto"; div.appendChild(img);
        div.style.padding = "0"; div.style.border = "1px dashed transparent"; div.style.background = "transparent";
      }

      const del = document.createElement("span"); del.className = "pdfed-del"; del.textContent = "×";
      del.onclick = (ev) => { ev.stopPropagation(); div.remove(); annotations = annotations.filter(a => a.element !== div); };
      div.appendChild(del);

      // Drag support
      let dragging = false, offX = 0, offY = 0;
      div.addEventListener("mousedown", (ev) => { if (ev.target === del) return; dragging = true; offX = ev.offsetX; offY = ev.offsetY; ev.preventDefault(); });
      div.addEventListener("touchstart", (ev) => { dragging = true; const t = ev.touches[0]; const r = div.getBoundingClientRect(); offX = t.clientX - r.left; offY = t.clientY - r.top; });
      window.addEventListener("mousemove", (ev) => { if (!dragging) return; const r = info.overlay.getBoundingClientRect(); div.style.left = (ev.clientX - r.left - offX) + "px"; div.style.top = (ev.clientY - r.top - offY) + "px"; });
      window.addEventListener("touchmove", (ev) => { if (!dragging) return; const t = ev.touches[0]; const r = info.overlay.getBoundingClientRect(); div.style.left = (t.clientX - r.left - offX) + "px"; div.style.top = (t.clientY - r.top - offY) + "px"; });
      window.addEventListener("mouseup", () => { dragging = false; });
      window.addEventListener("touchend", () => { dragging = false; });

      info.overlay.appendChild(div); annot.element = div;
      annotations.push(annot);
    }

    async function saveAnnotated(alsoAttach) {
      setHint("Speichere PDF...");
      const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
      const newDoc = await PDFDocument.load(pdfBytes.slice(0));
      const pages = newDoc.getPages();
      const font = await newDoc.embedFont(StandardFonts.Helvetica);

      for (const a of annotations) {
        const page = pages[a.page - 1];
        const info = pageInfos[a.page - 1];
        const rect = a.element.getBoundingClientRect();
        const overlayRect = info.overlay.getBoundingClientRect();
        const screenX = rect.left - overlayRect.left;
        const screenY = rect.top - overlayRect.top;
        // Convert to PDF coords (Y inverted in PDF)
        const pdfX = screenX / info.scale;
        const elHeight = rect.height / info.scale;
        const pdfY = info.origHeight - (screenY / info.scale) - elHeight;

        if (a.type === "text") {
          page.drawText(a.data, { x: pdfX, y: pdfY + 2, size: a.size || 14, font, color: rgb(0, 0, 0) });
        } else if (a.type === "image") {
          const imgBytes = await (await fetch(a.data)).arrayBuffer();
          let img;
          if (a.data.startsWith("data:image/png")) img = await newDoc.embedPng(imgBytes);
          else img = await newDoc.embedJpg(imgBytes);
          const w = (a.width || 150) / info.scale * 1.5; // scale fix approx
          const actualW = rect.width / info.scale;
          const actualH = rect.height / info.scale;
          page.drawImage(img, { x: pdfX, y: pdfY, width: actualW, height: actualH });
        }
      }

      const outBytes = await newDoc.save();
      const blob = new Blob([outBytes], { type: "application/pdf" });
      const newName = filename.replace(/\.pdf$/i, "") + "_signiert.pdf";

      if (!alsoAttach) {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = newName; a.click();
        setHint("Datei heruntergeladen. Modal bleibt offen fuer weitere Bearbeitung.");
        return;
      }

      // Upload to Supabase Storage + callback
      setHint("Lade hoch...");
      try {
        const ANON_KEY = window.HKI_ANON_KEY;
        const PW = localStorage.getItem("hki_pw");
        const USER = localStorage.getItem("hki_user");
        const storageKey = `edited/${Date.now()}_${newName.replace(/[^\w.\-]/g, "_")}`;
        const upUrl = `https://nrmqdhcrshyoigesqapm.supabase.co/storage/v1/object/mail-attachments/${storageKey}`;
        const r = await fetch(upUrl, { method: "POST", headers: { "Authorization": `Bearer ${ANON_KEY}`, "apikey": ANON_KEY, "Content-Type": "application/pdf", "x-upsert": "true" }, body: blob });
        if (!r.ok) { setHint("Upload-Fehler: " + r.status + " " + await r.text()); return; }
        const pubUrl = `https://nrmqdhcrshyoigesqapm.supabase.co/storage/v1/object/public/mail-attachments/${storageKey}`;
        setHint("✓ Gespeichert: " + newName);
        if (typeof onSaved === "function") onSaved({ name: newName, url: pubUrl, size: blob.size });
        setTimeout(() => modal.remove(), 1500);
      } catch (e) { setHint("Upload-Fehler: " + e.message); }
    }
  };

  // --- Helpers ---
  function fileToDataUrl(f) {
    return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
  }
  async function pickImage() {
    return new Promise(res => {
      const i = document.createElement("input"); i.type = "file"; i.accept = "image/*";
      i.onchange = () => res(i.files[0] || null); i.click();
    });
  }
  async function promptSignature() {
    return new Promise(resolve => {
      const box = document.createElement("div");
      box.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px";
      box.innerHTML = `
        <div style="background:#1e293b;padding:16px;border-radius:12px;max-width:90vw">
          <h3 style="color:#e2e8f0;margin-bottom:8px">Signatur zeichnen</h3>
          <p style="color:#94a3b8;font-size:12px;margin-bottom:8px">Fahre mit Finger/Maus um zu zeichnen</p>
          <canvas id="sigCanvas" width="500" height="180" style="background:white;border:2px solid #334155;border-radius:8px;touch-action:none;display:block;max-width:100%"></canvas>
          <div style="display:flex;gap:6px;margin-top:10px">
            <button id="sigClear" style="background:#475569;color:white;border:none;padding:8px 14px;border-radius:6px;cursor:pointer">Loeschen</button>
            <button id="sigCancel" style="background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:6px;cursor:pointer">Abbrechen</button>
            <span style="flex:1"></span>
            <button id="sigOk" style="background:#16a34a;color:white;border:none;padding:8px 14px;border-radius:6px;cursor:pointer">Uebernehmen</button>
          </div>
        </div>
      `;
      document.body.appendChild(box);
      const canvas = box.querySelector("#sigCanvas");
      const ctx = canvas.getContext("2d"); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#000";
      let drawing = false, last = null;
      function getPos(ev) {
        const r = canvas.getBoundingClientRect();
        const sx = canvas.width / r.width, sy = canvas.height / r.height;
        const t = ev.touches ? ev.touches[0] : ev;
        return { x: (t.clientX - r.left) * sx, y: (t.clientY - r.top) * sy };
      }
      function start(ev) { drawing = true; last = getPos(ev); ev.preventDefault(); }
      function move(ev) { if (!drawing) return; const p = getPos(ev); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; ev.preventDefault(); }
      function end() { drawing = false; }
      canvas.addEventListener("mousedown", start); canvas.addEventListener("mousemove", move); canvas.addEventListener("mouseup", end); canvas.addEventListener("mouseleave", end);
      canvas.addEventListener("touchstart", start); canvas.addEventListener("touchmove", move); canvas.addEventListener("touchend", end);
      box.querySelector("#sigClear").onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
      box.querySelector("#sigCancel").onclick = () => { box.remove(); resolve(null); };
      box.querySelector("#sigOk").onclick = () => { const d = canvas.toDataURL("image/png"); box.remove(); resolve(d); };
    });
  }
})();
