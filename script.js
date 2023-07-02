// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get the necessary elements from the DOM
  const urlInput = document.getElementById('urlInput');
  const btn1 = document.getElementById('startButton');
  const progressBar = document.getElementById('progressBar');
  const stepHeading = document.getElementById('stepHeading');
  const videoSummary = document.getElementById("videoSummary");
  // Add event listener to the button click event
  btn1.addEventListener('click', () => {
    const videoUrl = urlInput.value;

    // Validate if the URL input is not empty
    if (videoUrl.trim() === '') {
      alert('Please enter a video URL');
      return;
    }

    // Disable the button to prevent multiple clicks
    btn1.disabled = true;

    // Start the video conversion process by making an AJAX request to the backend
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 202) {
          // Show the progress bar
          progressBar.style.width = '10%';
          progressBar.setAttribute('aria-valuenow', '10');

          // Update the step heading
          stepHeading.textContent = 'Converting Video to Mp3';

          // Poll the status endpoint to get the progress updates
          pollStatus();
        } else {
          alert('Failed to start the video conversion process');
          // Re-enable the button
          btn1.disabled = false;
        }
      }
    };
    xhr.open('POST', 'http://localhost:5000/api');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ video_url: videoUrl }));
  });

  // Function to poll the status endpoint and update the progress bar
  function pollStatus() {
    // Make a request to the status endpoint
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const { status, message } = JSON.parse(xhr.responseText);

          // Update the progress bar based on the status
          switch (status) {
            case 'Conversion Started':
              progressBar.style.width = '10%';
              progressBar.setAttribute('aria-valuenow', '10');
              break;
            case 'Audio has been Extracted from Video':
              progressBar.style.width = '30%';
              progressBar.setAttribute('aria-valuenow', '30');
              break;
            case 'The Audio has been Transcribed into Text using our Advanced AI':
              progressBar.style.width = '80%';
              progressBar.setAttribute('aria-valuenow', '80');
              break;
            case 'The Video has been Summarized':
              progressBar.style.width = '100%';
              progressBar.setAttribute('aria-valuenow', '100');
              break;
          }

          // Check if the process has completed
          if (status === 'The Video has been Summarized') {
            // Update the step heading and display the summary message
            stepHeading.textContent = 'Video Summarization Complete';
            alert(`Video Summarized: ${message}`);
            videoSummary.innerText=message;
            // Ask the user to refresh the page
            if (confirm('Video summarization is complete. Do you want to refresh the page?')) {
              location.reload();
            }
          } else {
            // Poll the status endpoint again after a short delay
            setTimeout(pollStatus, 1000);
          }
        } else {
          alert('An error occurred while checking the video conversion status');
          // Re-enable the button
          btn1.disabled = false;
        }
      }
    };
    xhr.open('GET', 'http://localhost:5000/api/status');
    xhr.send();
  }
});
