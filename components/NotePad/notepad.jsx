import React, { useState } from "react";
import styles from './Notepad.module.css'; 

function Notepad() {
    const [text, setText] = useState('');

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    return (
        <div className={styles.pane}>
            <h3 className={styles.title}>Technician Notepad</h3>
            <textarea
                value={text}
                onChange={handleTextChange}
                className={styles.textarea}
                placeholder="Type here..."
            />
        </div>
    );
};

export default Notepad;
