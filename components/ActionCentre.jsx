import React, {useState} from 'react';
import styles from './ActionCentre.module.css';
import Action from './Action';
import ActiveActionPanel from './ActiveActionPanel';

function ActionCentre () {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  function handleActionClick(actionName) {
    setSelectedAction(actionName);
    setShowPanel(true);
  };

  function handleClosePanel() {
    setShowPanel(false);
    
  setSelectedAction(''); // Add this line
  }

  return (
    <div className={styles.actionSection}>
      <h2>Action Centre</h2>
      <div className={styles.actionCentre}>
        <div className={styles.actionCol1}>
          <Action 
            actionName='Live Assistance' 
            src='svg/ai_doc.svg' 
            alt="drive auto icon" 
            onClick={() => handleActionClick('Live Assistance')} 
            isSelected={showPanel && selectedAction === 'Live Assistance'}
          />
          <Action 
            actionName='Video Call Invitation' 
            src='svg/customer-service.svg' 
            alt="remote icon" 
            onClick={() => handleActionClick('Video Call Invitation')} 
            isSelected={showPanel && selectedAction === 'Video Call Invitation' }
          />
          <Action 
            actionName='Knowledge Base' 
            src='svg/info (1).svg' 
            alt="info icon" 
            onClick={() => handleActionClick('Knowledge Base')} 
            isSelected={showPanel && selectedAction === 'Knowledge Base' }
          />
          <Action 
            actionName='Automated Documentation' 
            src='svg/data-analytics.svg' 
            alt="search icon" 
            onClick={() => handleActionClick('Automated Documentation')} 
            isSelected={showPanel && selectedAction === 'Automated Documentation'}
          />
          <Action 
            actionName='New Case' 
            src='svg/add-document (2).svg' 
            alt="search icon" 
            onClick={() => handleActionClick('New Case')} 
            isSelected={showPanel && selectedAction === 'New Case'}
          />
        </div>
        <div className={styles.actionCol2}>
          {showPanel && (<ActiveActionPanel actionName={selectedAction} onClose={handleClosePanel} />)}
        </div>
      </div>
    </div>
  );
};

export default ActionCentre;