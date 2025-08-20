// Helpers
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// Mobile menu
$('#menu-btn')?.addEventListener('click', () => {
  const m = $('#mobile-menu');
  m?.classList.toggle('hidden');
  m?.classList.toggle('animate-slideDown');
});

// Footer soft opacity near bottom
function updateFooterStrength() {
  const scrollY = window.scrollY || window.pageYOffset;
  const docH = document.documentElement.scrollHeight;
  const winH = window.innerHeight;
  const distanceFromBottom = docH - (scrollY + winH);
  const trigger = winH * 0.25;
  let t = 1 - Math.min(Math.max(distanceFromBottom / trigger, 0), 1);
  t = t * t * (3 - 2 * t); // smoothstep
  document.documentElement.style.setProperty('--footer-strength', String(t));
}
updateFooterStrength();
addEventListener('scroll', updateFooterStrength, { passive: true });
addEventListener('resize', updateFooterStrength);

// Load posts from localStorage
function loadPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem('posts') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
let allPosts = loadPosts();

// Normalize posts
function normalizePost(p) {
  const content = (p.content ?? p.desc ?? '').toString();
  return {
    id: p.id || ('post_' + Math.random().toString(36).slice(2)),
    title: p.title || 'Untitled Post',
    date: p.date || new Date().toDateString(),
    img: p.img || 'https://picsum.photos/800/500',
    content,
    excerpt: p.desc || (content.slice(0,160) + (content.length>160 ? '...' : '')),
    tags: Array.isArray(p.tags) ? p.tags : []
  };
}
allPosts = allPosts.map(normalizePost);
// Persist any added IDs
localStorage.setItem('posts', JSON.stringify(allPosts));

// Build tag options
function renderTags() {
  const sel = $('#tag-select');
  if (!sel) return;
  const tags = Array.from(new Set(allPosts.flatMap(p => p.tags))).sort();
  sel.innerHTML = ['all', ...tags].map(t => `<option value="${t}">${t==='all'?'All tags':t}</option>`).join('');
}
renderTags();

// Render posts
let filtered = [...allPosts];
function renderPosts(list) {
  const grid = $('#posts-grid');
  const empty = $('#empty-state');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  grid.innerHTML = list.map(p => `
    <article class="post-card">
      <img src="${p.img}" alt="${p.title.replace(/"/g,'&quot;')}"
           onerror="this.onerror=null;this.src='https://picsum.photos/800/500';">
      <div class="p-6">
        <span class="text-sm text-white/80">${p.date}</span>
        <h3 class="text-xl font-semibold mt-2 mb-2">${p.title}</h3>
        <p class="text-white/90 mb-4">${p.excerpt}</p>
        ${p.tags.length ? `<div class="flex flex-wrap gap-2 mb-3">
          ${p.tags.map(t=>`<span class="text-xs px-2 py-1 rounded-full border border-white/40">${t}</span>`).join('')}
        </div>` : ''}
        <button class="btn-outline read-more" data-id="${p.id}">Read More →</button>
      </div>
    </article>
  `).join('');
}
renderPosts(filtered);

// Filters
function applyFilters() {
  const q = ($('#search-input')?.value || '').trim().toLowerCase();
  const sort = $('#sort-select')?.value || 'newest';
  const tag = $('#tag-select')?.value || 'all';

  filtered = allPosts.filter(p => {
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
    const matchTag = tag === 'all' || p.tags.includes(tag);
    return matchQ && matchTag;
  });

  filtered.sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return sort === 'newest' ? db - da : da - db;
  });

  renderPosts(filtered);
}
$('#search-input')?.addEventListener('input', applyFilters);
$('#sort-select')?.addEventListener('change', applyFilters);
$('#tag-select')?.addEventListener('change', applyFilters);

// Navigate to full post
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.read-more');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;
  localStorage.setItem('current_post_id', id);
  window.location.href = `post.html?id=${encodeURIComponent(id)}`;
});

// Initial filter
applyFilters();
