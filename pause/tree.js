// ============================================================
// Yggdrasil · eigenes SVG. Wächst mit jeder Pause.
// Wurzeln in drei Brunnen (Urdbrunnen, Mimirs Brunnen, Hvergelmir),
// über die Woche mehr Äste, bei vollem Tagesziel Früchte.
// Dazu: Flechtband (Wikingerzeit) als eigenes SVG.
// ============================================================
window.YGG_TREE = (function () {
  const F = (n) => Math.round(n * 10) / 10;

  // Krone: Blattbüschel pro Stufe (x, y, r). Stufe 0 = Keimling.
  const CROWN = [
    [],
    [[100, 126, 13]],
    [[100, 106, 20], [84, 118, 13], [116, 118, 13]],
    [[100, 84, 25], [78, 100, 17], [122, 100, 17], [100, 112, 18]],
    [[100, 62, 29], [70, 82, 20], [130, 82, 20], [86, 104, 20], [114, 104, 20], [100, 90, 22]]];
  // Stammhöhe pro Stufe (von der Erde bei y=168 nach oben)
  const TRUNK = [0, 36, 58, 82, 104];
  // Äste: pro Wochentag mit Pause ein Ast. Reihenfolge links/rechts abwechselnd.
  const BRANCH = [
    [-1, .30], [1, .38], [-1, .47], [1, .55], [-1, .64], [1, .72], [-1, .80]];

  function wells() {
    // drei Brunnen, Wasser mit zwei Ringen
    const w = (cx, cy, rx, ry, name) =>
      '<g><title>' + name + '</title>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="var(--wasser)" stroke="var(--holz-2)" stroke-width="1.6"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + F(rx * .55) + '" ry="' + F(ry * .5) + '" fill="none" stroke="#DCE9EE" stroke-opacity=".55" stroke-width="1"/>' +
      '</g>';
    return w(44, 200, 17, 6.5, 'Hvergelmir') + w(100, 208, 19, 7, 'Urdbrunnen') + w(156, 200, 17, 6.5, 'Mimirs Brunnen');
  }

  function roots(stage) {
    const sw = stage === 0 ? 1.6 : 2.6 + stage * .5;
    const p = (d) => '<path d="' + d + '" fill="none" stroke="var(--holz)" stroke-width="' + sw + '" stroke-linecap="round"/>';
    return p('M98 168 C86 180 62 186 46 196') + p('M102 168 C114 180 138 186 154 196') +
      p('M100 168 C98 182 100 194 100 204') +
      p('M96 169 C80 176 70 182 60 190') + p('M104 169 C120 176 130 182 140 190');
  }

  function trunk(stage) {
    if (stage === 0) {
      // Keimling: kurzer Stiel, zwei Blätter
      return '<path d="M100 168 C100 160 100 154 100 150" stroke="var(--moos)" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M100 154 C92 152 88 146 90 140 C96 142 100 148 100 154Z" fill="var(--moos-2)" stroke="var(--kiefer)" stroke-width=".8"/>' +
        '<path d="M100 157 C108 155 112 149 110 143 C104 145 100 151 100 157Z" fill="var(--moos)" stroke="var(--kiefer)" stroke-width=".8"/>';
    }
    const H = TRUNK[stage], top = 168 - H, wb = 5 + stage * 1.6, wt = 2.5 + stage * .6;
    return '<path d="M' + F(100 - wb) + ' 168 C' + F(100 - wb + 1.5) + ' ' + F(168 - H * .5) + ' ' + F(100 - wt) + ' ' + F(top + 6) + ' ' + F(100 - wt) + ' ' + top +
      ' L' + F(100 + wt) + ' ' + top + ' C' + F(100 + wt) + ' ' + F(top + 6) + ' ' + F(100 + wb - 1.5) + ' ' + F(168 - H * .5) + ' ' + F(100 + wb) + ' 168Z"' +
      ' fill="var(--holz)" stroke="var(--holz-2)" stroke-width="1.2" stroke-linejoin="round"/>' +
      // Holzschnitt-Maserung
      '<path d="M100 166 C99 ' + F(168 - H * .45) + ' 101 ' + F(168 - H * .7) + ' 100 ' + F(top + 8) + '" fill="none" stroke="var(--holz-2)" stroke-width=".8" stroke-opacity=".6"/>';
  }

  function branches(stage, n) {
    if (stage < 2 || n <= 0) return '';
    const H = TRUNK[stage];
    let h = '';
    for (let i = 0; i < Math.min(7, n); i++) {
      const [side, frac] = BRANCH[i];
      const y = 168 - H * frac, len = 24 + stage * 5 - i * 1.2;
      const x1 = 100 + side * (3 + stage * .8), x2 = 100 + side * len, y2 = y - len * .42;
      h += '<path d="M' + F(x1) + ' ' + F(y) + ' Q' + F((x1 + x2) / 2) + ' ' + F(y - 2) + ' ' + F(x2) + ' ' + F(y2) + '" fill="none" stroke="var(--holz)" stroke-width="' + F(1.6 + stage * .3) + '" stroke-linecap="round"/>' +
        '<circle cx="' + F(x2) + '" cy="' + F(y2 - 2) + '" r="' + F(5 + stage) + '" fill="' + (i % 2 ? 'var(--moos-2)' : 'var(--moos)') + '" stroke="var(--kiefer)" stroke-width=".9"/>';
    }
    return h;
  }

  function crown(stage, fruits) {
    let h = '';
    CROWN[stage].forEach((c, i) => {
      const fill = i === 0 ? 'var(--kiefer-2)' : (i % 2 ? 'var(--moos-2)' : 'var(--moos)');
      h += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + fill + '" stroke="var(--kiefer)" stroke-width="1"/>';
      // Lichtkante (Holzschnitt-Anmutung)
      h += '<path d="M' + F(c[0] - c[2] * .55) + ' ' + F(c[1] - c[2] * .45) + ' A' + c[2] + ' ' + c[2] + ' 0 0 1 ' + F(c[0] + c[2] * .3) + ' ' + F(c[1] - c[2] * .9) + '" fill="none" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="1.6" stroke-linecap="round"/>';
    });
    if (fruits && stage === 4) {
      [[112, 56], [84, 74], [132, 90], [98, 100], [70, 92], [120, 112]].forEach(p => {
        h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.8" fill="var(--glut)" stroke="var(--glut-2)" stroke-width=".9"/>';
      });
    }
    return h;
  }

  // stage 0..4, branches = Tage mit Pause in dieser Woche (0..7), fruits = Tagesziel erreicht
  function draw(el, stage, nBranches, fruits) {
    stage = Math.max(0, Math.min(4, stage | 0));
    el.setAttribute('viewBox', '0 28 200 194');
    el.innerHTML =
      '<ellipse cx="100" cy="170" rx="74" ry="7" fill="var(--moos)" fill-opacity=".22"/>' +
      '<path d="M26 168 C60 164 140 164 174 168" fill="none" stroke="var(--kiefer)" stroke-opacity=".5" stroke-width="1.2"/>' +
      roots(stage) + wells() + trunk(stage) + branches(stage, nBranches) + crown(stage, fruits);
  }

  // Flechtband: zwei Stränge, abwechselnd oben/unten
  function knot(el, width) {
    const W = width || 480, Hh = 18, mid = 9, A = 5.2, P = 44, half = P / 2;
    const pts = (k, sign) => {
      const a = [];
      for (let j = 0; j <= 8; j++) {
        const x = k * half + j * half / 8;
        const y = mid + sign * A * Math.sin(Math.PI * (x / half));
        a.push(F(x) + ',' + F(y));
      }
      return a.join(' ');
    };
    const segs = Math.ceil(W / half) + 1;
    let under = '', over = '';
    for (let k = 0; k < segs; k++) {
      const aTop = k % 2 === 0;
      const a = '<polyline points="' + pts(k, 1) + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
      const b = '<polyline points="' + pts(k, -1) + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
      const gapA = '<polyline points="' + pts(k, 1) + '" fill="none" stroke="var(--bg)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>';
      const gapB = '<polyline points="' + pts(k, -1) + '" fill="none" stroke="var(--bg)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>';
      if (aTop) { under += b; over += gapA + a; } else { under += a; over += gapB + b; }
    }
    el.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
    el.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    el.innerHTML = under + over;
  }

  // App-Icon (gleiche Formensprache), als eigenständiges SVG
  function iconSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
      '<rect width="512" height="512" rx="112" fill="#1F3A2E"/>' +
      '<ellipse cx="256" cy="412" rx="160" ry="16" fill="#6B8F5E" fill-opacity=".35"/>' +
      '<path d="M250 404 C220 430 170 440 126 462 M262 404 C292 430 342 440 386 462 M256 404 C254 430 256 450 256 470" fill="none" stroke="#9A7A55" stroke-width="11" stroke-linecap="round"/>' +
      '<ellipse cx="118" cy="466" rx="36" ry="13" fill="#4F7F93" stroke="#5C4329" stroke-width="3"/>' +
      '<ellipse cx="256" cy="476" rx="40" ry="14" fill="#4F7F93" stroke="#5C4329" stroke-width="3"/>' +
      '<ellipse cx="394" cy="466" rx="36" ry="13" fill="#4F7F93" stroke="#5C4329" stroke-width="3"/>' +
      '<path d="M228 404 C232 330 244 250 246 160 L266 160 C268 250 280 330 284 404Z" fill="#9A7A55" stroke="#5C4329" stroke-width="3"/>' +
      '<circle cx="256" cy="150" r="76" fill="#2B4F3E" stroke="#1F3A2E" stroke-width="3"/>' +
      '<circle cx="178" cy="200" r="52" fill="#6B8F5E" stroke="#1F3A2E" stroke-width="3"/>' +
      '<circle cx="334" cy="200" r="52" fill="#8FB07F" stroke="#1F3A2E" stroke-width="3"/>' +
      '<circle cx="214" cy="256" r="50" fill="#8FB07F" stroke="#1F3A2E" stroke-width="3"/>' +
      '<circle cx="298" cy="256" r="50" fill="#6B8F5E" stroke="#1F3A2E" stroke-width="3"/>' +
      '<circle cx="256" cy="220" r="54" fill="#7CA06D" stroke="#1F3A2E" stroke-width="3"/>' +
      '<circle cx="286" cy="130" r="11" fill="#D9A93B" stroke="#B8862A" stroke-width="2"/>' +
      '<circle cx="200" cy="186" r="11" fill="#D9A93B" stroke="#B8862A" stroke-width="2"/>' +
      '<circle cx="330" cy="246" r="11" fill="#D9A93B" stroke="#B8862A" stroke-width="2"/>' +
      '<circle cx="236" cy="266" r="11" fill="#D9A93B" stroke="#B8862A" stroke-width="2"/>' +
      '</svg>';
  }

  return { draw, knot, iconSVG };
})();
