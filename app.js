/* ═══════════════════════════════════════════════════════════
   MY BOOK TRACKER — app.js
   Storage : localStorage key "shelf_books"
   Sort    : newest first (addedAt DESC)
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── Constants ───────────────────────────────────────────── */
const LS_KEY = 'shelf_books';

const STATUS_LABEL = {
  'to-read' : 'To read',
  'reading' : 'Reading',
  'finished': 'Finished',
};

/* ── State ───────────────────────────────────────────────── */
let books       = [];
let searchQuery = '';
let activeModalId = null;   // book id currently being edited in a modal

/* ── DOM refs ────────────────────────────────────────────── */
const form           = document.getElementById('add-book-form');
const inputTitle     = document.getElementById('input-title');
const inputAuthor    = document.getElementById('input-author');
const inputStatus    = document.getElementById('input-status');
const inputRemarks   = document.getElementById('input-remarks');
const inputPagesRead = document.getElementById('input-pages-read');
const inputPagesTotal= document.getElementById('input-pages-total');
const errTitle       = document.getElementById('err-title');
const errAuthor      = document.getElementById('err-author');
const bookList       = document.getElementById('book-list');
const emptyState     = document.getElementById('empty-state');
const noResults      = document.getElementById('no-results');
const searchInput    = document.getElementById('search-input');
const toast          = document.getElementById('toast');

/* Pages modal */
const pagesOverlay    = document.getElementById('pages-modal-overlay');
const modalPagesRead  = document.getElementById('modal-pages-read');
const modalPagesTotal = document.getElementById('modal-pages-total');
const modalSavePages  = document.getElementById('modal-save-pages');
const modalCancelPages= document.getElementById('modal-cancel-pages');

/* Notes modal */
const notesOverlay    = document.getElementById('notes-modal-overlay');
const modalNotes      = document.getElementById('modal-notes');
const modalSaveNotes  = document.getElementById('modal-save-notes');
const modalCancelNotes= document.getElementById('modal-cancel-notes');

/* ══════════════════════════════════════════════════════════
   STORAGE
══════════════════════════════════════════════════════════ */
function loadBooks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    books = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(books)) books = [];
  } catch {
    books = [];
  }
}

function saveBooks() {
  localStorage.setItem(LS_KEY, JSON.stringify(books));
}

/* ══════════════════════════════════════════════════════════
   CRUD
══════════════════════════════════════════════════════════ */
function addBook(title, author, status, remarks, pagesRead, pagesTotal) {
  const read  = parseInt(pagesRead,  10);
  const total = parseInt(pagesTotal, 10);
  const book  = {
    id        : Date.now().toString(),
    title     : title.trim(),
    author    : author.trim(),
    status,
    remarks   : remarks.trim(),
    pagesRead : isNaN(read)  || read  < 0 ? 0 : read,
    pagesTotal: isNaN(total) || total < 1 ? 0 : total,
    addedAt   : Date.now(),
  };
  books.unshift(book);
  saveBooks();
  return book;
}

function updateStatus(id, newStatus) {
  const book = books.find(b => b.id === id);
  if (!book) return;
  book.status = newStatus;
  saveBooks();
}

function updatePages(id, pagesRead, pagesTotal) {
  const book = books.find(b => b.id === id);
  if (!book) return;
  const read  = parseInt(pagesRead,  10);
  const total = parseInt(pagesTotal, 10);
  book.pagesRead  = isNaN(read)  || read  < 0 ? 0 : read;
  book.pagesTotal = isNaN(total) || total < 1 ? 0 : total;
  /* Clamp read to total */
  if (book.pagesTotal > 0 && book.pagesRead > book.pagesTotal) {
    book.pagesRead = book.pagesTotal;
  }
  saveBooks();
}

function updateNotes(id, remarks) {
  const book = books.find(b => b.id === id);
  if (!book) return;
  book.remarks = remarks.trim();
  saveBooks();
}

function deleteBook(id) {
  books = books.filter(b => b.id !== id);
  saveBooks();
  render();
  showToast('Book removed.');
}

/* ══════════════════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════════════════ */
function validateField(input, errorEl, msg) {
  if (!input.value.trim()) {
    input.classList.add('invalid');
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
    return false;
  }
  clearError(input, errorEl);
  return true;
}

function clearError(input, errorEl) {
  input.classList.remove('invalid');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

inputTitle.addEventListener('input',  () => clearError(inputTitle,  errTitle));
inputAuthor.addEventListener('input', () => clearError(inputAuthor, errAuthor));

/* ══════════════════════════════════════════════════════════
   FORM SUBMIT
══════════════════════════════════════════════════════════ */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const okTitle  = validateField(inputTitle,  errTitle,  'Title is required.');
  const okAuthor = validateField(inputAuthor, errAuthor, 'Author is required.');
  if (!okTitle || !okAuthor) {
    if (!okTitle)  shake(inputTitle);
    if (!okAuthor) shake(inputAuthor);
    return;
  }

  addBook(
    inputTitle.value,
    inputAuthor.value,
    inputStatus.value,
    inputRemarks.value,
    inputPagesRead.value,
    inputPagesTotal.value
  );

  form.reset();
  clearError(inputTitle,  errTitle);
  clearError(inputAuthor, errAuthor);
  inputTitle.focus();
  render();
  showToast('✅ Book added!');
});

/* ══════════════════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════════════════ */
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  render();
});

/* ══════════════════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════════════════ */
function render() {
  const sorted   = [...books].sort((a, b) => b.addedAt - a.addedAt);
  const filtered = searchQuery
    ? sorted.filter(b =>
        b.title.toLowerCase().includes(searchQuery)   ||
        b.author.toLowerCase().includes(searchQuery)  ||
        (b.remarks || '').toLowerCase().includes(searchQuery)
      )
    : sorted;

  bookList.innerHTML = '';

  if (books.length === 0) {
    emptyState.hidden = false;
    noResults.hidden  = true;
  } else if (filtered.length === 0) {
    emptyState.hidden = true;
    noResults.hidden  = false;
  } else {
    emptyState.hidden = true;
    noResults.hidden  = true;
    filtered.forEach(b => bookList.appendChild(createCard(b)));
  }
}

/* ── Card factory ────────────────────────────────────────── */
function createCard(book) {
  const pct   = book.pagesTotal > 0
    ? Math.min(100, Math.round((book.pagesRead / book.pagesTotal) * 100))
    : 0;
  const isDone = pct >= 100;

  const card = document.createElement('div');
  card.className  = 'book-card';
  card.dataset.id = book.id;

  card.innerHTML = `
    <p class="card-title">${escHtml(book.title)}</p>
    <p class="card-meta">
      <strong>Author:</strong> ${escHtml(book.author)}
      &nbsp;|&nbsp;
      <strong>Status:</strong> ${STATUS_LABEL[book.status]}
    </p>
    <p class="card-progress">
      <strong>Progress:</strong>
      Page ${book.pagesRead} of ${book.pagesTotal}
      ${book.pagesTotal > 0 ? `<span style="color:#6b7280">(${pct}%)</span>` : ''}
    </p>
    ${book.pagesTotal > 0 ? `
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${isDone ? 'done' : ''}" style="width:${pct}%"></div>
      </div>` : ''}
    <div class="card-remarks-box">
      <strong>Remarks:</strong>
      ${book.remarks ? escHtml(book.remarks) : '<span style="color:#9ca3af">No remarks added</span>'}
    </div>
    <div class="card-actions">
      <select class="card-status-select" aria-label="Change status" data-action="change-status">
        ${Object.entries(STATUS_LABEL).map(([val, lbl]) =>
          `<option value="${val}"${val === book.status ? ' selected' : ''}>${lbl}</option>`
        ).join('')}
      </select>
      <button class="btn-teal"  data-action="update-pages">Update Pages</button>
      <button class="btn-green" data-action="edit-notes">Edit Notes</button>
      <button class="btn-red"   data-action="delete">Delete</button>
    </div>
  `;

  /* Events */
  card.addEventListener('change', (e) => {
    if (e.target.dataset.action === 'change-status') {
      updateStatus(book.id, e.target.value);
      /* Refresh meta text without full re-render */
      const meta = card.querySelector('.card-meta');
      meta.innerHTML = `
        <strong>Author:</strong> ${escHtml(book.author)}
        &nbsp;|&nbsp;
        <strong>Status:</strong> ${STATUS_LABEL[e.target.value]}
      `;
      book.status = e.target.value;
      showToast(`Status → ${STATUS_LABEL[e.target.value]}`);
    }
  });

  card.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'delete')       deleteBook(book.id);
    if (action === 'update-pages') openPagesModal(book);
    if (action === 'edit-notes')   openNotesModal(book);
  });

  return card;
}

/* ══════════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════════ */

/* ── Pages modal ─────────────────────────────────────────── */
function openPagesModal(book) {
  activeModalId = book.id;
  modalPagesRead.value  = book.pagesRead  || '';
  modalPagesTotal.value = book.pagesTotal || '';
  pagesOverlay.hidden   = false;
  modalPagesRead.focus();
}

function closePagesModal() {
  pagesOverlay.hidden = true;
  activeModalId = null;
}

modalSavePages.addEventListener('click', () => {
  if (!activeModalId) return;
  updatePages(activeModalId, modalPagesRead.value, modalPagesTotal.value);
  closePagesModal();
  render();
  showToast('📖 Pages updated!');
});

modalCancelPages.addEventListener('click', closePagesModal);
pagesOverlay.addEventListener('click', (e) => { if (e.target === pagesOverlay) closePagesModal(); });

/* ── Notes modal ─────────────────────────────────────────── */
function openNotesModal(book) {
  activeModalId   = book.id;
  modalNotes.value = book.remarks || '';
  notesOverlay.hidden = false;
  modalNotes.focus();
}

function closeNotesModal() {
  notesOverlay.hidden = true;
  activeModalId = null;
}

modalSaveNotes.addEventListener('click', () => {
  if (!activeModalId) return;
  updateNotes(activeModalId, modalNotes.value);
  closeNotesModal();
  render();
  showToast('💬 Notes saved!');
});

modalCancelNotes.addEventListener('click', closeNotesModal);
notesOverlay.addEventListener('click', (e) => { if (e.target === notesOverlay) closeNotesModal(); });

/* Close modals on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closePagesModal(); closeNotesModal(); }
});

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function shake(el) {
  el.animate([
    { transform:'translateX(0)' },
    { transform:'translateX(-6px)' },
    { transform:'translateX(6px)' },
    { transform:'translateX(-4px)' },
    { transform:'translateX(4px)' },
    { transform:'translateX(0)' },
  ], { duration: 320, easing: 'ease-in-out' });
}

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
loadBooks();
render();
