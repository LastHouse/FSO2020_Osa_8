import React, { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import LogoutButton from './components/LogoutButton';
import { useQuery, useApolloClient } from '@apollo/client';
import { ALL_BOOKS } from './queries';
import { ALL_AUTHORS } from './queries';

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
  const client = useApolloClient();
  const books = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });
  const authors = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
  });

  const [errorMessage, setErrorMessage] = useState(null);

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
    console.log('logout clicked');
  };

  if (authors.loading || books.loading) {
    return <div>loading data...</div>;
  }

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
        </div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={notify} />
        <Authors show={page === 'authors'} authors={authors.data.allAuthors} />
        <Books show={page === 'books'} books={books.data.allBooks} />
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <LogoutButton handleLogout={handleLogout} />
      </div>
      <div>
        <Notify errorMessage={errorMessage} />
        <Authors
          show={page === 'authors'}
          authors={authors.data.allAuthors}
          token={token}
          setError={notify}
        />
        <Books show={page === 'books'} books={books.data.allBooks} />
        <NewBook show={page === 'add'} setError={notify} />
      </div>
    </div>
  );
};

export default App;
