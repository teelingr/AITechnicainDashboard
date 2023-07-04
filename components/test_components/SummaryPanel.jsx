import React, { useState, useEffect } from 'react';

const SummaryPanel = () => {

    const [summary, setSummary] = useState(null);

    const fetchSummary = async () => {
    try {
        const response = await fetch('http://localhost:5000/summary');
        const summaryData = await response.text();
        setSummary(summaryData);
        console.log(summaryData);
    } catch (error) {
        console.error('Error fetching summary', error);
    }
    };

    const handleButtonClick = async () => {
    try {
        await fetchSummary();
    } catch (error) {
        console.error('Error handling button click', error);
    }
    };

    useEffect(() => {
    fetchSummary();
    }, []);

  return (
    <div>
        <h1>Summary</h1>
          <button onClick={handleButtonClick}>Click here for Summary</button>
          {summary ? <p style={{ color: 'green'}}>{summary}</p> : <p style={{ color: 'red' }}>Not Connected </p>}
    </div>
  );
};

export default SummaryPanel;