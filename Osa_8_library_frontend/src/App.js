import React, { useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import Recommendations from './components/Recommendations';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries';

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <div style={{ color: 'red' }}>
      <br />
      {errorMessage}
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState('authors');
  const [errorMessage, setErrorMessage] = useState(null);
  const client = useApolloClient();
  const authors = useQuery(ALL_AUTHORS);

  const { data, error, loading, subscribeToMore } = useQuery(ALL_BOOKS);

  subscribeToMore({
    document: BOOK_ADDED,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;
      const newBook = subscriptionData.data.bookAdded;
      const exists = prev.allBooks.find(({ id }) => id === newBook.id);
      if (exists) return prev;

      return Object.assign(
        {},
        prev,
        {
          allBooks: [...prev.allBooks, newBook],
        },
        notify(`${newBook.title} added`)
      );
    },
  });

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setPage('books');
  };

  if (error) {
    notify(error.graphQLErrors[0].message);
  }

  if (!authors.data || loading) {
    return <div>loading data...</div>;
  }

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
        <Notify errorMessage={errorMessage} />
        <Authors
          show={page === 'authors'}
          authors={authors.data.allAuthors}
          setError={notify}
        />
        <Books
          show={page === 'books'}
          books={data.allBooks}
          setError={notify}
        />
        <LoginForm
          show={page === 'login'}
          setPage={setPage}
          setToken={setToken}
          setError={notify}
        />
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('recommendations')}>
          recommendations
        </button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={handleLogout}>logout</button>
      </div>
      <div>
        <Notify errorMessage={errorMessage} />
        <Authors
          show={page === 'authors'}
          authors={authors.data.allAuthors}
          token={token}
          setError={notify}
        />
        <Books
          show={page === 'books'}
          books={data.allBooks}
          setError={notify}
        />
        <Recommendations show={page === 'recommendations'} setError={notify} />
        <NewBook show={page === 'add'} setError={notify} />
      </div>
    </div>
  );
};

export default App;
