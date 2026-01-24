// State management
let currentScreen = 'homepage';
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let repCount = 0;
let athleteData = {};

// DOM Elements
const screens = {
    homepage: document.getElementById('homepage'),
    athleteDetails: document.getElementById('athleteDetails'),
    championship: document.getElementById('championship'),
    results: document.getElementById('results')
};

const startBtn = document.getElementById('startBtn');
const athleteForm = document.getElementById('athleteForm');
const repCounterBox = document.getElementById('repCounterBox');
const minusBtn = document.getElementById('minusBtn');
const finishBtn = document.getElementById('finishBtn');
const homeBtn = document.getElementById('homeBtn');
const timerDisplay = document.getElementById('timerDisplay');
const repDisplay = document.getElementById('repDisplay');

// Display elements
const displayName = document.getElementById('displayName');
const displayState = document.getElementById('displayState');
const displayBodyweight = document.getElementById('displayBodyweight');
const displayKettlebellWeight = document.getElementById('displayKettlebellWeight');

// Results screen elements
const resultsName = document.getElementById('resultsName');
const resultsState = document.getElementById('resultsState');
const resultsBodyweight = document.getElementById('resultsBodyweight');
const resultsKettlebellWeight = document.getElementById('resultsKettlebellWeight');
const resultsReps = document.getElementById('resultsReps');
const resultsTime = document.getElementById('resultsTime');

// Screen navigation
function showScreen(screenName) {
    console.log(`Switching to screen: ${screenName}`);
    
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        currentScreen = screenName;
    } else {
        console.error(`Screen ${screenName} not found`);
    }
}

// Timer functions
function startTimer() {
    console.log('Starting timer');
    startTime = Date.now() - elapsedTime;
    
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        updateTimerDisplay();
    }, 100); // Update every 100ms for smooth display
}

function stopTimer() {
    console.log('Stopping timer');
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    console.log('Resetting timer');
    stopTimer();
    elapsedTime = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    timerDisplay.textContent = `${minutesStr}:${secondsStr}`;
    console.log(`Timer: ${minutesStr}:${secondsStr}`);
}

function formatTimeForDisplay(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    return `${minutesStr}:${secondsStr}`;
}

// Rep counter functions
function increaseRep() {
    repCount++;
    updateRepDisplay();
    console.log(`Rep count increased to: ${repCount}`);
}

function decreaseRep() {
    if (repCount > 0) {
        repCount--;
        updateRepDisplay();
        console.log(`Rep count decreased to: ${repCount}`);
    }
}

function resetRepCounter() {
    repCount = 0;
    updateRepDisplay();
    console.log('Rep counter reset');
}

function updateRepDisplay() {
    repDisplay.textContent = repCount;
}

// Event Listeners
startBtn.addEventListener('click', () => {
    console.log('Start button clicked');
    showScreen('athleteDetails');
});

athleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Athlete form submitted');
    
    // Get form data
    athleteData = {
        name: document.getElementById('athleteName').value,
        state: document.getElementById('state').value,
        bodyweight: document.getElementById('bodyweight').value,
        kettlebellWeight: document.getElementById('kettlebellWeight').value
    };
    
    console.log('Athlete data:', athleteData);
    
    // Display athlete info
    displayName.textContent = athleteData.name;
    displayState.textContent = athleteData.state;
    displayBodyweight.textContent = `${athleteData.bodyweight} kg`;
    displayKettlebellWeight.textContent = `${athleteData.kettlebellWeight} kg`;
    
    // Reset timer and rep counter
    resetTimer();
    resetRepCounter();
    
    // Show championship screen
    showScreen('championship');
    
    // Start timer
    startTimer();
});

repCounterBox.addEventListener('click', (e) => {
    // Don't increase if clicking the minus button
    if (e.target === minusBtn || e.target.closest('.minus-button')) {
        return;
    }
    
    console.log('Rep counter box clicked');
    increaseRep();
});

minusBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the rep counter box click
    console.log('Minus button clicked');
    decreaseRep();
});

finishBtn.addEventListener('click', () => {
    console.log('Finish button clicked');
    
    // Stop timer
    stopTimer();
    
    // Format and display results
    const finalTime = formatTimeForDisplay(elapsedTime);
    console.log('Final time:', finalTime);
    console.log('Final reps:', repCount);
    console.log('Athlete data:', athleteData);
    
    // Populate results screen
    resultsName.textContent = athleteData.name || 'N/A';
    resultsState.textContent = athleteData.state || 'N/A';
    resultsBodyweight.textContent = athleteData.bodyweight ? `${athleteData.bodyweight} kg` : 'N/A';
    resultsKettlebellWeight.textContent = athleteData.kettlebellWeight ? `${athleteData.kettlebellWeight} kg` : 'N/A';
    resultsReps.textContent = repCount;
    resultsTime.textContent = finalTime;
    
    // Show results screen
    showScreen('results');
});

homeBtn.addEventListener('click', () => {
    console.log('Home button clicked');
    
    // Stop timer
    stopTimer();
    
    // Reset everything
    resetTimer();
    resetRepCounter();
    athleteData = {};
    
    // Reset form
    athleteForm.reset();
    
    // Show homepage
    showScreen('homepage');
});

// Initialize
console.log('Kettlebell Rep Counter initialized');
updateTimerDisplay();
updateRepDisplay();

