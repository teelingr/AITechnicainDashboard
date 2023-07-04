import React, { useState, useEffect } from 'react';
import styles from './CaseSearch.module.css';

const CaseSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(
          `http://example.com/search?term=${searchTerm}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          console.error('Error occurred during search:', response.status);
        }
      } catch (error) {
        console.error('Error occurred during search:', error);
      }
    };

    // Perform the search only if the search term is not empty
    if (searchTerm !== '') {
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className={styles.caseSearch}>
        <p>Search through previous cases, each case has been automatically documented. </p>
      <input
      className={styles.search}
        type="text"
        placeholder="Insert Case Number..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <ul>
        {searchResults.map((result) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default CaseSearch;
