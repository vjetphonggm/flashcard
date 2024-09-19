// Get references to DOM elements
const flashcard = document.getElementById('flashcard'); // Flashcard element
const flashcardWrapper = document.querySelector('.flashcard-wrapper'); // Wrapper for flashcard
const prevBtn = document.getElementById('prev'); // Previous button
const nextBtn = document.getElementById('next'); // Next button
const shuffleBtn = document.getElementById('shuffle'); // Shuffle button
const reverseBtn = document.getElementById('reverse'); // Reverse button
const cardCount = document.getElementById('card-count'); // Display for card count (e.g., "1/10")
const addVocabBtn = document.getElementById('add-vocab'); // Button to add new vocabulary
const vocabInput = document.getElementById('vocab-input'); // Input field for new vocabulary
const cardList = document.getElementById('card-list'); // List of vocabulary cards
const checkBtn = document.getElementById('check'); // Check button for answers
const answerOverlay = document.getElementById('answer-overlay'); // Overlay for answer checking
const answerInput = document.getElementById('answer-input'); // Input field for answer
const resultDisplay = document.getElementById('result'); // Display for result (correct/incorrect)
const addVocabShowBtn = document.getElementById('add-vocab-show'); // Button to show vocabulary input section
const vocabInputSection = document.getElementById('vocab-input-section'); // Section to input new vocabulary
const inputSection = document.getElementById('input-section'); // Section containing the vocabulary input
const closeVocabInputBtn = document.getElementById('close-vocab-input'); // Button to close the vocabulary input section
const cardListSection = document.getElementById('card-list-section'); // Section showing the list of vocabulary cards

// Variables to track the state of the flashcards and interactions
let vocabCards = []; // Array to store vocabulary cards
let currentCardIndex = 0; // Index of the current card being displayed
let isFlipped = false; // Flag to track if the card is flipped
let isReversed = false; // Flag to track if the card content is reversed (word/definition)
let isShuffled = false; // Flag to track if the cards are shuffled
let isCheckMode = false; // Flag to track if the check mode is active
let isShowingResult = false; // Flag to track if the result is being shown
let originalOrder = []; // Array to store the original order of cards for unshuffling

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
        cardCount.textContent = `${currentCardIndex + 1} / ${vocabCards.length}`;

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
flashcard.addEventListener('click', (event) => {
    flipCard(); // Flip card when flashcard is clicked
    event.stopPropagation(); // Prevent event from bubbling up
});

flashcardWrapper.addEventListener('click', () => {
    flipCard(); // Flip card when flashcard wrapper is clicked
});

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

// Hide the card-list-section initially
cardListSection.style.display = 'none';

// Add new vocabulary and update card list
addVocabBtn.addEventListener('click', () => {
    const vocabLines = vocabInput.value.trim().split('\n');
    let hasNewVocab = false;

    vocabLines.forEach(line => {
        const parts = line.split('\t');
        let word, type, phonetic, definition, example;

        if (parts.length >= 2) {
            word = parts[0].trim();
            definition = parts[1].trim();

            if (parts.length >= 3) phonetic = parts[2].trim();
            if (parts.length >= 4) type = parts[3].trim();
            if (parts.length >= 5) example = parts[4].trim();

            if (word && definition) {
                vocabCards.push({
                    word,
                    type: type || '',
                    phonetic: phonetic || '',
                    definition: definition || '',
                    example: example || ''
                });

                // Create list item for the card
                const cardItem = document.createElement('li');
                cardItem.textContent = word;

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';

                deleteBtn.addEventListener('click', () => {
                    const index = vocabCards.findIndex(card => card.word === word);
                    vocabCards.splice(index, 1); // Remove card from array
                    cardItem.remove(); // Remove list item
                    currentCardIndex = 0;
                    updateFlashcard();

                    // Hide card-list-section if no vocabulary left
                    if (vocabCards.length === 0) {
                        cardListSection.style.display = 'none';
                    }
                });
                cardItem.appendChild(deleteBtn);
                cardList.appendChild(cardItem);
                hasNewVocab = true;
            }
        }
    });

    if (hasNewVocab) {
        cardListSection.style.display = 'block'; // Show card-list-section if new vocab added
    }

    vocabInput.value = ''; // Clear input field
    vocabInputSection.style.display = 'none'; // Hide vocab input section
    updateFlashcard(); // Update flashcard display

    window.scrollTo(0, 0); // Scroll to top after adding vocabulary
});

// Show or hide the answer check overlay when the Check button is clicked
checkBtn.addEventListener('click', () => {
    if (!isCheckMode) {
        answerOverlay.style.display = 'flex'; // Show overlay
        checkBtn.style.backgroundColor = "#007bff"; // Set active button color
        isCheckMode = true;
        isShowingResult = false; // Reset result display state
        answerInput.focus();

        // Enable Reverse when Check mode is activated
        if (!isReversed) {
            reverseBtn.click(); // Simulate click to activate Reverse
        }

        // Lock flipping functionality when Check mode is activated
        lockFlipping();
    } else {
        answerOverlay.style.display = 'none'; // Hide overlay
        checkBtn.style.backgroundColor = ""; // Reset button color
        isCheckMode = false;
        isShowingResult = false; // Reset result display state
        resultDisplay.textContent = ''; // Clear result
        answerInput.value = ''; // Clear input field

        // Disable Reverse when Check mode is deactivated
        if (isReversed) {
            reverseBtn.click(); // Simulate click to deactivate Reverse
        }

        // Unlock flipping functionality when Check mode is deactivated
        unlockFlipping();
    }
});

// Check the user's answer when Enter is pressed
answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key action
        if (!isShowingResult) {
            const userAnswer = answerInput.value.trim().toLowerCase();
            const correctAnswer = vocabCards[currentCardIndex].word.toLowerCase(); // Get the correct word

            // Display result
            resultDisplay.innerHTML = '';

            if (userAnswer === correctAnswer) {
                resultDisplay.innerHTML = `<span class="result correct"><i class="fas fa-check-circle"></i> ${vocabCards[currentCardIndex].word}</span>`;
            } else {
                resultDisplay.innerHTML = `<span class="result wrong"><i class="fas fa-times-circle"></i> ${vocabCards[currentCardIndex].word}</span>`;
            }

            isShowingResult = true; // Set result display state
        } else {
            // Handle second Enter press (move to next card or exit check mode)
            if (currentCardIndex >= vocabCards.length - 1) {
                // If at the last card, exit check mode and deactivate Reverse if active
                answerOverlay.style.display = 'none'; // Hide overlay
                checkBtn.style.backgroundColor = ""; // Reset check button color
                isCheckMode = false;
                isShowingResult = false; // Reset result display state
                resultDisplay.textContent = ''; // Clear result
                answerInput.value = ''; // Clear input field

                if (isReversed) {
                    reverseBtn.click(); // Turn off reverse mode if active
                }
            } else {
                // Move to the next card if not at the last card
                currentCardIndex++;
                isFlipped = false;
                updateFlashcard();
                resultDisplay.textContent = '';
                answerInput.value = '';
                isShowingResult = false;
            }
        }
    }
});

// Close check mode when clicking outside of the flashcard area
document.addEventListener('mousedown', (event) => {
    if (isCheckMode && !flashcard.contains(event.target) && !flashcardWrapper.contains(event.target) && !checkBtn.contains(event.target) && !answerOverlay.contains(event.target)) {
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
        addVocabShowBtn.click(); // Trigger add vocabulary show button on 'A' key press
    } else if (event.key === 'Escape' && isCheckMode) {
        // Exit Check mode with ESC key
        checkBtn.click(); // Simulate click to deactivate Check
    }
});

// Show vocab input section when 'Add Vocabulary' button is clicked
addVocabShowBtn.addEventListener('click', () => {
    vocabInputSection.style.display = 'flex'; // Show vocab input section
});

// Toggle visibility of vocab input section when 'Add Vocabulary' button is clicked
addVocabBtn.addEventListener('click', () => {
    inputSection.classList.toggle('show'); // Toggle visibility of vocab input section
    vocabInput.focus(); // Focus on the input field
});

// Close vocab input section when 'X' button is clicked
closeVocabInputBtn.addEventListener('click', () => {
    vocabInputSection.style.display = 'none';
});

// Close vocab input section when clicking outside the input section
vocabInputSection.addEventListener('click', (event) => {
    if (event.target === vocabInputSection) {
        vocabInputSection.style.display = 'none';
    }
});

const logo = document.getElementById('logo');
logo.addEventListener('click', () => {
    window.scrollTo(0, 0); // Scroll to top when logo is clicked
});

// Function to lock the flipping functionality
function lockFlipping() {
    flashcard.removeEventListener('click', flipCard); // Remove click event for flipping
    flashcardWrapper.removeEventListener('click', flipCard); // Remove click event for flipping
}

// Function to unlock the flipping functionality
function unlockFlipping() {
    flashcard.addEventListener('click', flipCard); // Add click event for flipping
    flashcardWrapper.addEventListener('click', flipCard); // Add click event for flipping
}

// Add event listener for keydown to handle closing vocab input with ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && vocabInputSection.style.display === 'flex') {
        vocabInputSection.style.display = 'none'; // Hide vocab input section when ESC is pressed
    }
});

// Activate check mode
checkBtn.addEventListener('click', () => {
    if (!isCheckMode) {
        lockFlipping(); // Lock flipping for both flashcard and flashcard-wrapper
    } else {
        unlockFlipping(); // Unlock flipping when exiting check mode
    }
});