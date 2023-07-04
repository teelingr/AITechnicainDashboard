import React, { useState } from 'react';
import styles from './CaseQuery.module.css';

// This component is a child of CaseReport, it has specific details about the case (case id is passed to it)
const CaseQuery = ({caseId}) => {
    const [text, setText] = useState('');
    const [answer, setAnswer] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/ai_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, caseId }),
      });

      if (response.ok) {
        const data = await response.text();
        setAnswer(data); // Update the 'answer' state with the returned text
      } else {
        console.log('POST request failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className={styles.searchTranscript}>
      <h3>Search this Case Transcript:</h3>
      <form onSubmit={handleSubmit}>
        <p>Enter Query:</p>
        <input
        className={styles.input}
          type="text"
          id="textInput"
          name="text"
          placeholder="Type here"
          value={text}
          onChange={handleInputChange}
        />
        <button className={styles.queryEntryButton}>Submit</button>
      </form>

      {/* {answer && <p>Answer: {answer}</p>} */}
      <p className={styles.caseQuery}> {answer ? `${answer}` : ''}</p>
    </div>
  );
};

export default CaseQuery;