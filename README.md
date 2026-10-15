# 📚 My Book Tracker

A lightweight, fully client-side Book Tracker web app built with plain HTML, CSS and JavaScript — no frameworks, no build step, no account needed.

## 🔗 Live Demo
> [View Live on GitHub Pages](https://your-username.github.io/book-tracker)

---

## ✨ Features

- **Add books** with Title, Author, Status, Remarks/Notes, Current Page and Total Pages
- **Required field validation** — error message shown under each empty field on submit
- **Live search** — filters by title, author or remarks as you type (case-insensitive)
- **Progress bar** on every card showing pages read vs. total pages with a percentage
- **Inline status change** — dropdown on each card saves instantly
- **Update Pages** and **Edit Notes** via clean modal dialogs
- **Persistent storage** — all data saved in `localStorage`; survives page refresh and browser restart
- **Newest first** — books always listed in the order they were added, most recent at the top
- **Delete** any book with one click

---

## 🗂 File Structure

```
book-tracker/
├── index.html   # App structure — form, search, book list, modals
├── style.css    # All styling — clean light theme, progress bars, modals
└── app.js       # All logic — CRUD, validation, localStorage, search
```

No dependencies. No build step. Open `index.html` directly in any modern browser.

---

## 💾 How Data is Saved

Books are stored in the browser's `localStorage` under the key `"shelf_books"` as a JSON array.

Each book record looks like this:

```json
{
  "id": "1728958104523",
  "title": "Aadujeevitham",
  "author": "Benyamin",
  "status": "reading",
  "remarks": "Really gripping story.",
  "pagesRead": 120,
  "pagesTotal": 320,
  "addedAt": 1728958104523
}
```

- **Load** — `JSON.parse(localStorage.getItem("shelf_books"))` runs on page open
- **Save** — `localStorage.setItem(...)` is called after every add, update or delete

---

## 🚀 How to Run Locally

1. Clone or download this repository
2. Open `index.html` in your browser

That's it — no server, no install.

---

## 🛠 Built With

- HTML5
- CSS3 (custom properties, Grid, Flexbox, animations)
- Vanilla JavaScript (ES6+)
- Browser `localStorage` API

---

## 📸 Screenshots

> Add screenshots here after deployment.

---

## 📄 Prompts Used

 The five key prompts used to build this project with AI assistance.

# Prompt Log

1. **Prompt:** "I want to build a Book Tracker web page using plain HTML, CSS and JavaScript. Features: add a book with title, author and status, show the list newest first, search, change status, and keep the data after a refresh."
   - **What happened:** The foundational file structure, form elements, and basic list rendering were successfully generated.

2. **Prompt:** "Add a search box above the list. As I type, show only books whose title or author contains the text, ignoring capital letters"
   - **What happened:** Searching worked for lowercase entries, but uppercase searches (e.g., "BEN") failed because case sensitivity wasn't handled properly.
   - **Bug Fix:** Updated the search logic to convert both input terms and book text to lowercase using `.toLowerCase().

3. **Prompt:** "Save the book list in localStorage so it is still there after a refresh[span_21]."
   - **What happened:** The book list was saved, but changing a book's status reset the status back to 'To read' upon reloading the page.
   - **Bug Fix:** Notified the AI about the status persistence bug, and it corrected the array mapping and state-saving handlers.

4. **Prompt:** "Add remarks and page number tracking with interactive update buttons for each book card."
   - **What happened:** The buttons were initially unclickable due to layout stacking overlaps and incorrect index references when reversing the list display.
   - **Bug Fix:** Assigned unique IDs to each book object and added `z-index` and position styling to ensure all action buttons are fully interactive.
