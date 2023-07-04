import React from 'react';
import styles from './ActiveActionPanel.module.css'

import RemoteService from './RemoteService/RemoteService';
import CaseHistoryPanel from './CaseHistory/CaseHistoryPanel';
import DriveAuto from './DriveAuto/DriveAuto';
import InfoPool from './InfoPoolPanel/InfoPool';
import AudioFileUpload from './NewCase/AudioFileUpload';

function ActiveActionPanel({ actionName, onClose }) {
	return (
	  <div className={styles.activeActionPanel}>
      <div className={styles.activeActionPanelHeader}>
        <h2>{actionName}</h2>
        <button className={styles.closeBtn} onClick={onClose}> X </button>
      </div>
      <div className={styles.content}>
        {actionName === 'Live Assistance' && <DriveAuto />}
        {actionName === 'Video Call Invitation' && <RemoteService />}
        {actionName === 'Knowledge Base' && <InfoPool />}
        {actionName === 'Automated Documentation'  && <CaseHistoryPanel />}
        {actionName === 'New Case' && <AudioFileUpload />}  
      </div>
	  </div>
	);
}

export default ActiveActionPanel;