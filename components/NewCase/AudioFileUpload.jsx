import { useEffect, useState } from 'react';
import styles from './AudioFileUpload.module.css';
import searchBarStyles from '../ProductSection/Searchbar.module.css';

function AudioFileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [caseNumber, setCaseNumber] = useState(null);
  const [custName, setCustName] = useState("");
  const [techName, setTechName] = useState("");

  useEffect(() => {

    });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append('audio', selectedFile, 'audio.webm');
    formData.append('custName', custName); // Add customer name input
    formData.append('techName', techName); // Add tech name input
  
    try {
      const response = await fetch('http://localhost:5000/post-audio', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        // File uploaded successfully
        const responseData = await response.text(); // Extract the response data as text
        setCaseNumber(responseData);
        console.log('File uploaded successfully');
      } else {
        // Error occurred while uploading file
        console.error('Error uploading file');
      }
    } catch (error) {
      console.error('Error occurred', error);
    }
  
    // Reset the selected file state
    setSelectedFile(null);
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   if (!selectedFile) return;

  //   const formData = new FormData();
  //   formData.append('audio', blob, 'recording.wav');

  //   try {
  //     const response = await fetch('http://localhost:5000/post-audio', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       // File uploaded successfully
  //       const responseData = await response.text(); // Extract the response data as JSON
  //       setCaseNumber(responseData);
  //       console.log('File uploaded successfully');
  //     } else {
  //       // Error occurred while uploading file
  //       console.error('Error uploading file');
  //     }
  //   } catch (error) {
  //     console.error('Error occurred', error);
  //   }

  //   // Reset the selected file state
  //   setSelectedFile(null);
  // };

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <form className={`${searchBarStyles.searchform} ${styles.searchContainer}`}>
          <input
            type="text"
            placeholder="Enter Technician Name..."
            value={techName}  
            onChange={(e) => setTechName(e.target.value)}
            className={searchBarStyles.input}
          />
          <input
            type="text"
            placeholder="Enter Customer Name..."
            value={custName} 
            onChange={(e) => setCustName(e.target.value)}
            className={searchBarStyles.input}
          />
        </form>
        <p>{custName && techName ? `Names submitted: Technician: ${techName}, Customer: ${custName}` : 'Please submit names'}</p>
      </div>
      <h3>Audio File Submission</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button type="submit" disabled={!selectedFile}>
          Submit
        </button>
      </form>
      <p>Case Status: {caseNumber ? `New case created. Case Number: ${caseNumber}` : 'Waiting for case number...'}</p>
    </div>
  );
}


export default AudioFileUpload;
