import React, { useState } from 'react';
import searchBarStyles from '../ProductSection/Searchbar.module.css';
import buttonStyles from './InfoPool.module.css';
import styles from './InfoPool.module.css';

const InfoPool = () => {
    const [searchTerm, setSearchTerm] = useState('');
    // const [wikipediaPage, setWikipediaPage] = useState("SEW_Eurodrive"); // default Wikipedia page

    const handleSearchChange = (event) => {
        const newTerm = event.target.value;
        setSearchTerm(newTerm);
        // const newPage = newTerm.replace(/ /g, "_"); // replace spaces with underscores
        // setWikipediaPage(newPage);
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (searchTerm.trim() !== '') {
            const encodedSearchTerm = encodeURIComponent(searchTerm);
            const url = `https://www.seweurodrive.com/os/dud/?tab=documents&country=US&language=en_us&doc_lang=de-DE,en-DE,es-ES,en-US&doc_type=D,E,F,CD,DD,PL,H,A,V&search=${encodedSearchTerm}`;
            window.open(url, '_blank');
          }
    }

    // const wikipediaUrl = `https://en.wikipedia.org/wiki/${wikipediaPage}`;

    return (
        <div className={styles.InfoPool}>
            <p className={styles.text}>Enter the serial number/model code of the machine you are looking for documentation for:</p>
        <div className={styles.InfoPoolsearch}>
            <form onSubmit={handleSearchSubmit} className={`${searchBarStyles.searchform}`}>
                <input
                    type="text"
                    placeholder="Enter Serial/Model Code..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={searchBarStyles.input}
                />
                <button type="submit" className={buttonStyles.button}>Find Documents</button>
            </form>
            </div>
        </div>
    );
};

export default InfoPool;