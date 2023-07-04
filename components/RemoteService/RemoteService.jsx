import React, { useEffect, useState } from 'react';
import styles from './RemoteService.module.css';

const RemoteService = () => {
  const [guestEmail, setGuestEmail] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [call_id, setCallId] = useState('');
  const [callCreated, setCallCreated] = useState(false);

  const handleGuestEmailChange = (event) => {
    setGuestEmail(event.target.value);
    console.log('Guest email:', event.target.value);
  };

  const handleSubmit = () => {
    const payload = {
      guest_email: guestEmail,
      call_duration_hrs: 1,
      sew_technician_email: 'lasse.nehrdich.e@sew-eurodrive.de'
    };

    fetch('http://localhost:5000/api/invite-to-remote-service', {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
      })
    .then(data => {
      // Process the search results data
      console.log('Payload received from backend: ', data);

      console.log('Call ID: ', data.call_id);
      setCallId(data.call_id)

      console.log('Invitation Link: ', data.invitationLink);
      setInvitationLink(data.invitationLink);

      setCallCreated(true);
    })
    .catch(error => {console.error('Error executing backend function:', error);});
  };

  useEffect(() => {
  }, []);

  return (
    <div className={styles.remoteService}>
        <p>Invite others to a remote service call via the share platform.</p>
        <input type="text" placeholder="Enter an email to invite to a remote service call" value={guestEmail} onChange={handleGuestEmailChange}/>
        <div className={styles.openButton} onClick={handleSubmit}>Invite to Remote Service Call</div>
        {callCreated && (
          <div className={styles.link} >
            <a href={invitationLink}>Click here to join the call</a>
          </div>
        )}
    </div>
  );
};

export default RemoteService;