const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  // Event listener untuk form tambah buku
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  // Event listener untuk form cari buku
  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  // Event listener untuk toggle dark mode
  const darkModeToggle = document.getElementById("darkModeToggle");
  darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
  });

  // Load data dari localStorage kalau ada
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  // Render ulang daftar buku setiap ada perubahan
  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    for (const book of books) {
      const bookElement = makeBookElement(book);
      if (!book.isComplete) {
        incompleteBookList.append(bookElement);
      } else {
        completeBookList.append(bookElement);
      }
    }
  });
});

// Cek apakah localStorage tersedia
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// Simpan data ke localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// Load data dari localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Tambah buku baru
function addBook() {
  const bookTitle = document.getElementById("bookFormTitle").value;
  const bookAuthor = document.getElementById("bookFormAuthor").value;
  const bookYear = document.getElementById("bookFormYear").value;
  const bookIsComplete = document.getElementById("bookFormIsComplete").checked;

  if (!bookTitle || !bookAuthor || !bookYear) {
    alert("Semua kolom harus diisi!");
    return;
  }

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );
  books.push(bookObject);

  saveData();
}

// Generate ID untuk buku
function generateId() {
  return +new Date();
}

// Buat objek buku
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Buat elemen buku
function makeBookElement(book) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = book.title;
  bookTitle.setAttribute("data-testid", "bookItemTitle");

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis: ${book.author}`;
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun: ${book.year}`;
  bookYear.setAttribute("data-testid", "bookItemYear");

  const bookContainer = document.createElement("div");
  bookContainer.setAttribute("data-bookid", book.id);
  bookContainer.setAttribute("data-testid", "bookItem");
  bookContainer.classList.add("book_item");
  bookContainer.append(bookTitle, bookAuthor, bookYear);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");

  const toggleButton = document.createElement("button");
  toggleButton.innerHTML = book.isComplete
    ? '<i class="fas fa-undo"></i> Belum selesai dibaca'
    : '<i class="fas fa-check"></i> Selesai dibaca';
  toggleButton.classList.add("green", "tooltip");
  toggleButton.setAttribute(
    "data-tooltip",
    book.isComplete
      ? "Pindahkan ke Belum selesai dibaca"
      : "Pindahkan ke Selesai dibaca"
  );
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  toggleButton.addEventListener("click", function () {
    toggleBookStatus(book.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fas fa-trash"></i> Hapus Buku';
  deleteButton.classList.add("red", "tooltip");
  deleteButton.setAttribute("data-tooltip", "Hapus Buku");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.addEventListener("click", function () {
    deleteBook(book.id);
  });

  const editButton = document.createElement("button");
  editButton.innerHTML = '<i class="fas fa-edit"></i> Edit Buku';
  editButton.classList.add("tooltip");
  editButton.setAttribute("data-tooltip", "Edit Buku");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.addEventListener("click", function () {
    editBook(book.id);
  });

  actionContainer.append(toggleButton, deleteButton, editButton);
  bookContainer.append(actionContainer);

  return bookContainer;
}

// Ubah status buku (selesai/belum selesai)
function toggleBookStatus(bookId) {
  const bookTarget = books.find((book) => book.id === bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = !bookTarget.isComplete;
  saveData();
}

// Hapus buku
function deleteBook(bookId) {
  const bookTargetIndex = books.findIndex((book) => book.id === bookId);
  if (bookTargetIndex === -1) return;

  books.splice(bookTargetIndex, 1);
  saveData();
}

// Edit buku
function editBook(bookId) {
  const bookTarget = books.find((book) => book.id === bookId);
  if (bookTarget == null) return;

  const newTitle = prompt("Masukkan judul baru:", bookTarget.title);
  const newAuthor = prompt("Masukkan penulis baru:", bookTarget.author);
  const newYear = prompt("Masukkan tahun rilis baru:", bookTarget.year);

  if (newTitle && newAuthor && newYear) {
    bookTarget.title = newTitle;
    bookTarget.author = newAuthor;
    bookTarget.year = newYear;
    saveData();
  }
}

// Cari buku berdasarkan judul
function searchBook() {
  const searchBookTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchBookTitle)
  );

  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const book of filteredBooks) {
    const bookElement = makeBookElement(book);
    if (!book.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
}
