(function () {
  const API_BASE = '';

  const tabsContainer = document.querySelector('.tabs');
  const toolsGrid = document.getElementById('tools-grid');
  const loadingEl = document.getElementById('loading');
  const emptyStateEl = document.getElementById('empty-state');
  const mainCatalog = document.getElementById('main-catalog');
  const categoriesSection = document.getElementById('categories-section');
  const toolDetail = document.getElementById('tool-detail');
  const toolDetailBack = document.getElementById('tool-detail-back');
  const toolDetailLoading = document.getElementById('tool-detail-loading');
  const toolDetailCard = document.getElementById('tool-detail-card');
  const toolDetailError = document.getElementById('tool-detail-error');
  const toolDetailImage = document.getElementById('tool-detail-image');
  const toolDetailCategory = document.getElementById('tool-detail-category');
  const toolDetailName = document.getElementById('tool-detail-name');
  const toolDetailDesc = document.getElementById('tool-detail-desc');
  const toolDetailUsesList = document.getElementById('tool-detail-uses-list');
  const toolDetailUsesFallback = document.getElementById('tool-detail-uses-fallback');

  let categories = [];
  let tools = [];
  let activeCategory = 'all';

  function getToolIdFromPath() {
    const match = window.location.pathname.match(/^\/tool\/([^/]+)\/?$/);
    return match ? match[1] : null;
  }

  function showCatalog() {
    if (mainCatalog) mainCatalog.classList.remove('hidden');
    if (categoriesSection) categoriesSection.classList.remove('hidden');
    if (toolDetail) toolDetail.classList.add('hidden');
  }

  function showDetailView() {
    if (mainCatalog) mainCatalog.classList.add('hidden');
    if (categoriesSection) categoriesSection.classList.add('hidden');
    if (toolDetail) toolDetail.classList.remove('hidden');
  }

  function renderToolDetail(tool) {
    if (!tool) return;
    toolDetailLoading.classList.add('hidden');
    toolDetailError.classList.add('hidden');
    toolDetailCard.classList.remove('hidden');
    toolDetailImage.src = tool.image || '';
    toolDetailImage.alt = tool.name;
    toolDetailImage.onerror = function () { this.src = 'https://via.placeholder.com/800x500?text=Tool'; };
    toolDetailCategory.textContent = getCategoryName(tool.category);
    toolDetailName.textContent = tool.name;
    toolDetailDesc.textContent = tool.description || '';
    toolDetailUsesList.innerHTML = '';
    if (tool.uses && Array.isArray(tool.uses) && tool.uses.length > 0) {
      toolDetailUsesList.classList.remove('hidden');
      toolDetailUsesFallback.classList.add('hidden');
      tool.uses.forEach(function (use) {
        const li = document.createElement('li');
        li.textContent = use;
        toolDetailUsesList.appendChild(li);
      });
    } else {
      toolDetailUsesList.classList.add('hidden');
      toolDetailUsesFallback.classList.remove('hidden');
      toolDetailUsesFallback.textContent = 'See description above for typical use. You can also ask the chat assistant for specific projects.';
    }
    document.title = tool.name + ' — Polaris Tool Catalog';
  }

  function loadToolDetail(id) {
    showDetailView();
    toolDetailLoading.classList.remove('hidden');
    toolDetailCard.classList.add('hidden');
    toolDetailError.classList.add('hidden');
    fetch(API_BASE + '/api/tools/' + encodeURIComponent(id))
      .then(function (r) {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(function (tool) {
        renderToolDetail(tool);
      })
      .catch(function () {
        toolDetailLoading.classList.add('hidden');
        toolDetailError.classList.remove('hidden');
        document.title = 'Tool not found — Polaris Tool Catalog';
      });
  }

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
      btn.textContent = cat.name;
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

      const link = document.createElement('a');
      link.href = '/tool/' + encodeURIComponent(tool.id);
      link.className = 'tool-card-link';
      link.setAttribute('aria-label', 'View details for ' + tool.name);

      const img = document.createElement('img');
      img.className = 'tool-card-image';
      img.src = tool.image || 'https://via.placeholder.com/400x300?text=Tool';
      img.alt = tool.name;
      img.loading = 'lazy';
      img.onerror = function () { this.src = 'https://via.placeholder.com/400x300?text=Tool'; };
      link.appendChild(img);

      const body = document.createElement('div');
      body.className = 'tool-card-body';

      const catSpan = document.createElement('span');
      catSpan.className = 'tool-card-category';
      catSpan.textContent = getCategoryName(tool.category);

      const nameLink = document.createElement('a');
      nameLink.href = '/tool/' + encodeURIComponent(tool.id);
      nameLink.className = 'tool-card-name-link';
      const name = document.createElement('h3');
      name.className = 'tool-card-name';
      name.textContent = tool.name;
      nameLink.appendChild(name);

      const desc = document.createElement('p');
      desc.className = 'tool-card-desc';
      desc.textContent = tool.description || '';

      body.appendChild(catSpan);
      body.appendChild(nameLink);
      body.appendChild(desc);
      card.appendChild(link);
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
    const toolId = getToolIdFromPath();
    if (toolId) {
      loadToolDetail(toolId);
      return;
    }
    document.title = 'Polaris Tool & Building Catalog';
    showCatalog();
    loadCategories()
      .then(loadTools)
      .catch(console.error);
  }

  if (toolDetailBack) {
    toolDetailBack.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = '/';
    });
  }

  window.addEventListener('popstate', function () {
    const toolId = getToolIdFromPath();
    if (toolId) loadToolDetail(toolId);
    else {
      showCatalog();
      document.title = 'Polaris Tool & Building Catalog';
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
