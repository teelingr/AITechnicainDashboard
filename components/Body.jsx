import React, { useState } from 'react';
import styles from './Scroll.module.css';
import Navbar from './Navbar';
import Scroll from './Scroll';

const Body = () => {

    return (
        <div className={styles.body}>
            <Navbar/>
            <Scroll/>
        </div>
    );
};

export default Body;