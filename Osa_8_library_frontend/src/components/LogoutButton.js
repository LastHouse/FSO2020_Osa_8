import React from 'react';

const LogoutButton = ({ handleLogout }) => {
  return (
    <div>
      <br></br>
      <button onClick={handleLogout}>logout</button>
    </div>
  );
};

export default LogoutButton;
