/**
 * Markdown 渲染 —— 从 ChatWindow.vue 分离
 * 将 LLM 输出的 Markdown 文本渲染为 HTML
 */

const COPY_ICON = `<svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export function renderMarkdown(text) {
  if (!text) return '';

  // 转义 HTML 特殊字符
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 代码块（```...```）
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang, code: code.trim() });
    return `\x00CB${idx}\x00`;
  });

  // 行内代码（`...`）
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(code);
    return `\x00IC${idx}\x00`;
  });

  // 换行 → <br>
  html = html.replace(/\n/g, '<br>');

  // 还原行内代码
  html = html.replace(/\x00IC(\d+)\x00/g, (_, idx) => `<code>${inlineCodes[idx]}</code>`);

  // 还原代码块（含复制按钮）
  html = html.replace(/\x00CB(\d+)\x00/g, (_, idx) => {
    const { lang, code } = codeBlocks[idx];
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
    const codeHtml = code.replace(/\n/g, '<br>');
    return `<pre>${langLabel}<button class="copy-code-btn" title="复制代码">${COPY_ICON}${CHECK_ICON}</button><code>${codeHtml}</code></pre>`;
  });

  return html;
}
