import { gql } from '@apollo/client';

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      published
      genres
      id
    }
  }
`;

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      id
      born
      bookCount
    }
  }
`;

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $published: Int, $genres: [String]!) {
    addBook(title: $title, published: $published, genres: $genres) {
      title
      published
      id
      genres
    }
  }
`;

export const EDIT_AUTHOR = gql`
  mutation editAuthorBirthyear($name: String!, $born: Int) {
    editAuthor(name: $name, born: $born) {
      name
      id
      born
      bookCount
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
