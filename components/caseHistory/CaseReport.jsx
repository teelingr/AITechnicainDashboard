import React, { useState } from 'react';
import styles from './CaseReport.module.css';
import AudioDownloadButton from './AudioDownloadButton';
import TranscriptDownloadButton from './TranscriptDownloadButton';
import Image from 'next/image';
import CaseQuery from './CaseQuery';

// This component is a child of CaseIndivid, it has specific details about the case (case id is passed to it)
const CaseReport = ({ data, caseId, onReturn }) => {
    const [isVisible, setIsVisible] = useState(true);

  const handleReturn = () => {
    setIsVisible(false);
    onReturn();
  };

  if (!isVisible) {
    return null && <CaseReport data={data} caseId={caseId} onReturn={handleReturn}/>; // Return null if the component is not visible
  }

  ///////////////// Send Case Number to Report Template for PDF Generation /////////////////
  // Proposal: API request to generate new pdf based on this case. Reason for generating pdf on button click 
  // is so any extra edits can be made on this page and added to the new report.
  ////////////////////////////////////////////////////////////////////////////////////////
  const handleReport = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to the server to get the PDF report for this case id
      const response = await fetch('http://localhost:5000/get_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
      });

      // If the request is successful, get the blob from the response
      if (response.ok) {
        const blob = await response.blob();

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(url, '_blank');

      } else {
        console.log('POST request failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.caseReport}>
      <div className={styles.caseReportHeader}>
        <div className={styles.caseReportHeaderLeft}>
          <h3>Case No. {caseId}</h3>
          <p>Date of Case: {data[caseId].dateTime}</p>
        </div>
        <div className={styles.caseReportHeaderRight}>
          <h3>Company: {data[caseId].company}</h3>
          <p>Customer: {data[caseId].nameCustomer}</p>
        </div>
      </div>
      
    <div className={styles.bodyProductContainer}> {/*Contains the body on the left and product image and serial on the right*/}
      <div className={styles.caseReportBody}>
        <h3>Case Summary</h3>
        <p className={styles.caseSummary}>{data[caseId].summary}</p>
        <button className={styles.reportButton} onClick={handleReport}>Report PDF</button>
        {/* <DownloadReport /> */}

        <CaseQuery caseId={caseId}/>

        <h3>Further Information</h3>
        <AudioDownloadButton audio={data[caseId].audio} />
        <TranscriptDownloadButton transcript ={data[caseId].transcript} />
      </div>
      <div className={styles.product}>
        <h3>Serial No. {data[caseId].serial_number}</h3>
        <button className={styles.closeButton} onClick={handleReturn}>Close</button>
        <Image src="/RandomSEWGearMotor.png" alt="Random Motor" width={500} height={500} layout="responsive"></Image>
      </div>
      </div>
      
    </div>
  );
};

export default CaseReport;