const {
  ApolloServer,
  UserInputError,
  gql,
  AuthenticationError,
} = require('apollo-server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY';

const mongoose = require('mongoose');
const DataLoader = require('dataloader');

const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
require('dotenv').config();

mongoose.set('useFindAndModify', false);

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

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: [Book]
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  enum YesNo {
    YES
    NO
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(genre: String): [Book!]
    allAuthors(born: YesNo): [Author!]
    me: User
    booksByFavoriteGenre: [Book!]
    bookAdded: Book!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String]!
    ): Book!
    editAuthor(name: String!, born: Int): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`;

const { PubSub } = require('apollo-server');
const pubsub = new PubSub();
pubsub.ee.setMaxListeners(100);

const batchGetBooksById = async (ids) => {
  const books = ids.map((authorId) => {
    return Book.find({
      author: { $in: [authorId] },
    });
  });
  return books;
};

const bookLoader = new DataLoader(batchGetBooksById);

// Args.author puuttuu allBooksista

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre) {
        let result = await Book.find({
          genres: { $all: [args.genre] },
        }).populate('author');
        return result;
      } else {
        const result = await Book.find({}).populate('author');
        return result;
      }
    },

    allAuthors: () => Author.find({}),

    me: (root, args, context) => {
      return context.currentUser;
    },
    booksByFavoriteGenre: async (context) =>
      await Books.find({
        favoriteGenre: { $in: [context.currentUser.favoriteGenre] },
      }),
  },

  Author: {
    bookCount: (root) => {
      return bookLoader.load(root.id);
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const book = new Book({ ...args });
      const currentUser = context.currentUser;
      const currentAuthor = await Author.findOne({
        name: { $in: [args.author] },
      });

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      // Jos kirjan tallennus ei onnistu, niin uusi kirjailija tallennetaan silti...

      if (!currentAuthor) {
        const newAuthor = new Author({ name: args.author });
        await newAuthor.save();
        book.author = newAuthor;
        try {
          await book.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      } else {
        try {
          book.author = currentAuthor;
          await book.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
      pubsub.publish('BOOK_ADDED', { bookAdded: book });

      return book;
    },

    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: { $in: [args.name] } });
      author.born = args.born;
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      try {
        await author.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      return author;
    },

    createUser: async (root, args, context) => {
      const user = new User({ ...args });
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      try {
        await user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      return user;
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials');
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsUrl}`);
});
