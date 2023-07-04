import React, { useState } from 'react';
import styles from './CaseReport.module.css';

const AudioDownloadButton = ({ audio }) => {
  const handleDownload = () => {
    const audioFilePath = audio;
    // Make an API request to fetch the audio file URL from the backend
    // Replace 'YOUR_BACKEND_API_ENDPOINT' with your actual backend API endpoint
    fetch('http://localhost:5000/audio_download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioFilePath }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'audioFile.mp3');
        link.click();
      })
      .catch((error) => {
        console.error('Error downloading audio file', error);
      });
  };

    return (
      <button className={styles.actionButton} onClick={handleDownload}>Download Case Audio</button>
    );
  };
  

export default AudioDownloadButton;