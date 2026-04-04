import { getHighlighter } from 'https://esm.sh/shiki@1.0.0?bundle';
import githubDark from 'https://esm.sh/shiki@1.0.0/themes/github-dark.mjs';

const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const previewWrapper = document.getElementById('previewWrapper');
const langSelect = document.getElementById('lang');

let highlighter;
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
}

async function convertToImage(){
  convertBtn.disabled = true;
  downloadBtn.disabled = true;
  output.src = '';

  try{
    await renderHighlighted();

    // ensure layout is painted
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const canvas = await html2canvas(previewWrapper, {
      backgroundColor: '#1e1e1e',
      scale: 3
    });

    lastDataUrl = canvas.toDataURL('image/png');
    output.src = lastDataUrl;
    output.classList.remove('hidden'); // show
    output.classList.add('hidden');    // hide
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

// optional: live preview debounce (no image generation)
let t;
input.addEventListener('input', () => {
  clearTimeout(t);
  t = setTimeout(() => renderHighlighted(), 300);
});

// initial empty render
initHighlighter().then(renderHighlighted);