
import React, { useState, useContext } from 'react';
import SearchBar from './Searchbar';
// import UserProfile from './UserProfile';
import { AuthContext } from '../../../context/AuthContext';

const RequestsPage = () => {
//   const [selectedUser, setSelectedUser] = useState(null);
  const { userId } = useContext(AuthContext);

  return (
    <div>
      <h1>Find and Add Friends</h1>
      <SearchBar currentUserId={userId} />
      {/* {selectedUser && <UserProfile selectedUser={selectedUser} currentUserId={userId} />} */}
    </div>
  );
};

export default RequestsPage;
