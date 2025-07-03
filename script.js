function saveSession(resultData) {
  // Create a session object with answers, results, and a timestamp.
  const session = {
    answers: { ...answers },
    resultData: resultData,
    timestamp: new Date().toISOString()
  };

  // Retrieve existing session history from localStorage.
  const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory')) || [];
  sessionHistory.push(session);
  localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory));
}
