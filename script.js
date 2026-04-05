import { getHighlighter } from 'https://esm.sh/shiki@1.0.0?bundle';
import githubDark from 'https://esm.sh/shiki@1.0.0/themes/github-dark.mjs';

const input = document.getElementById('input');
const output = document.getElementById('output');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const previewWrapper = document.getElementById('previewWrapper');
const langSelect = document.getElementById('lang');

let highlighter = null;
let lastDataUrl = '';

async function initHighlighter(){
  if(highlighter) return highlighter;
  highlighter = await getHighlighter({
    themes: [githubDark],
    langs: ['javascript', 'typescript', 'python', 'java']
  });
  return highlighter;
}

async function renderHighlighted(){
  const code = input.value || '';
  const lang = langSelect.value;
  const hl = await initHighlighter();

  const html = hl.codeToHtml(code, {
    lang,
    theme: 'github-dark'
  });
  previewWrapper.innerHTML = html;

  const pre = previewWrapper.querySelector('pre');
  if(!pre) return;

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  previewWrapper.style.width = 'auto';
  const rect = pre.getBoundingClientRect();
  const exactWidth = rect.width;
  previewWrapper.style.width = Math.ceil(exactWidth) + 'px';
}

async function convertToImage(){
  convertBtn.disabled = true;
  downloadBtn.disabled = true;
  output.src = '';

  try {
    await renderHighlighted();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const pre = previewWrapper.querySelector('pre');
    const rect = pre.getBoundingClientRect();

    const canvas = await html2canvas(previewWrapper, {
      backgroundColor: '#1e1e1e',
      scale: 3,
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      x: 0,
      y: 0
    });

    lastDataUrl = canvas.toDataURL('image/png');
    output.src = lastDataUrl;
    output.classList.remove('hidden');

    downloadBtn.disabled = false;
  } catch (e){
    console.error(e);
    alert('Failed to generate image. See console for details.');
  } finally{
    convertBtn.disabled = false;
  }
}

function downloadImage() {
  if(!lastDataUrl) return;
  const a = document.createElement('a');
  a.href = lastDataUrl;
  a.download = 'code.png';
  a.click();
}

convertBtn.addEventListener('click', convertToImage);
downloadBtn.addEventListener('click', downloadImage);

// live preview
let t;
input.addEventListener('input', () => {
  clearTimeout(t);
  output.classList.add('hidden');

  t = setTimeout(() => {
    renderHighlighted().catch(console.error);
  }, 300);
});

// initial render
initHighlighter()
  .then(() => renderHighlighted())
  .catch(console.error);