import React, {useState} from 'react';
import styles from './CallerPanel.module.css';
import Image from 'next/image';

function CallerPanel(props) {
  return (
    <div className={styles.panel}>
      <div className={styles.icon_text}>
        <div className={styles.icon}>
          <Image src='svg/user.svg' alt="user icon" width={30} height={30} className={styles.my_svg}/>
        </div>
        <div className={styles.text}>
          <li>{props.name}</li>
          <li>{props.company}</li>
          <li>{props.callType}</li>
          <li>{props.product}</li>
        </div>
      </div>
    </div>
  );
};

export default CallerPanel;