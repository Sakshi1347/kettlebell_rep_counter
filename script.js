// State management
let currentScreen = 'homepage';
let timerInterval = null;
let startTime = null;
let elapsedTime = 0; // Single source of truth for elapsed time
let timeLimit = 0; // Total time limit in milliseconds
let isTimerRunning = false;
let isTimerPaused = false;
let timerStoppedAtLimit = false; // Track if timer was stopped due to limit
let repCount = 0;
let noCounts = 0;
let repCountingEnabled = false; // Rep counting only enabled after timer starts
let athleteData = {};
let selectedCategory = '';
let selectedWeight = '';
let cooldownInterval = null;
let cooldownRemainingMs = 5 * 60 * 1000;
let cooldownRunning = false;

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
const noCountsBox = document.getElementById('noCountsBox');
const noCountsMinusBtn = document.getElementById('noCountsMinusBtn');
const finishBtn = document.getElementById('finishBtn');
const homeBtn = document.getElementById('homeBtn');
const timerDisplay = document.getElementById('timerDisplay');
const repDisplay = document.getElementById('repDisplay');
const noCountsDisplay = document.getElementById('noCountsDisplay');
const cooldownDisplay = document.getElementById('cooldownDisplay');
const cooldownDisplayGlobal = document.getElementById('cooldownDisplayGlobal');

// Display elements
const displayName = document.getElementById('displayName');
const displayState = document.getElementById('displayState');
const displayBodyweight = document.getElementById('displayBodyweight');
const displayKettlebellWeight = document.getElementById('displayKettlebellWeight');
const displayEvent = document.getElementById('displayEvent');
const displayPlatform = document.getElementById('displayPlatform');

// Results screen elements
const resultsName = document.getElementById('resultsName');
const resultsState = document.getElementById('resultsState');
const resultsBodyweight = document.getElementById('resultsBodyweight');
const resultsKettlebellWeight = document.getElementById('resultsKettlebellWeight');
const resultsEvent = document.getElementById('resultsEvent');
const resultsPlatform = document.getElementById('resultsPlatform');
const resultsReps = document.getElementById('resultsReps');
const resultsNoCounts = document.getElementById('resultsNoCounts');
const resultsTime = document.getElementById('resultsTime');

// Body weight category element
const bodyweightSelect = document.getElementById('bodyweight');

// Timer control buttons
const startTimerBtn = document.getElementById('startTimerBtn');
const pauseTimerBtn = document.getElementById('pauseTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');

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
    
    // Prevent double intervals
    if (timerInterval) {
        console.warn('Timer already running, ignoring start request');
        return;
    }

    if (cooldownRunning) {
        stopCooldownTimer(true);
    }
    
    // Don't start if timer was stopped at limit
    if (timerStoppedAtLimit) {
        console.log('Timer reached limit, cannot restart');
        return;
    }
    
    if (isTimerPaused) {
        // Resume from paused state - calculate new start time based on current elapsed time
        startTime = Date.now() - elapsedTime;
        isTimerPaused = false;
    } else {
        // Start fresh
        startTime = Date.now();
        elapsedTime = 0;
    }
    
    isTimerRunning = true;
    repCountingEnabled = true; // Enable rep counting when timer starts
    updateRepCounterState();
    
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        updateTimerDisplay();
        
        // Check if timer has reached the limit
        if (elapsedTime >= timeLimit && timeLimit > 0) {
            console.log('Timer limit reached');
            stopTimer();
            timerStoppedAtLimit = true;
            // Rep counter remains enabled and visible after auto-stop
            // Final time remains displayed
            // Do NOT automatically transition to results screen
            
            // Update button visibility - hide pause, show start (but disabled state)
            startTimerBtn.style.display = 'none';
            pauseTimerBtn.style.display = 'none';
        }
    }, 100); // Update every 100ms for smooth display
    
    // Update button visibility
    startTimerBtn.style.display = 'none';
    pauseTimerBtn.style.display = 'block';
}

function pauseTimer() {
    console.log('Pausing timer');
    
    if (!timerInterval) {
        console.warn('Timer not running, cannot pause');
        return;
    }
    
    // Update elapsed time before clearing interval to ensure accuracy
    elapsedTime = Date.now() - startTime;
    
    clearInterval(timerInterval);
    timerInterval = null;
    
    isTimerRunning = false;
    isTimerPaused = true;
    // Rep counting remains enabled when paused (per requirements)
    
    // Update button visibility
    startTimerBtn.style.display = 'block';
    pauseTimerBtn.style.display = 'none';
}

function stopTimer() {
    console.log('Stopping timer');
    if (timerInterval) {
        // Update elapsed time before clearing interval to ensure accuracy
        elapsedTime = Date.now() - startTime;
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isTimerRunning = false;
    isTimerPaused = false;
}

function resetTimer() {
    console.log('Resetting timer');
    stopTimer();
    elapsedTime = 0;
    startTime = null;
    isTimerPaused = false;
    timerStoppedAtLimit = false;
    repCountingEnabled = false; // Disable rep counting when timer is reset
    updateTimerDisplay();
    updateRepCounterState();
    
    // Reset button visibility
    startTimerBtn.style.display = 'block';
    pauseTimerBtn.style.display = 'none';
}

function updateTimerDisplay() {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Display only Time Used in MM:SS format
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    timerDisplay.textContent = `${minutesStr}:${secondsStr}`;
    console.log(`Time Used: ${minutesStr}:${secondsStr}`);
}

function formatTimeForDisplay(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    return `${minutesStr}:${secondsStr}`;
}

function formatCooldownDisplay(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
}

function updateCooldownDisplay() {
    if (cooldownDisplay) {
        cooldownDisplay.textContent = formatCooldownDisplay(cooldownRemainingMs);
    }
    if (cooldownDisplayGlobal) {
        cooldownDisplayGlobal.textContent = formatCooldownDisplay(cooldownRemainingMs);
    }
}

function stopCooldownTimer(resetDisplay = false) {
    if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
    }
    cooldownRunning = false;
    if (resetDisplay) {
        cooldownRemainingMs = 5 * 60 * 1000;
        updateCooldownDisplay();
    }
}

function startCooldownTimer() {
    if (cooldownRunning) {
        return;
    }
    cooldownRemainingMs = 5 * 60 * 1000;
    updateCooldownDisplay();
    cooldownRunning = true;

    cooldownInterval = setInterval(() => {
        cooldownRemainingMs -= 1000;
        if (cooldownRemainingMs <= 0) {
            cooldownRemainingMs = 0;
            updateCooldownDisplay();
            stopCooldownTimer();
            return;
        }
        updateCooldownDisplay();
    }, 1000);
}

function formatBodyweightDisplay(category, weight) {
    if (!category || !weight) {
        return 'N/A';
    }
    return `${category} - ${weight} kg`;
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

// No Counts functions
function increaseNoCount() {
    noCounts++;
    updateNoCountsDisplay();
    console.log(`No Counts increased to: ${noCounts}`);
}

function decreaseNoCount() {
    if (noCounts > 0) {
        noCounts--;
        updateNoCountsDisplay();
        console.log(`No Counts decreased to: ${noCounts}`);
    }
}

function resetNoCounts() {
    noCounts = 0;
    updateNoCountsDisplay();
    console.log('No Counts reset');
}

function updateNoCountsDisplay() {
    noCountsDisplay.textContent = noCounts;
}

function updateRepDisplay() {
    repDisplay.textContent = repCount;
}

function updateRepCounterState() {
    // Disable/enable rep counter based on timer state
    if (repCountingEnabled) {
        repCounterBox.style.opacity = '1';
        repCounterBox.style.pointerEvents = 'auto';
        repCounterBox.style.cursor = 'pointer';
    } else {
        repCounterBox.style.opacity = '0.5';
        repCounterBox.style.pointerEvents = 'none';
        repCounterBox.style.cursor = 'not-allowed';
    }
}

function finishSession() {
    console.log('Finishing session');
    
    // Stop timer
    stopTimer();
    startCooldownTimer();
    
    // Format and display results
    const finalTime = formatTimeForDisplay(elapsedTime);
    console.log('Final time:', finalTime);
    console.log('Final reps:', repCount);
    console.log('Athlete data:', athleteData);
    
    // Populate results screen
    resultsName.textContent = athleteData.name || 'N/A';
    resultsState.textContent = athleteData.state || 'N/A';
    resultsBodyweight.textContent = formatBodyweightDisplay(
        athleteData.bodyweightCategory,
        athleteData.bodyweightValue
    );
    resultsKettlebellWeight.textContent = athleteData.kettlebellWeight ? `${athleteData.kettlebellWeight} kg` : 'N/A';
    resultsEvent.textContent = athleteData.event || 'N/A';
    resultsPlatform.textContent = athleteData.platformNumber || 'N/A';
    resultsReps.textContent = repCount;
    resultsNoCounts.textContent = noCounts;
    resultsTime.textContent = finalTime;
    
    // Show results screen
    showScreen('results');
}

// Event Listeners
bodyweightSelect.addEventListener('change', () => {
    const bodyweightSelection = bodyweightSelect.value;
    const [category, weight] = bodyweightSelection
        ? bodyweightSelection.split('|')
        : ['', ''];
    selectedCategory = category;
    selectedWeight = weight;
});

updateCooldownDisplay();

startBtn.addEventListener('click', () => {
    console.log('Start button clicked');
    showScreen('athleteDetails');
});

athleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Athlete form submitted');
    
    // Get timer duration from dropdown
    const timerDurationMinutes = parseInt(document.getElementById('timerDuration').value);
    
    // Validate timer duration is selected
    if (!timerDurationMinutes || timerDurationMinutes <= 0) {
        alert('Please select a timer duration');
        return;
    }
    
    // Calculate time limit in milliseconds
    timeLimit = timerDurationMinutes * 60 * 1000;
    
    // Get form data
    const bodyweightSelection = bodyweightSelect.value;
    const [category, weight] = bodyweightSelection
        ? bodyweightSelection.split('|')
        : ['', ''];
    selectedCategory = category;
    selectedWeight = weight;

    athleteData = {
        name: document.getElementById('athleteName').value,
        state: document.getElementById('state').value,
        bodyweightCategory: selectedCategory,
        bodyweightValue: selectedWeight,
        kettlebellWeight: document.getElementById('kettlebellWeight').value,
        event: document.getElementById('event').value,
        platformNumber: document.getElementById('platformNumber').value
    };
    
    console.log('Athlete data:', athleteData);
    console.log('Time limit:', timeLimit, 'ms');
    
    // Display athlete info
    displayName.textContent = athleteData.name;
    displayState.textContent = athleteData.state;
    displayBodyweight.textContent = formatBodyweightDisplay(
        athleteData.bodyweightCategory,
        athleteData.bodyweightValue
    );
    displayKettlebellWeight.textContent = `${athleteData.kettlebellWeight} kg`;
    displayEvent.textContent = athleteData.event;
    displayPlatform.textContent = athleteData.platformNumber;
    
    // Reset timer, rep counter, and no counts
    resetTimer();
    resetRepCounter();
    resetNoCounts();
    
    // Show championship screen
    showScreen('championship');
    
    // Timer remains at 00:00 - user must click Start Timer button
    // Timer will never start automatically
});

// Timer control button event listeners
startTimerBtn.addEventListener('click', () => {
    console.log('Start Timer button clicked');
    startTimer();
});

pauseTimerBtn.addEventListener('click', () => {
    console.log('Pause Timer button clicked');
    pauseTimer();
});

resetTimerBtn.addEventListener('click', () => {
    console.log('Reset Timer button clicked');
    resetTimer();
    // Note: Reps are NOT reset on timer reset (per requirements)
});

repCounterBox.addEventListener('click', (e) => {
    // Don't increase if rep counting is disabled
    if (!repCountingEnabled) {
        return;
    }
    
    // Don't increase if clicking the minus button
    if (e.target === minusBtn || e.target.closest('.minus-button')) {
        return;
    }
    
    console.log('Rep counter box clicked');
    increaseRep();
});

minusBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the rep counter box click
    
    // Don't decrease if rep counting is disabled
    if (!repCountingEnabled) {
        return;
    }
    
    console.log('Minus button clicked');
    decreaseRep();
});

// No Counts event listeners
noCountsBox.addEventListener('click', (e) => {
    // Don't increase if clicking the minus button
    if (e.target === noCountsMinusBtn || e.target.closest('.minus-button')) {
        return;
    }
    
    console.log('No Counts box clicked');
    increaseNoCount();
});

noCountsMinusBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the no counts box click
    
    console.log('No Counts minus button clicked');
    decreaseNoCount();
});

finishBtn.addEventListener('click', () => {
    console.log('Finish button clicked');
    finishSession();
});

homeBtn.addEventListener('click', () => {
    console.log('Home button clicked');
    
    // Stop timer
    stopTimer();
    
    // Reset everything
    resetTimer();
    resetRepCounter();
    resetNoCounts();
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
updateNoCountsDisplay();
updateRepCounterState(); // Initialize rep counter state (disabled initially)

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

