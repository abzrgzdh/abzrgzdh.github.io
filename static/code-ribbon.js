document.addEventListener('DOMContentLoaded', () => {
  const clipboardSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;

  const checkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;

  document.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;

    const lang = code.getAttribute('data-lang') || '';

    // Wrap pre in a div
    const wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    // Build ribbon
    const ribbon = document.createElement('div');
    ribbon.className = 'code-ribbon';

    const langSpan = document.createElement('span');
    langSpan.className = 'code-lang';
    langSpan.textContent = lang;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy';
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.innerHTML = clipboardSVG;

    copyBtn.addEventListener('click', () => {
      // Exclude line numbers from copied text
      const lines = code.querySelectorAll('.giallo-l');
      let text;
      if (lines.length > 0) {
        text = Array.from(lines).map(l => {
          const clone = l.cloneNode(true);
          clone.querySelectorAll('.giallo-ln').forEach(ln => ln.remove());
          return clone.textContent;
        }).join('\n').trimEnd();
      } else {
        text = code.textContent.trim();
      }

      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = checkSVG;
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = clipboardSVG;
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.innerHTML = checkSVG;
        setTimeout(() => { copyBtn.innerHTML = clipboardSVG; }, 2000);
      });
    });

    pre.addEventListener('copy', (e) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const lines = code.querySelectorAll('.giallo-l');

      // If there are no giallo lines, let the browser handle it normally
      if (lines.length === 0) return;

      const text = Array.from(lines)
        .filter(line => range.intersectsNode(line))
        .map(line => {
          const clone = line.cloneNode(true);
          // Remove line number elements from the copy
          clone.querySelectorAll('.giallo-ln').forEach(ln => ln.remove());
          // Strip the trailing \n Giallo adds to each line's text content
          return clone.textContent.replace(/\n$/, '');
        })
        .join('\n');

      e.clipboardData.setData('text/plain', text);
      e.preventDefault();
    });

    ribbon.appendChild(langSpan);
    ribbon.appendChild(copyBtn);
    wrap.insertBefore(ribbon, pre);
  });
});
