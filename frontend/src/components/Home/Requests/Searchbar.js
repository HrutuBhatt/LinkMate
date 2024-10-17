import React, { useState } from 'react';
import axios from 'axios';
import UserProfile from './UserProfile';  
import './Searchbar.css';
const SearchUser = ({ currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`/api/users/search`, { params: { searchTerm: searchQuery } });
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="search-user-container">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for users..."
        />
        <button className="search-button" type="submit">Search</button>
      </form>

      <ul className="user-list">
        {searchResults.map(user => (
          <li key={user._id} onClick={() => handleSelectUser(user._id)} className="user-item" >
            <img src="https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg"></img>
            {user.username}
          </li>
        ))}
      </ul>

      {selectedUserId && (
        <UserProfile searchedUserId={selectedUserId} currentUserId={currentUserId} />
      )}
    </div>
  );
};

export default SearchUser;



// import React, { useState } from 'react';
// import axios from 'axios';

// const SearchBar = ({ onSelectUser }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchResults, setSearchResults] = useState([]);

//   const handleSearch = async () => {
//     try {
//       const response = await axios.get(`/api/users/search`, {
//         params: { searchTerm } // Pass searchTerm as a query parameter
//       });
//     //   await axios.get(`/api/users/search?q=${searchTerm}`);
//       setSearchResults(response.data.users);
//     } catch (error) {
//       console.error('Error searching for users:', error);
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search users..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//       <button onClick={handleSearch}>Search</button>

//       <ul>
//         {searchResults.map((user) => (
//           <li key={user._id} onClick={() => onSelectUser(user)}>
//             {user.username}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default SearchBar;
