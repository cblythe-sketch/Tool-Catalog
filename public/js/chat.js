(function () {
  const widget = document.getElementById('chat-widget');
  const toggle = document.getElementById('chat-toggle');
  const closeBtn = document.getElementById('chat-close');
  const messagesEl = document.getElementById('chat-messages');
  const inputEl = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  let history = [];

  if (!widget || !toggle || !messagesEl || !inputEl || !sendBtn) return;

  function open() {
    widget.classList.add('open');
    widget.setAttribute('aria-hidden', 'false');
    inputEl.focus();
  }

  function close() {
    widget.classList.remove('open');
    widget.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  const CHAT_ICONS = { tools: '/images/chat/tools.svg', parts: '/images/chat/parts.svg', step: '/images/chat/step.svg' };
  function makeIcon(src, alt) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.className = 'chat-instruct-icon';
    img.setAttribute('aria-hidden', 'true');
    return img;
  }
  function injectInstructionIcons(container) {
    if (!container || !container.querySelector) return;
    container.querySelectorAll('h2').forEach(function (h2) {
      const text = (h2.textContent || '').trim().toLowerCase();
      let icon = null;
      if (/tools?(\s|$)|tools you'll need|tools needed/.test(text)) icon = CHAT_ICONS.tools;
      else if (/parts?|materials?|supplies|materials you'll need|parts and materials/.test(text)) icon = CHAT_ICONS.parts;
      else if (/step-by-step|assembly|instructions/.test(text)) icon = CHAT_ICONS.step;
      if (icon) h2.parentNode.insertBefore(makeIcon(icon, ''), h2);
    });
    container.querySelectorAll('ol li, ul li, p').forEach(function (el) {
      const text = (el.textContent || '').trim();
      const isStep = /^\d+\.\s/.test(text) || /^step\s*\d+/i.test(text) || (el.querySelector('strong') && /step\s*\d+\.?/i.test(el.textContent));
      const prev = el.previousElementSibling;
      if (isStep && prev && prev.classList && prev.classList.contains('chat-instruct-icon')) return;
      if (isStep) el.parentNode.insertBefore(makeIcon(CHAT_ICONS.step, ''), el);
    });
  }
  function sanitizeMarkdownHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('img').forEach(function (img) {
      const src = (img.getAttribute('src') || '').trim();
      if (src.indexOf('/images/') !== 0 && src.indexOf('images/') !== 0) img.remove();
    });
    return div;
  }
  function renderAssistantContent(content) {
    if (typeof marked === 'undefined') return escapeHtml(content).replace(/\n/g, '<br>');
    const raw = marked.parse(content);
    const html = typeof raw === 'string' ? raw : '';
    const div = sanitizeMarkdownHtml(html);
    injectInstructionIcons(div);
    return div.innerHTML;
  }
  async function renderAssistantContentAsync(content) {
    if (typeof marked === 'undefined') return escapeHtml(content).replace(/\n/g, '<br>');
    const raw = await Promise.resolve(marked.parse(content));
    const html = typeof raw === 'string' ? raw : '';
    const div = sanitizeMarkdownHtml(html);
    injectInstructionIcons(div);
    return div.innerHTML;
  }

  function addMessage(role, content, isPlaceholder) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    const inner = document.createElement('div');
    inner.className = 'chat-msg-body';
    if (isPlaceholder) {
      const p = document.createElement('p');
      p.classList.add('loading-dots');
      p.textContent = content;
      inner.appendChild(p);
    } else if (role === 'assistant') {
      inner.innerHTML = renderAssistantContent(content);
    } else {
      const p = document.createElement('p');
      p.textContent = content;
      inner.appendChild(p);
    }
    div.appendChild(inner);
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function setMessageContent(el, content) {
    const body = el.querySelector('.chat-msg-body');
    if (!body) return;
    const p = body.querySelector('p.loading-dots');
    if (p) p.remove();
    body.innerHTML = await renderAssistantContentAsync(content);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function send() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    sendBtn.disabled = true;
    addMessage('user', text);

    const placeholder = addMessage('assistant', 'Thinking…', true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      let data;
      try {
        data = await res.json();
      } catch (_) {
        await setMessageContent(placeholder, 'Server returned an invalid response. Make sure the app is running (npm start) and you’re at http://localhost:3000.');
        return;
      }

      if (!res.ok) {
        await setMessageContent(placeholder, data.error || 'Something went wrong. Try again.');
        return;
      }
      await setMessageContent(placeholder, data.reply || 'No response.');
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      await setMessageContent(placeholder, 'Could not reach the server. Start it with "npm start" and open http://localhost:3000, then try again.');
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
})();
