import React, { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from './queries';
import { ALL_AUTHORS } from './queries';

const App = () => {
  const [page, setPage] = useState('authors');
  const books = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });
  const authors = useQuery(ALL_AUTHORS);

  if (authors.loading || books.loading) {
    return <div>loading data...</div>;
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} authors={authors.data.allAuthors} />

      <Books show={page === 'books'} books={books.data.allBooks} />

      <NewBook show={page === 'add'} />
    </div>
  );
};

export default App;
