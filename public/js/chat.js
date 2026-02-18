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

  function addMessage(role, content, isPlaceholder) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    const p = document.createElement('p');
    if (isPlaceholder) p.classList.add('loading-dots');
    p.textContent = content;
    div.appendChild(p);
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function setMessageContent(el, content) {
    const p = el.querySelector('p');
    if (!p) return;
    p.classList.remove('loading-dots');
    p.textContent = content;
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
      const data = await res.json();

      if (!res.ok) {
        setMessageContent(placeholder, data.error || 'Something went wrong. Try again.');
        return;
      }
      setMessageContent(placeholder, data.reply || 'No response.');
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      setMessageContent(placeholder, 'Network error. Check the server and try again.');
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
