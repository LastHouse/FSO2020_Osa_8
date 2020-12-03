const { ApolloServer, UserInputError, gql } = require('apollo-server');
const { v1: uuid } = require('uuid');
const mongoose = require('mongoose');
const Book = require('./models/book');
const Author = require('./models/author');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

let authors = [
  {
    name: 'Robert Martin',
    id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
    born: 1963,
  },
  {
    name: 'Fyodor Dostoevsky',
    id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
    born: 1821,
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
  },
];

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 */

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'design'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'crime'],
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'revolution'],
  },
];

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int!
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks: [Book!]
    allAuthors: [Author!]
  }

  type Mutation {
    addBook(
      title: String!
      published: String
      author: String!
      genres: [String]!
    ): Book
    editAuthor(name: String!, born: String): Author
  }
`;

// allBooks(author: String, genre: String): [Book!]

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    /* allBooks: (root, args) => {
    if (args.author && args.genre) {
        let result = books
          .filter(
            (book) => book.author.toLowerCase() === args.author.toLowerCase()
          )
          .filter((item) =>
            item.genres.some((book) => book.includes(args.genre.toLowerCase()))
          );
        console.log(result);
        return result;
      }
      if (args.author) {
        let result = books.filter(
          (book) => book.author.toLowerCase() === args.author.toLowerCase()
        );
        console.log(result);
        return result;
      }
      if (args.author) {
        let result = books.filter((item) =>
          item.genres.some((book) => book.includes(args.genre.toLowerCase()))
        );
        console.log(result);
        return result; 
      }
    }, */
    allBooks: () => Book.find({}),
    allAuthors: () => Author.find({}),
    /* },
    Author: {
      bookCount: (root) => {
        let booksByAuthor = books.filter((book) => book.author === root.name);
        return booksByAuthor.length;
      },
    },
    Mutation: {
      addBook: (root, args) => {
        if (books.find((b) => b.title === args.title)) {
          throw new UserInputError('Title must be unique', {
            invalidArgs: args.title,
          });
        }
        const book = { ...args, id: uuid() };
        books = books.concat(book);
        return book;
      },
  
      editAuthor: (root, args) => {
        const author = authors.find((a) => a.name === args.name);
        if (!author) {
          return null;
        }
        const updatedAuthor = { ...author, born: args.born };
        authors = authors.map((a) => (a.name === args.name ? updatedAuthor : a));
        return updatedAuthor;
      },
    }, */
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
