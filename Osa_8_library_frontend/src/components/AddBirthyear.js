import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_AUTHOR } from '../queries';

const AddBirthyear = ({ authors }) => {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const [editAuthorBirthyear] = useMutation(EDIT_AUTHOR);

  const submit = async (event) => {
    event.preventDefault();

    console.log('add birthyear');

    editAuthorBirthyear({ variables: { name, born } });

    setName('');
    setBorn('');
  };

  return (
    <div>
      <h3>set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          author
          <select onChange={({ target }) => setName(target.value)} value={name}>
            {authors.map((author) => (
              <option value={author.name}>{author.name}</option>
            ))}
          </select>
        </div>
        <div>
          birthyear
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">add birthyear</button>
      </form>
    </div>
  );
};

export default AddBirthyear;
