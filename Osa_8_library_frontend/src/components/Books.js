import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { ALL_BOOKS_SEARCH } from '../queries';

const Books = ({ show, books, setError }) => {
  let genres = books.map((book) => book.genres);
  let mergedGenres = [].concat.apply([], genres);
  let uniqueGenres = [...new Set(mergedGenres)];
  const [genre, setGenre] = useState(null);

  const [allBooksSearch, { loading, data }] = useLazyQuery(ALL_BOOKS_SEARCH, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  if (!show) {
    return null;
  }

  if (loading) return <p>Loading ...</p>;

  if (!data || !genre) {
    return (
      <div>
        <h2>Books</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books.map((b) => (
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <br></br>
        <div>
          {uniqueGenres.map((genre, i) => (
            <button
              onClick={() => {
                allBooksSearch({ variables: { genre } });
                setGenre(genre);
              }}
              key={i}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2>Books</h2>
      <h4>Books in {genre} genre</h4>
      <button
        onClick={() => {
          allBooksSearch();
          setGenre(null);
        }}
      >
        Reset genre choice
      </button>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br></br>
      <div>
        {uniqueGenres.map((genre, i) => (
          <button
            onClick={() => {
              allBooksSearch({ variables: { genre } });
              setGenre(genre);
            }}
            key={i}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
