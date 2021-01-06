import React, { useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { ME, ALL_BOOKS_SEARCH } from '../queries';

const Recommendations = ({ show, setError }) => {
  const { data } = useQuery(ME, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  const [allBooksSearch, { data: booksInFavoriteGenre }] = useLazyQuery(
    ALL_BOOKS_SEARCH,
    {
      onError: (error) => {
        setError(error.graphQLErrors[0].message);
      },
    }
  );

  useEffect(() => {
    if (data) {
      allBooksSearch({ variables: { genre: data.me.favoriteGenre } });
    }
  }, [data, allBooksSearch]);

  if (!show) {
    return null;
  }

  if (data === undefined || booksInFavoriteGenre === undefined) {
    return <p>Loading</p>;
  }

  return (
    <div>
      <h2>Books in your favorite genre "{data.me.favoriteGenre}"</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksInFavoriteGenre.allBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Recommendations;
