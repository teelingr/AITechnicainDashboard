import React, { useState, useEffect } from 'react';
import styles from './Searchbar.module.css';

function Searchbar({ onSerialNumberSelect }) {
    const [searchValue, setSearchValue] = useState('');
    const [serialNumbers, setSerialNumbers] = useState([]);

    function handleSearch(value = searchValue) { // fetches autofill serial numbers from the server
        if (value !== '') {
            console.log('Fetching serial numbers for:', value);
            return fetch(`http://localhost:5000/api/search-serial-number`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ serial_number: value })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
                })
            .then(data => {
                // Process the data returned by the server
                console.log(data);
                setSerialNumbers(data);
            })
            .catch(error => {
                console.error('Error in jsx:', error);
                console.log('the search value is:', value);
            });
        }
    };

    const handleInputChange = (event) => {
        setSearchValue(event.target.value);
        handleSearch(event.target.value);
    };

    const handleSelectChange = (event) => {
        console.log('Selected serial number:', event.target.value);
        onSerialNumberSelect(event.target.value);
    };

    useEffect(() => {
        handleSearch();
    }, [searchValue]);
    
    return (
        <form className={styles.searchform}>
        <input
            type="text"
            placeholder="Enter Serial Number..."
            value={searchValue}
            onChange={handleInputChange}
        />
        <select onChange={handleSelectChange}>
            <option value="">
                Choose a serial number
            </option>
            {serialNumbers.map((serialNumber) => (
                <option key={serialNumber} value={serialNumber}>
                    {serialNumber}
                </option>
            ))}
        </select>
        </form>
    );
}

export default Searchbar;