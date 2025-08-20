const $ = (s, r=document) => r.querySelector(s);

function loadPosts() {
  try {
    const arr = JSON.parse(localStorage.getItem('posts') || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function getPostId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('id') || localStorage.getItem('current_post_id') || '';
}

function renderPost() {
  const posts = loadPosts();
  const id = getPostId();
  const post = posts.find(p => p.id === id);

  if (!post) {
    document.title = 'Post Not Found — MyBlog';
    $('#post-title').textContent = 'Post Not Found';
    $('#post-date').textContent = '';
    $('#post-image').style.display = 'none';
    $('#post-content').textContent = 'Sorry, we couldn’t find this post. It may have been removed or your data was cleared.';
    return;
  }

  document.title = `${post.title} — MyBlog`;
  $('#post-title').textContent = post.title || 'Untitled';
  $('#post-date').textContent = post.date || '';
  $('#post-image').src = post.img || 'https://picsum.photos/1200/600';
  $('#post-image').alt = post.title || 'Post cover';

  const tags = Array.isArray(post.tags) ? post.tags : [];
  $('#post-tags').innerHTML = tags.map(t =>
    `<span class="text-xs px-2 py-1 rounded border border-white/30 bg-white/10">${t}</span>`
  ).join('');

  const content = (post.content ?? post.desc ?? '').toString();
  $('#post-content').textContent = content;
}

renderPost();
