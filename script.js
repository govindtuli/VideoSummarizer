const backendURL = 'http://127.0.0.1:5000'; // Replace 'backend-server-url' with the actual URL of your Flask backend server

function sendURL() {
  const url = document.getElementById('urlInput').value; // Assuming you have an input field with id "urlInput" to enter the URL
  const data = { video_url: url };

  fetch(`${backendURL}/api`, { // Use the full backend URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error: ' + response.status);
      }
      return response.json();
    })
    .then(responseData => {
      console.log(responseData);
      checkStatus();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function checkStatus() {
  fetch(`${backendURL}/api/status`, { // Use the full backend URL
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error: ' + response.status);
      }
      return response.json();
    })
    .then(statusData => {
      console.log(statusData);
      if (statusData.status === 'The Video has been Summarized') {
        // The video summarization is complete, you can access the summary message using statusData.message
      } else {
        // The video summarization is still in progress, you can check the status again after a delay
        setTimeout(checkStatus, 100000); // Check status after 2 seconds (adjust the delay as needed)
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


const submitButton = document.getElementById('btn1');
submitButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission or button click behavior
    sendURL();
  });
