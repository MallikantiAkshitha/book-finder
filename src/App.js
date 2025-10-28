import React, { useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBooks = async (e) => {
    e.preventDefault();

    if (!title && !author) {
      setError("Enter at least a book title or author to search.");
      setBooks([]);
      return;
    }

    setLoading(true);
    setError("");
    setBooks([]);

    // Build query params for the API
    const params = new URLSearchParams();
    if (title.trim()) params.append("title", title.trim());
    if (author.trim()) params.append("author", author.trim());

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?${params.toString()}`
      );
      const data = await response.json();

      let filteredBooks = data.docs || [];

      // Filter by publish year range if provided
      if (yearFrom || yearTo) {
        filteredBooks = filteredBooks.filter((book) => {
          const year = book.first_publish_year;
          if (!year) return false;
          if (yearFrom && year < parseInt(yearFrom)) return false;
          if (yearTo && year > parseInt(yearTo)) return false;
          return true;
        });
      }

      if (filteredBooks.length > 0) {
        setBooks(filteredBooks.slice(0, 20));
      } else {
        setError("No books found with the given criteria.");
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    }

    setLoading(false);
  };

  const getCoverUrl = (cover_i) =>
    cover_i
      ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`
      : "https://via.placeholder.com/128x193?text=No+Cover";

  return (
    <div className="App">
      <header>
        <h1>Book Finder</h1>
        <p>Search books by title, author, and publish year</p>
      </header>

      <form onSubmit={searchBooks} className="search-form">
        <input
          type="text"
          placeholder="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Book Title"
        />
        <input
          type="text"
          placeholder="Author name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          aria-label="Author Name"
        />
        <input
          type="number"
          placeholder="Year from"
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value)}
          aria-label="Year From"
          min="0"
          style={{ width: "80px" }}
        />
        <input
          type="number"
          placeholder="Year to"
          value={yearTo}
          onChange={(e) => setYearTo(e.target.value)}
          aria-label="Year To"
          min="0"
          style={{ width: "80px" }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="books-list">
        {books.map((book) => (
          <div key={book.key} className="book-card">
            <img
              src={getCoverUrl(book.cover_i)}
              alt={`Cover of ${book.title}`}
              loading="lazy"
            />
            <div className="book-info">
              <h2>{book.title}</h2>
              <p>
                <strong>Author:</strong>{" "}
                {book.author_name ? book.author_name.join(", ") : "Unknown"}
              </p>
              <p>
                <strong>First Published:</strong>{" "}
                {book.first_publish_year || "N/A"}
              </p>
            </div>
          </div>
        ))}
      </section>

      <footer>
        <p>Enhanced Book Finder for Alex using React and Open Library API.</p>
      </footer>
    </div>
  );
}

export default App;
