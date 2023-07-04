import React, { useEffect, useRef, useState } from 'react';
import styles from './DriveAuto.module.css';
import searchBarStyles from '../ProductSection/Searchbar.module.css';

function DriveAuto() {
  const [checked, setChecked] = useState(false);

  const [heardFaultCode, setHeardFaultCode] = useState('');
  const [possibleReasons, setPossibleReasons] = useState(''); // Updated variable name
  const [activities, setActivities] = useState(''); // Updated variable name

  const [liveSummary, setLiveSummary] = useState('');

  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [showRecordingText, setShowRecordingText] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [caseNumber, setCaseNumber] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [custName, setCustName] = useState("");
  const [techName, setTechName] = useState("");

  const [caseStatus, setCaseStatus] = useState("Click 'Begin Assistance' to start recording");

  const handleClick = async () => {
    if (!isCallInProgress) {
      try {
        setCaseStatus("Call in progress...")
        setIsCallInProgress(true);
        console.log('handle click called: callInProgress: True')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.start(1000);

        fetch('http://localhost:5000/api/begin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: true }),
        })
        .then(response => response.json())
        .then(data => {
          console.log("Begin route returned isClicked as: ", data);
        })
        .catch(error => console.error('Error in begin route:', error));

      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      console.log('handle click called: callInProgress: False')
      setCaseStatus("Call Ended. Please Submit the Call Recording")
      setIsCallInProgress(false);
      setShowSaveButton(true);
      mediaRecorderRef.current.stop();
    }
  };

  const handleDataAvailable = (event) => {
    console.log('handleDataAvailable function called')
    chunksRef.current.push(event.data);
  };

  const handleSaveClick = async () => {
    setShowSaveButton(false);
    setCaseStatus("Case Submitted. Generating Case Report... <strong>This may take a moment.</strong>")
    if (chunksRef.current.length === 0) {
      console.warn('No recorded data available.');
      return;
    }

    const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });

    console.log('Blob created')
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    formData.append('custName', custName); // Add customer name input
    formData.append('techName', techName); // Add tech name input

    try {
      console.log('Sending audio audio file to server')
      const response = await fetch('http://localhost:5000/post-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // File uploaded successfully
        const responseData = await response.text(); // Extract the response data as JSON
        setCaseStatus("Case Report Generated.")
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

  const getLiveSummary = async () => {
    console.log('Fetching live summary...');
    // get live summary from server
    fetch('http://localhost:5000/api/live-summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log("Live summary returned as: ", data);
      setLiveSummary(data)
      })
      .catch(error => console.error('Error fetching live summary:', error));
  }

  const getFaultCodeData = async () => {
    console.log('Fetching fault code data...');
    // get fault code data from server
    fetch('http://localhost:5000/api/heard-fault-code', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log("Fault Code Data returned as: ", data);
      const faultCode = data.faultCode;
      const possibleReasons = data.possibleReasons;
      const activities = data.activities;
      setHeardFaultCode(faultCode);
      setPossibleReasons(possibleReasons);
      setActivities(activities);
      })
      .catch(error => console.error('Error fetching fault code data:', error));
  }

  const faultCodeFallback = (event) => {
    console.log('Fallback for fault code triggered...');
    setHeardFaultCode(event.target.value);
    console.log('Fault code set to: ', event.target.value);
    if(event.target.value.length === 3){
      fetch('http://localhost:5000/api/fault-code-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: event.target.value }),
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        const faultCode = data.faultCode;
        const possibleReasons = data.possibleReasons;
        const activities = data.activities;
        setHeardFaultCode(faultCode);
        setPossibleReasons(possibleReasons);
        setActivities(activities);
      })
      .catch(error => console.error('Error fetching fault code data:', error));
    }
  }

  useEffect(() => {
    let interval
    let interval2
    if (isCallInProgress) {
      interval = setInterval(() => {
      getLiveSummary();
    }, 20000); // time in milliseconds 1000 = 1 second
  } else {

  }
    if (isCallInProgress) {
      interval = setInterval(() => {
      getFaultCodeData();
    }, 10000); // time in milliseconds 1000 = 1 second
  } else {

  }
    return () => {
      clearInterval(interval);
      clearInterval(interval2);
    };
  }, [isCallInProgress]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     getLiveSummary();
  //     getFaultCodeData();
  //   }, 20000); // time in milliseconds 1000 = 1 second

  //   return () => {
  //     // clearInterval(interval);
  //     clearInterval(intervalId);
  //   };
  // }, []);

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

  return (
    <div className={styles.driveAuto}>
      {/* <p>Live Assistance listens to the conversation and provides useful prompts.</p> */}

      <div>
        <p>
          <strong>{caseStatus ? 'System Status: ' : ''}</strong>
          {caseStatus ? (
            <span dangerouslySetInnerHTML={{ __html: caseStatus }}></span>
          ) : (
            <strong>No status available</strong>
          )}
        </p>
        <p>
          {caseNumber ? (
            <span>
              <br />
              <strong>Your Case Number is: </strong>
              {caseNumber}
              <br /><br />
              This case report can be found in the Automatic Documentation Tab. Thanks for using DriveAuto!
            </span>
          ) : (
            ''
          )}
        </p>
        </div>

      <div className={styles.buttonsContainer}>
        <div className={styles.openButton} onClick={handleClick}>
          {isCallInProgress ? 'End Live Assistance' : 'Begin Live Assistance'}
        </div>
        <div>
          {showRecordingText && <p className={styles.recording}>Recording...</p>}
        </div>
      </div>

      <div>
        {showSaveButton && chunksRef.current.length > 0 && (
          <div className={styles.openButton} onClick={handleSaveClick}>
            <p>Submit Recording</p>
          </div>
        )}
      </div>

      <div>
        
      </div>

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
        <p>
        {custName && techName ? (
          <span>
            <strong>Names Submitted:<br /><br /> Technician: </strong>{techName}<br /> <strong>Customer: </strong>{custName}
          </span>
        ) : (
          <strong>Please submit names before submitting the recording!</strong>
        )}
        </p>
      </div>

        <div className={styles.heardSomething}>
          <div className={styles.heardFault}>
            <div className={styles.heardFaultHeader}>
              <h4><b>Live Fault Code Detection</b></h4>
              <div className={styles.faultBox}>
                <input type="text" id="faultBox" onChange={faultCodeFallback}/>
              </div>
            </div>
            {heardFaultCode.length === 0 && (<p>Listening for a fault code...</p>)}
            {heardFaultCode.length > 0 && (<div className={styles.heardFaultBody}>
              <p>Heard Fault Code: <strong>{heardFaultCode}</strong></p>
              <p><u>Possible Reasons:</u> <br/> {possibleReasons}</p>
              <p><u>Recommended Actions:</u> <br/> {activities}</p>
          </div>
          )}
        </div>
        <div className={styles.liveSummary}>
          <div className={styles.liveSummaryHeader}>
            <h4><b>Live Summary</b></h4>
          </div>
          {liveSummary.length === 0 && (<p>Listening for significant information...</p>)}
          <p>{liveSummary}</p>
        </div>
      </div>
    </div>
  );
};

export default DriveAuto;
