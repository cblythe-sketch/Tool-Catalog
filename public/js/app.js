(function () {
  const API_BASE = '';

  const tabsContainer = document.querySelector('.tabs');
  const toolsGrid = document.getElementById('tools-grid');
  const loadingEl = document.getElementById('loading');
  const emptyStateEl = document.getElementById('empty-state');

  let categories = [];
  let tools = [];
  let activeCategory = 'all';

  function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
  }

  function showEmpty(show) {
    emptyStateEl.classList.toggle('hidden', !show);
  }

  function clearToolCards() {
    const cards = toolsGrid.querySelectorAll('.tool-card');
    cards.forEach(card => card.remove());
  }

  function renderTabs() {
    if (!tabsContainer) return;
    const allTab = tabsContainer.querySelector('[data-category="all"]');
    const fragment = document.createDocumentFragment();
    categories.forEach(function (cat) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab';
      btn.setAttribute('data-category', cat.id);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.textContent = `${cat.icon || ''} ${cat.name}`.trim();
      fragment.appendChild(btn);
    });
    tabsContainer.appendChild(fragment);

    tabsContainer.addEventListener('click', function (e) {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const cat = tab.getAttribute('data-category');
      setActiveTab(cat);
      renderTools();
    });
  }

  function setActiveTab(categoryId) {
    activeCategory = categoryId;
    tabsContainer.querySelectorAll('.tab').forEach(function (tab) {
      const id = tab.getAttribute('data-category');
      const active = id === categoryId;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function getCategoryName(id) {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  }

  function renderTools() {
    clearToolCards();
    showLoading(false);
    const filtered = activeCategory === 'all'
      ? tools
      : tools.filter(t => t.category === activeCategory);

    if (filtered.length === 0) {
      showEmpty(true);
      return;
    }
    showEmpty(false);

    filtered.forEach(function (tool) {
      const card = document.createElement('article');
      card.className = 'tool-card';

      const img = document.createElement('img');
      img.className = 'tool-card-image';
img.src = tool.image || 'https://via.placeholder.com/400x300?text=Tool';
  img.alt = tool.name;
  img.loading = 'lazy';
  img.onerror = function () { this.src = 'https://via.placeholder.com/400x300?text=Tool'; };

      const body = document.createElement('div');
      body.className = 'tool-card-body';

      const catSpan = document.createElement('span');
      catSpan.className = 'tool-card-category';
      catSpan.textContent = getCategoryName(tool.category);

      const name = document.createElement('h3');
      name.className = 'tool-card-name';
      name.textContent = tool.name;

      const desc = document.createElement('p');
      desc.className = 'tool-card-desc';
      desc.textContent = tool.description || '';

      body.appendChild(catSpan);
      body.appendChild(name);
      body.appendChild(desc);
      card.appendChild(img);
      card.appendChild(body);
      toolsGrid.insertBefore(card, emptyStateEl);
    });
  }

  function loadCategories() {
    return fetch(API_BASE + '/api/categories')
      .then(r => r.json())
      .then(data => {
        categories = data;
        renderTabs();
      });
  }

  function loadTools() {
    showLoading(true);
    showEmpty(false);
    return fetch(API_BASE + '/api/tools')
      .then(r => r.json())
      .then(data => {
        tools = data;
        showLoading(false);
        renderTools();
      })
      .catch(function () {
        showLoading(false);
        showEmpty(true);
        emptyStateEl.textContent = 'Failed to load tools. Is the server running?';
      });
  }

  function init() {
    loadCategories()
      .then(loadTools)
      .catch(console.error);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
