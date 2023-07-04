import React from 'react';
import styles from './Main.module.css';
import ProductSection from './ProductSection/ProductSection'
import ActionCentre from './ActionCentre'

const Main = () => {
  
  return (
    <div className={styles.main}>
      <ProductSection />
      <ActionCentre />
    </div>
  );
};

export default Main;