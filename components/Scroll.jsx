import React from 'react';
import styles from './Scroll.module.css';
import Left from './.archived/Left';
import Main from './Main';

const Scroll = () => {
  return (
    <div className={styles.scroll}>
      {/* <Left /> */}
      <Main />
    </div>
  );
};

export default Scroll;