import React, { useState, useRef, useEffect } from 'react';
import styles from './BeginCallButton.module.css'
import searchBarStyles from '../ProductSection/Searchbar.module.css';
import buttonStyles from '../InfoPoolPanel/InfoPool.module.css';

const BeginCallButton = () => {
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [showRecordingText, setShowRecordingText] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(true);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [caseNumber, setCaseNumber] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [custName, setCustName] = useState("");
  const [techName, setTechName] = useState("");

  useEffect(() => {
    let interval;

    if (isCallInProgress) {
      interval = setInterval(() => {
        setShowRecordingText((prevValue) => !prevValue);
      }, 500);
    } else {
      setShowRecordingText(false);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isCallInProgress]);

  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();


  // }

  const handleClick = async () => {
    if (!isCallInProgress) {
      try {
        console.log('handle click called: callInProgress: True')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.start();
        setIsCallInProgress(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      console.log('handle click called: callInProgress: False')
      mediaRecorderRef.current.stop();
      setIsCallInProgress(false);
    }
  };

  const handleDataAvailable = (event) => {
    console.log('handleDataAvailable function called')
    chunksRef.current.push(event.data);
  };

  const handleSaveClick = async () => {
    if (chunksRef.current.length === 0) {
      console.warn('No recorded data available.');
      return;
    }

    const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
    console.log('Blob created')
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');
    formData.append('custName', custName); // Add customer name input
    formData.append('techName', techName); // Add tech name input

    try {
      const response = await fetch('http://localhost:5000/post-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowSaveButton(false);
        // File uploaded successfully
        const responseData = await response.text(); // Extract the response data as JSON
        setCaseNumber(responseData);
        console.log('File uploaded successfully');
        console.log('Recording saved successfully!');
      } else {
        console.error('Failed to save recording:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving recording:', error);
    }

    // Reset recording state and chunks
    setIsCallInProgress(false);
    chunksRef.current = [];
    // Reset the selected file state
    setSelectedFile(null);
  };

  return (
    <div className={styles.buttonsContainer}>
      <div className={styles.openButton} onClick={handleClick}>
        {isCallInProgress ? 'End Live Assistance' : 'Begin Live Assistance'}
      </div>
      <div>
        {showRecordingText && <p className={styles.recording}>Recording...</p>}
      </div>
      {showSaveButton && chunksRef.current.length > 0 && (
        <button onClick={handleSaveClick} disabled={isCallInProgress}>
          Submit Recording
        </button>
      )}
      <p>{caseNumber ? `New case created. Case Number: ${caseNumber}` : ''}</p>
    </div>
  );
};

export default BeginCallButton;