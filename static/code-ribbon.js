document.addEventListener('DOMContentLoaded', () => {
  const clipboardSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;

  const checkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;

  const getCodeText = (code) =>
    Array.from(code.querySelectorAll('.giallo-l'))
      .map(line => {
        const clone = line.cloneNode(true);
        clone.querySelectorAll('.giallo-ln').forEach(el => el.remove());
        return clone.textContent;
      })
      .join('\n')
      .trimEnd();

  document.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;

    const wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const ribbon = document.createElement('div');
    ribbon.className = 'code-ribbon';

    const langSpan = document.createElement('span');
    langSpan.className = 'code-lang';
    langSpan.textContent = code.dataset.lang || '';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy';
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.innerHTML = clipboardSVG;

    copyBtn.addEventListener('click', async () => {
      const text = getCodeText(code);

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }

      copyBtn.innerHTML = checkSVG;
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.innerHTML = clipboardSVG;
        copyBtn.classList.remove('copied');
      }, 2000);
    });

    ribbon.appendChild(langSpan);
    ribbon.appendChild(copyBtn);
    wrap.insertBefore(ribbon, pre);
  });
});
