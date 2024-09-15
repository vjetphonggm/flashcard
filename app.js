// Get references to DOM elements
const flashcard = document.getElementById('flashcard');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const reverseBtn = document.getElementById('reverse');
const cardCount = document.getElementById('card-count');
const addVocabBtn = document.getElementById('add-vocab');
const vocabInput = document.getElementById('vocab-input');
const cardList = document.getElementById('card-list');
const checkBtn = document.getElementById('check');
const answerOverlay = document.getElementById('answer-overlay');
const answerInput = document.getElementById('answer-input');
const resultDisplay = document.getElementById('result');

// Variables to track the state of the flashcards and interactions
let vocabCards = [];
let currentCardIndex = 0;
let isFlipped = false;
let isReversed = false;
let isShuffled = false;
let isCheckMode = false;
let isShowingResult = false;
let originalOrder = [];

// Function to update flashcard content based on the current index
function updateFlashcard() {
    if (vocabCards.length === 0) {
        // Display a message if no cards are available
        flashcard.textContent = 'No cards available';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        reverseBtn.disabled = true;
    } else {
        // Display either the word or the definition depending on the flipped and reversed states
        const card = vocabCards[currentCardIndex];
        flashcard.textContent = isFlipped
            ? (isReversed ? `${card.word}` : `${card.type ? card.type + ' ' : ''}${card.phonetic ? card.phonetic + ' ' : ''}${card.definition}${card.example ? ' ' + card.example : ''}`)
            : (isReversed ? `${card.type ? card.type + ' ' : ''}${card.phonetic ? card.phonetic + ' ' : ''}${card.definition}${card.example ? ' ' + card.example : ''}` : `${card.word}`);

        // Update card count (e.g., "1/10")
        cardCount.textContent = `${currentCardIndex + 1}/${vocabCards.length}`;

        // Disable the Previous button if it's the first card, disable Next if it's the last
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex === vocabCards.length - 1;
        reverseBtn.disabled = false;
    }
    updateProgressBar();  // Update the progress bar
    updateControls();  // Update button states
}

// Function to update the progress bar based on the current card index
function updateProgressBar() {
    if (vocabCards.length > 0) {
        const progressPercentage = ((currentCardIndex + 1) / vocabCards.length) * 100;
        document.getElementById('progress-bar').style.width = progressPercentage + '%';
    } else {
        document.getElementById('progress-bar').style.width = '0%';
    }
}

// Function to flip the card between front and back
function flipCard() {
    isFlipped = !isFlipped;
    updateFlashcard();
}

// Function to update button states (enable/disable based on current state)
function updateControls() {
    const hasCards = vocabCards.length > 0;
    checkBtn.disabled = !hasCards;
    shuffleBtn.disabled = !hasCards;
    reverseBtn.disabled = !hasCards;
}

// Event listeners for the flashcard and buttons
flashcard.addEventListener('click', flipCard);

// Go to the previous card when the Previous button is clicked
prevBtn.addEventListener('click', () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        isFlipped = false;
        updateFlashcard();
    }
});

// Go to the next card when the Next button is clicked
nextBtn.addEventListener('click', () => {
    if (currentCardIndex < vocabCards.length - 1) {
        currentCardIndex++;
        isFlipped = false;
        updateFlashcard();
    }
});

// Shuffle the cards when the Shuffle button is clicked
shuffleBtn.addEventListener('click', () => {
    if (!isShuffled) {
        originalOrder = [...vocabCards]; // Store original order
        vocabCards = vocabCards.sort(() => Math.random() - 0.5); // Shuffle
        shuffleBtn.style.backgroundColor = "#007bff"; // Set color to active state
    } else {
        vocabCards = originalOrder; // Restore original order
        shuffleBtn.style.backgroundColor = ""; // Reset to default color
    }
    isShuffled = !isShuffled; // Toggle shuffle state
    currentCardIndex = 0;
    isFlipped = false;
    updateFlashcard();
});

// Reverse the flashcard content (word/definition) when the Reverse button is clicked
reverseBtn.addEventListener('click', () => {
    isReversed = !isReversed;
    reverseBtn.style.backgroundColor = isReversed ? "#007bff" : ""; // Set color to active state
    currentCardIndex = 0;
    isFlipped = false;
    updateFlashcard();
});

// Add new vocabulary cards from the input field
addVocabBtn.addEventListener('click', () => {
    const vocabLines = vocabInput.value.trim().split('\n');
    vocabLines.forEach(line => {
        const parts = line.split('\t');
        let word, type, phonetic, definition, example;

        // Check if the input format is valid before adding
        if (parts.length >= 2) { // At least 2 parts are required (word and definition)
            word = parts[0].trim();
            definition = parts[1].trim();

            // Assign other optional fields
            if (parts.length >= 3) phonetic = parts[2].trim();
            if (parts.length >= 4) type = parts[3].trim();
            if (parts.length >= 5) example = parts[4].trim();

            // Add the new card to the vocabCards array if word and definition are not empty
            if (word && definition) {
                vocabCards.push({
                    word,
                    type: type || '',
                    phonetic: phonetic || '',
                    definition: definition || '',
                    example: example || ''
                });

                // Create a list item for the new card
                const cardItem = document.createElement('li');
                cardItem.textContent = `${word}`;
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'X';
                deleteBtn.addEventListener('click', () => {
                    const index = vocabCards.findIndex(card => card.word === word);
                    vocabCards.splice(index, 1); // Remove the card from the array
                    cardItem.remove(); // Remove the list item
                    currentCardIndex = 0;
                    updateFlashcard();
                });
                cardItem.appendChild(deleteBtn);
                cardList.appendChild(cardItem); // Add the card to the list
            }
        }
    });
    vocabInput.value = ''; // Clear the input field
    updateFlashcard(); // Update flashcard display

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// Show or hide the answer check overlay when the Check button is clicked
checkBtn.addEventListener('click', () => {
    if (!isCheckMode) {
        answerOverlay.style.display = 'flex'; // Show overlay
        checkBtn.style.backgroundColor = "#007bff"; // Set active button color
        isCheckMode = true;
        isShowingResult = false; // Reset result display state
        answerInput.focus();
    } else {
        answerOverlay.style.display = 'none'; // Hide overlay
        checkBtn.style.backgroundColor = ""; // Reset button color
        isCheckMode = false;
        isShowingResult = false; // Reset result display state
        resultDisplay.textContent = ''; // Clear result
        answerInput.value = ''; // Clear input field
    }
});

// Check the user's answer when Enter is pressed
answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (!isShowingResult) {
            const userAnswer = answerInput.value.trim().toLowerCase();
            const correctAnswer = vocabCards[currentCardIndex].word.toLowerCase(); // Get the correct word

            // Display result
            resultDisplay.innerHTML = '';
            if (userAnswer === correctAnswer) {
                resultDisplay.innerHTML = `<span class="correct">☑️</span> ${vocabCards[currentCardIndex].word}`;
            } else {
                resultDisplay.innerHTML = `<span class="wrong">❌</span> ${vocabCards[currentCardIndex].word}`;
            }
            isShowingResult = true; // Set result display state
        } else {
            answerOverlay.style.display = 'none'; // Hide overlay
            checkBtn.style.backgroundColor = ""; // Reset button color
            isCheckMode = false;
            isShowingResult = false; // Reset state
            resultDisplay.textContent = ''; // Clear result
            answerInput.value = ''; // Clear input field
        }
    }
});

// Close check mode when clicking outside of the flashcard area
document.addEventListener('mousedown', (event) => {
    if (isCheckMode && !flashcard.contains(event.target) && !checkBtn.contains(event.target) && !answerOverlay.contains(event.target)) {
        answerOverlay.style.display = 'none'; // Hide overlay
        checkBtn.style.backgroundColor = ""; // Reset button color
        isCheckMode = false;
        isShowingResult = false; // Reset state
        resultDisplay.textContent = ''; // Clear result
        answerInput.value = ''; // Clear input field
    }
});

// Add event listener for keydown to handle shortcuts
document.addEventListener('keydown', (event) => {
    const isInputFocused = document.activeElement === answerInput || document.activeElement === vocabInput;

    if (event.key === ' ' && !isInputFocused) {
        event.preventDefault();
        flipCard(); // Flip card on space bar press
    } else if (event.key === 'ArrowLeft' && currentCardIndex > 0 && !isInputFocused) {
        event.preventDefault();
        currentCardIndex--; // Move to previous card on left arrow
        isFlipped = false;
        updateFlashcard();
    } else if ((event.key === 'ArrowRight' || event.key === 'Enter') && currentCardIndex < vocabCards.length - 1 && !isInputFocused) {
        event.preventDefault();
        currentCardIndex++; // Move to next card on right arrow or Enter key
        isFlipped = false;
        updateFlashcard();
    } else if (event.key === 'r' && !isInputFocused) {
        event.preventDefault();
        reverseBtn.click(); // Trigger reverse button on 'R' key press
    } else if (event.key === 'c' && !isInputFocused) {
        event.preventDefault();
        checkBtn.click(); // Trigger check button on 'C' key press
    } else if (event.key === 's' && !isInputFocused) {
        event.preventDefault();
        shuffleBtn.click(); // Trigger shuffle button on 'S' key press
    } else if (event.key === 'a' && !isInputFocused) {
        event.preventDefault();
        addVocabBtn.click(); // Trigger add vocabulary button on 'A' key press
    }
});


// JavaScript to scroll to the top of the page when clicking on the logo
document.getElementById('logo').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});