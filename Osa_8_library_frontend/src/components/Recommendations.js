import React from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS_SEARCH } from '../queries';

const Recommendations = ({ show, favoriteGenre, setError }) => {
  const genre = favoriteGenre;

  const { loading, error, data } = useQuery(ALL_BOOKS_SEARCH, {
    variables: { genre },
  });

  if (error) {
    setError(error.graphQLErrors[0].message);
  }

  if (!show | !favoriteGenre) {
    return null;
  }

  if (loading) return <p>Loading ...</p>;

  return (
    <div>
      <h2>Books in your favorite genre "{favoriteGenre}"</h2>
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
    </div>
  );
};
export default Recommendations;
