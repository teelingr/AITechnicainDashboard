import React, { useState } from 'react';
import styles from './CaseIndivid.module.css';
import CaseReport from './CaseReport';

// This component is a child of CaseHistoryPanel, it has specific details about the case (case id is passed to it)
const CaseIndivid = ({ data, caseId, onClick }) => {
  const [caseOpen, setCaseOpen] = useState(false);

  const handleReturn = () => {
    setCaseOpen(false);
  };

  // When the open button is clicked, show the CaseReport component
  const handleOpen = () => {
    console.log('handleOpen triggered');
    setCaseOpen(true);
    onClick(caseId);
  };

  if (caseOpen) {
    // Pass the data and caseId to the CaseReport component
    return <CaseReport data={data} caseId={caseId} onReturn={handleReturn}/>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h3><b>Case No. {caseId}</b></h3>
        <h4>Company: {data.company}</h4>
        <p>Date of Case: {data.dateTime}</p>
      </div>

      <div className={styles.product}>
        <h4>Serial No. {data.serial_number}</h4>
        <button className={styles.openButton} onClick={handleOpen}>Open</button>
      </div>
    </div>
  );
};

export default CaseIndivid;
