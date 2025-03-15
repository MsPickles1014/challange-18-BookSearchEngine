import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ME } from "../utils/queries"; // ✅ Import GraphQL Query
import { REMOVE_BOOK } from "../utils/mutations"; // ✅ Import GraphQL Mutation

import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  // ✅ Fetch user data using GraphQL query
  const { loading, error, data } = useQuery(GET_ME);
  const userData = data?.me || { savedBooks: [] };

  // ✅ Mutation to remove a book
  const [removeBookMutation] = useMutation(REMOVE_BOOK, {
    update(cache, { data: { removeBook } }) {
      // ✅ Remove deleted book from cache
      cache.modify({
        id: cache.identify(userData),
        fields: {
          savedBooks(existingBooks = []) {
            return existingBooks.filter(
              (bookRef: any) => bookRef.__ref !== `Book:${removeBook.bookId}`
            );
          },
        },
      });
    },
  });

  // ✅ Function to delete a saved book
  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) {
      console.error("❌ User must be logged in.");
      return;
    }

    try {
      const { data } = await removeBookMutation({ variables: { bookId } });

      if (!data) {
        throw new Error("❌ Failed to remove book.");
      }

      console.log("✅ Book removed successfully:", data.removeBook);

      // ✅ Remove book ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error("❌ Error deleting book:", err);
    }
  };

  // ✅ Loading and error handling
  if (loading) return <h2 className="text-center mt-5">Loading...</h2>;
  if (error) return <h2 className="text-center text-danger">Error: {error.message}</h2>;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing {userData.username || "your"}'s saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData?.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? "book" : "books"}:`
            : "You have no saved books!"}
        </h2>
        <Row>
        {userData.savedBooks.map((book: { 
      bookId: string; 
      title: string; 
      authors: string[]; 
      description: string; 
      image?: string; 
    }) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image && (
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(", ")}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
