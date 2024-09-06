document.getElementById('voteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const code = document.getElementById('code').value;
    const selectedProject = document.querySelector('input[name="project"]:checked').value;

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
