import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";

import Auth from "../utils/auth";
import { useMutation } from "@apollo/client";
import { SAVE_BOOK } from "../utils/mutations"; // ✅ Import GraphQL Mutation

import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import type { Book } from "../models/Book";
import type { GoogleAPIBook } from "../models/GoogleAPIBook";

// 📌 GraphQL SearchBooks Component
const SearchBooks = () => {
  // 📌 State to store searched books
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  // 📌 State for search input
  const [searchInput, setSearchInput] = useState("");
  // 📌 State to track saved book IDs
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // 📌 Save `savedBookIds` list to localStorage when component unmounts
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  // 📌 Function to handle book search
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput.trim()) {
      console.warn("❌ Please enter a search term.");
      return;
    }

    try {
      // 🔹 Fetch books from Google Books API
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
      );

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      const { items } = await response.json();

      const bookData = items.map((book: GoogleAPIBook) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));

      setSearchedBooks(bookData);
      setSearchInput(""); // Clear input after search
    } catch (err) {
      console.error("❌ Error fetching books:", err);
    }
  };

  // 📌 Use GraphQL mutation to save books
  const [saveBookMutation, { error }] = useMutation(SAVE_BOOK);

  // 📌 Function to save a book
  const handleSaveBook = async (bookId: string) => {
    // Find the book in `searchedBooks`
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    if (!bookToSave) {
      console.error("❌ Book not found!");
      return;
    }

    // Check if the user is logged in
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      console.error("❌ No token found, user must be logged in.");
      return;
    }

    try {
      // ✅ Use GraphQL Mutation Instead of REST API
      const { data } = await saveBookMutation({ variables: { input: bookToSave } });

      if (!data) {
        throw new Error("❌ Failed to save book.");
      }

      console.log("✅ Book saved successfully:", data.saveBook);

      // ✅ Update UI: Add saved book ID to the state
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error("❌ Error saving book:", err);
    }
  };

  return (
    <>
      {/* 🔹 Search Form */}
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      {/* 🔹 Display Books */}
      <Container>
        <h2 className="pt-5">
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <Row>
          {searchedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds.includes(book.bookId)}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds.includes(book.bookId) ? "Already Saved!" : "Save this Book!"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
