import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_AUTHOR } from '../queries';

const AddBirthyear = ({ authors, setError }) => {
  const initialState = authors[0].name;
  const [name, setName] = useState(initialState);
  const [born, setBorn] = useState(0);

  const [editAuthorBirthyear] = useMutation(EDIT_AUTHOR, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  const submit = async (event) => {
    event.preventDefault();

    editAuthorBirthyear({ variables: { name, born } });

    setName(initialState);
    setBorn(0);
  };

  return (
    <div>
      <h3>set birthyear</h3>
      <form onSubmit={submit}>
        <label>
          author{' '}
          <select onChange={({ target }) => setName(target.value)} value={name}>
            {authors.map((author) => (
              <option value={author.name} key={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>{' '}
        <label>
          birthyear{' '}
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
          <button type="submit">add birthyear</button>
        </label>
      </form>
    </div>
  );
};

export default AddBirthyear;
