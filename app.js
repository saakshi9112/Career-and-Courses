const questions = [
  "1. Which standard are you currently studying?",
  "2. What are your hobbies?",
  "3. What is your current interest?",
  "4. Which subjects do you excel in?",
  "5. What career paths have you considered so far?",
  "6. What are your long-term goals?",
  "7. What extracurricular activities do you participate in?",
  "8. How do you prefer to learn? (Visual, Auditory, Kinesthetic)",
  "9. What type of work environment do you prefer?",
  "10. Any additional information you'd like to share about your aspirations?"
];

let currentQuestionIndex = 0;
const answers = {};
const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const restartBtn = document.getElementById('restart-btn');
const previewContainer = document.getElementById('preview-container');
const previewContent = document.getElementById('preview-content');
const finalSubmitBtn = document.getElementById('final-submit-btn');
const editResponsesBtn = document.getElementById('edit-responses-btn');

function appendMessage(message, sender = 'bot') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.innerText = message;
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function updateProgress() {
  const progressIndicator = document.getElementById('progress-indicator');
  const progressText = document.getElementById('progress-text');
  const percent = ((currentQuestionIndex / questions.length) * 100).toFixed(0);
  progressIndicator.style.width = percent + '%';
  if (currentQuestionIndex < questions.length) {
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  } else {
    progressText.textContent = `Completed`;
  }
}

function askNextQuestion() {
  updateProgress();
  if (currentQuestionIndex < questions.length) {
    appendMessage(questions[currentQuestionIndex], 'bot');
  } else {
    showPreview();
  }
}

sendBtn.addEventListener('click', () => {
  const answer = userInput.value.trim();
  if (!answer) return;
  appendMessage(answer, 'user');
  answers[`q${currentQuestionIndex + 1}`] = answer;
  userInput.value = '';
  currentQuestionIndex++;
  askNextQuestion();
});

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

// Restart Questionnaire functionality (resets entire chat)
function restartQuestionnaire() {
  chatLog.style.display = 'block';
  document.querySelector('.input-container').style.display = 'flex';
  document.querySelector('.restart-container').style.display = 'block';
  previewContainer.style.display = 'none';
  chatLog.innerHTML = "";
  currentQuestionIndex = 0;
  for (let key in answers) {
    if (answers.hasOwnProperty(key)) {
      delete answers[key];
    }
  }
  userInput.disabled = false;
  sendBtn.disabled = false;
  updateProgress();
  askNextQuestion();
}

restartBtn.addEventListener('click', restartQuestionnaire);

// Show preview of responses for final submission.
function showPreview() {
  // Hide chat interface elements.
  chatLog.style.display = 'none';
  document.querySelector('.input-container').style.display = 'none';
  document.querySelector('.restart-container').style.display = 'none';

  let previewHTML = '<ul>';
  questions.forEach((q, index) => {
    const answer = answers['q' + (index + 1)] || '';
    previewHTML += `<li>
                      <strong>${q}</strong><br/>
                      Answer: ${answer}
                    </li>`;
  });
  previewHTML += '</ul>';
  previewContent.innerHTML = previewHTML;
  
  document.getElementById('final-submit-btn').style.display = 'inline-block';
  document.getElementById('edit-responses-btn').style.display = 'inline-block';
  
  previewContainer.style.display = 'block';
}

function showEditablePreview() {
  document.getElementById('final-submit-btn').style.display = 'none';
  document.getElementById('edit-responses-btn').style.display = 'none';

  let editHTML = '<form id="edit-form"><ul>';
  questions.forEach((q, index) => {
    const answer = answers['q' + (index + 1)] || '';
    editHTML += `<li>
                   <strong>${q}</strong><br/>
                   <textarea class="edit-answer" data-index="${index+1}" rows="2" style="width: 100%;">${answer}</textarea>
                 </li>`;
  });
  editHTML += '</ul>';
  editHTML += '<button type="submit" id="save-edit-btn">Save Changes</button> ';
  editHTML += '<button type="button" id="cancel-edit-btn">Cancel</button>';
  editHTML += '</form>';
  
  previewContent.innerHTML = editHTML;

  const editForm = document.getElementById('edit-form');
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const editAnswers = document.querySelectorAll('.edit-answer');
    editAnswers.forEach((textarea, idx) => {
      answers['q' + (idx + 1)] = textarea.value.trim();
    });
    showPreview(); 
  });

  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => {
    showPreview(); 
  });
}

finalSubmitBtn.addEventListener('click', () => {
  finalSubmitBtn.disabled = true;
  finalSubmitBtn.textContent = "Submitting...";
  
  // Show the loader spinner.
  document.getElementById('loader').style.display = 'block';
  
  submitAnswers();
});

// "Edit Responses" button triggers the inline editing form.
editResponsesBtn.addEventListener('click', () => {
  showEditablePreview();
});

// Start the questionnaire.
askNextQuestion();

// Save session function: saves the current session (answers, result, timestamp) to localStorage.
function saveSession(resultData) {
  const session = {
    answers: { ...answers },
    resultData: resultData,
    timestamp: new Date().toISOString()
  };

  // Retrieve existing session history from localStorage, or start a new array.
  const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory')) || [];
  sessionHistory.push(session);
  localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory));
}

async function submitAnswers() {
  appendMessage("Submitting your answers...", "bot");

  const prompt = `Based on the following answers from a student, recommend the top 10 career paths and top 10 courses (with course links) suitable for their profile. Provide the response strictly in a JSON format with two keys:
1. "careers" – an array of career objects, each with "name" and "description".
2. "courses" – an array of course objects, each with "courseName", "link", and "description".
Here are the answers:
Standard: ${answers.q1}
Hobbies: ${answers.q2}
Current Interest: ${answers.q3}
Subjects excelled in: ${answers.q4}
Considered career paths: ${answers.q5}
Long-term goals: ${answers.q6}
Extracurricular activities: ${answers.q7}
Preferred learning style: ${answers.q8}
Preferred work environment: ${answers.q9}
Additional info: ${answers.q10}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const apiKey = 'AIzaSyB6pmSqyQxG2DtwwrqZuXj7WNQb-Z12foY'; // Replace with your actual API key.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();

    if (
      data.candidates &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0].text
    ) {
      let jsonString = data.candidates[0].content.parts[0].text;
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3);
      }
      if (jsonString.endsWith('```')) {
        jsonString = jsonString.slice(0, -3);
      }
      if (jsonString.trim().toLowerCase().startsWith('json')) {
        jsonString = jsonString.trim().substring(4).trim();
      }
      try {
        const resultData = JSON.parse(jsonString.trim());
        displayResult(resultData);
      } catch (jsonError) {
        console.error('JSON Parsing Error:', jsonError);
        appendMessage(`Error parsing JSON response: ${jsonError}`, "bot");
      }
    } else {
      appendMessage('Could not extract recommendations.', "bot");
      console.error('Unexpected API response:', data);
    }
  } catch (error) {
    console.error('Error:', error);
    appendMessage('Error fetching recommendation. Please try again later.', "bot");
  }
}

function displayResult(resultData) {
  // Save session before redirecting.
  saveSession(resultData);
  localStorage.setItem('resultData', JSON.stringify(resultData));
  window.location.href = 'results.html';
}
