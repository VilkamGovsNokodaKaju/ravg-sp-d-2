document.getElementById('voteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const code = document.getElementById('code').value;
    const selectedProject = document.querySelector('input[name="project"]:checked').value;

    fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, project: selectedProject })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you for voting!');
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

    if (validateCode(code)) {
        sendVote(code, selectedProject);
    } else {
        alert("Invalid or already used code.");
    }
});

function validateCode(code) {
    // Implement a request to check the code against the backend
    return true; // Placeholder
}

function sendVote(code, project) {
    // Implement sending data to Google Sheets via API
}
