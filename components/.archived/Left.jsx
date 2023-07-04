import React from 'react';
import styles from './Left.module.css';
import CallerPanel from './CallerPanel';

const Left = () => {
  return (
    <div className={styles.left}>
      <h2>Call Queue</h2>
      <CallerPanel name="Ronald Kloff" company="Durr Poland" callType="Remote Service Call" product="MOVIMOT C"/>
      <CallerPanel name="Adam Jones" company="BMW" callType="Hotline Service Call" product="MOVIDRIVE MMD"/>
      <CallerPanel name="Niels Bjorn" company="Audi" callType="Remote Service Call" product="N/A"/>
      <CallerPanel name="Darren Hogan" company="Dublin Airport" callType="Remote Service Call" product="MOVIMOT A"/>
      <CallerPanel name="Stella Stewart" company="Gatwick Airport" callType="Hotline Service Call" product="MOVIDRIVE B"/>
      <CallerPanel name="John Doe" company="Mazda" callType="Remote Desktop Call" product="MOVIMOT C"/>
    </div>
  );
};

export default Left;