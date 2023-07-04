import React, { useEffect, useState } from 'react';
import styles from './CaseHistoryPanel.module.css';

import CaseIndivid from './CaseIndivid';
import CaseReport from './CaseReport';
// import CaseSearch from './CaseSearch'; // Case search no longer used

// This is the parent component
const CaseHistoryPanel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCaseIndivid, setShowCaseIndivid] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  // When a case is clicked, set the selected case ID and show the CaseReport component
  const handleCaseClick = (caseId) => {
    setSelectedCaseId(caseId);
    setShowCaseIndivid(false);
  };

  // When the return button is clicked, show the CaseIndivid component
  const handleReturn = () => {
    setShowCaseIndivid(true);
  };

  // Fetch the data from the API when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Log the updated state value when the data changes
  useEffect(() => {
  console.log('Case data: ', data); // Check the updated state value
}, [data]); // data is returned from the case_history API route

  // Fetch the data from the case_history API route
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/case_history');
      const data = await response.json();
      setData(Object.values(data));
      setLoading(false);
      console.log('fetchData:', data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // If the data is still loading, display a loading message
  if (loading) {
    return (
      <div style={{ marginLeft: '30px' }}>
        <p><i>Loading...</i></p>
      </div>
    );
  }

  // Add a new item to the data array, [not currently used]
  const addDataItem = (newItem) => {
    setData([...data, newItem]);
  };

  return (
    <div className={styles.caseHistoryPanel}>
      {/* <CaseSearch />  */}                  {/* Uncomment this line to render the CaseSearch component */}
      <div className={styles.container}>
      {showCaseIndivid ? (
        <div>
          {/* Render all the CaseIndivid components, which is a list of individual components */}
          {Object.entries(data).map(([key, item]) => (
            <CaseIndivid data={item} caseId={key} onClick={handleCaseClick} />
            ))}
        </div>
      ) : (
        <div>
          {/* Render the chosen CaseReport component when an individual case is opened */}
          <CaseReport data={data} caseId={selectedCaseId} onReturn={handleReturn} />
        </div>
      )}
      </div>
    </div>
  );
};

export default CaseHistoryPanel;