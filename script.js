// Shortcuts
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// ---------------- Smooth Scroll ----------------
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const dest = document.querySelector(link.getAttribute('href'));
    if(dest){
      e.preventDefault();
      dest.scrollIntoView({ behavior:'smooth' });
    }
  });
});

// ---------------- Mobile Menu ----------------
const menuBtn = $('#menu-btn');
const mobileMenu = $('#mobile-menu');

menuBtn?.addEventListener('click', ()=>{
  mobileMenu.classList.toggle('hidden');
  mobileMenu.classList.toggle('animate-slideDown');
});

$$('#mobile-menu a').forEach(a => 
  a.addEventListener('click', ()=> mobileMenu.classList.add('hidden'))
);

// ---------------- Logout ----------------
$('#logout-link')?.addEventListener('click', e=>{
  e.preventDefault();
  localStorage.removeItem('myblog_logged_in');
  window.location.href='login.html';
});

$('#logout-link-mobile')?.addEventListener('click', e=>{
  e.preventDefault();
  localStorage.removeItem('myblog_logged_in');
  window.location.href='login.html';
});

// ---------------- Back to Top ----------------
const backToTopBtn = $('#back-to-top');
window.addEventListener('scroll', ()=>{
  if(window.scrollY > 300){
    backToTopBtn?.classList.remove('opacity-0','pointer-events-none');
  } else {
    backToTopBtn?.classList.add('opacity-0','pointer-events-none');
  }
});
backToTopBtn?.addEventListener('click', ()=> 
  window.scrollTo({ top:0, behavior:'smooth' })
);

// ---------------- Newsletter ----------------
const nForm = $('#newsletter-form');
const nMsg  = $('#newsletter-msg');

nForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const email = nForm.querySelector('input[type="email"]').value.trim();
  const valid = /^[^ ]+@[^ ]+\.[a-z]{2,}$/i.test(email);

  nMsg.classList.remove('hidden','text-red-300','text-green-300');

  if(!valid){
    nMsg.textContent = '❌ Enter a valid email!';
    nMsg.classList.add('text-red-300');
    return;
  }

  const subs = JSON.parse(localStorage.getItem('subscribers')||'[]');
  if(!subs.includes(email)) subs.push(email);
  localStorage.setItem('subscribers', JSON.stringify(subs));

  nMsg.textContent = '🎉 You’re subscribed!';
  nMsg.classList.add('text-green-300');
  nForm.reset();
});

// ---------------- Posts ----------------
const defaultPosts = [
  { id:'p1', title:'The Art of Writing', date:'June 12, 2023', img:'https://images.unsplash.com/photo-1546074177-ffdda98d214f?auto=format&fit=crop&w=1074&q=80', desc:'Exploring techniques that make writing compelling.', content:'Long-form content about writing techniques...', tags:['writing','creativity'] },
  { id:'p2', title:'Mindfulness in Daily Life', date:'May 28, 2023', img:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1073&q=80', desc:'Simple practices to live more mindfully.', content:'Mindfulness tips and routines...', tags:['mindfulness','habits'] },
  { id:'p3', title:'Building Better Habits', date:'April 15, 2023', img:'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2070&q=80', desc:'Strategies for creating lasting habits.', content:'Habit formation frameworks and strategies...', tags:['habits','productivity'] }
];

function normalizePosts(list){
  let changed=false;
  list.forEach((p,i)=>{
    if(!p.id){ p.id = 'post_'+(Date.now()+i); changed=true; }
    if(!p.tags) p.tags = [];
    if(!p.content) p.content = p.desc || '';
    if(!p.desc) p.desc = p.content.slice(0,140)+'...';
    if(!p.date) p.date = new Date().toDateString();
    if(!p.img)  p.img = 'https://picsum.photos/800/500';
  });
  return { list, changed };
}

function loadPosts(){
  try{
    const s = JSON.parse(localStorage.getItem('posts')||'[]');
    const { list, changed } = normalizePosts(Array.isArray(s)&&s.length ? s : defaultPosts.slice());
    if(changed) localStorage.setItem('posts', JSON.stringify(list));
    return list;
  }catch{
    return defaultPosts.slice();
  }
}
function savePosts(){ localStorage.setItem('posts', JSON.stringify(posts)); }

let posts = loadPosts();
const postGrid = $('#post-grid');

function renderPosts(){
  if(!postGrid) return;
  postGrid.innerHTML = posts.map(p=>`
    <article class="post-card">
      <img src="${p.img}" alt="${p.title}">
      <div class="p-6">
        <span class="text-sm text-white/80">${p.date||''}</span>
        <h3 class="text-xl font-semibold mt-2 mb-2">${p.title}</h3>
        <p class="text-white/90 mb-4">${p.desc||''}</p>
        ${p.tags?.length ? `<div class="flex flex-wrap gap-2 mb-3">
          ${p.tags.map(t=>`<span class="text-xs px-2 py-1 rounded-full border border-white/40">${t}</span>`).join('')}
        </div>` : ''}
        <button class="btn-outline read-more" data-id="${p.id}">Read More →</button>
      </div>
    </article>
  `).join('');
}
renderPosts();

// ---------------- Read More (demo) ----------------
// Read More → open full post page
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.read-more');
  if (!btn) return;                 // clicked something else
  const id = btn.dataset.id;
  if (!id) return;                  // missing data-id (shouldn't happen)

  // remember which post to open
  try {
    localStorage.setItem('current_post_id', id);
  } catch (err) {
    console.warn('localStorage not available:', err);
  }

  // navigate to reader view for this post
  window.location.href = 'post.html?id=' + encodeURIComponent(id);
});


// ---------------- Write Modal ----------------
const modal = $('#blog-modal');
['#new-blog-btn','#open-new-blog','#open-new-blog-mobile','#footer-write']
  .map(sel=>$(sel)).filter(Boolean)
  .forEach(b=>b.addEventListener('click', e=>{
    e.preventDefault();
    modal.classList.remove('hidden');
  }));

$('#close-modal')?.addEventListener('click', ()=> modal.classList.add('hidden'));
modal?.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });

$('#blog-form')?.addEventListener('submit', e=>{
  e.preventDefault();
  const title = $('#blog-title').value.trim();
  const img = $('#blog-image').value.trim() || 'https://picsum.photos/800/500';
  const content = $('#blog-content').value.trim();
  const tagsRaw = $('#blog-tags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim()).filter(Boolean) : [];
  
  if(!title || !content) return;

  const desc = content.length>140 ? content.slice(0,140)+'...' : content;
  posts.unshift({ id:'post_'+Date.now(), title, date:new Date().toDateString(), img, desc, content, tags });
  savePosts(); 
  renderPosts();
  modal.classList.add('hidden');
  $('#blog-form').reset();
});

// ---------------- Export / Import ----------------
$('#export-posts')?.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(posts,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); 
  const a = document.createElement('a');
  a.href = url;
  a.download = `myblog-posts-${Date.now()}.json`;   // ✅ fixed
  a.click();
  URL.revokeObjectURL(url);
});

$('#import-file')?.addEventListener('change', async e=>{
  const file = e.target.files[0]; 
  if(!file) return;
  try{
    const text = await file.text(); 
    const imported = JSON.parse(text);
    if(Array.isArray(imported)){
      const { list } = normalizePosts(imported);
      posts = list;
      savePosts();
      renderPosts();
      alert('Imported posts successfully.');
    } else {
      alert('Invalid file format.');
    }
  }catch{
    alert('Failed to import. Please select a valid JSON file.');
  }
});

// Handle blog form submission
const blogForm = document.getElementById("blogForm");
if (blogForm) {
  blogForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (title && content) {
      // Save blog to localStorage
      const blogs = JSON.parse(localStorage.getItem("blogs")) || [];
      blogs.push({ title, content, date: new Date().toLocaleString() });
      localStorage.setItem("blogs", JSON.stringify(blogs));

      alert("Blog published successfully!");
      window.location.href = "feed.html"; // redirect to feed
    } else {
      alert("Please fill out all fields!");
    }
  });
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.read-more');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;
  localStorage.setItem('current_post_id', id);
  window.location.href = `post.html?id=${encodeURIComponent(id)}`;
});
