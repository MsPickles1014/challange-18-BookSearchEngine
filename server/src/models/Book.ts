import { Schema, model, type Document } from 'mongoose';

export interface BookDocument extends Document {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image?: string;
  link?: string;

}

// ✅ Define Book Schema (for subdocument & standalone model usage)
const bookSchema = new Schema<BookDocument>({
  authors: [
    { type: String, 
    }
  ],
  description: {
    type: String,
    required: true,
    trim: true,
  },
  bookId: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
});

// ✅ Create Book Model (only for querying books separately)
const Book = model<BookDocument>('Book', bookSchema);

// ✅ Export both the schema (for User model) and model (for book queries)
export default Book;
 