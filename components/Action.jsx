import React from 'react';
import Image from 'next/image';
import styles from './Action.module.css';
import classNames from 'classnames'; // Remember to 'npm install' this

function Action({ actionName, src, alt, onClick, isNew, isSelected }) {
    const buttonClass = classNames({
        [styles.action]: true,
        [styles.newAction]: isNew,
        [styles.selectedAction]: isSelected,
    });

    return (
        <div className={buttonClass} onClick={onClick}>
            <div className={styles.icon}>
                <Image src={src} alt={alt} width={45} height={45}/>
            </div>
            <div className={styles.text}>
                <span>{actionName}</span>
            </div>
        </div>
    );
};

Action.defaultProps = {
  isNew: false
}

export default Action;
