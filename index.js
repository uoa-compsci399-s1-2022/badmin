/**
 * Show text function
 */
function showGame() {
    document.getElementById("gameText").style.display = "block";
    document.getElementById("gameHidden").style.display = "none";
    document.getElementById("gameControls").style.display = "flex";
    document.getElementById("text-sel").style.display = "none";
    document.getElementById("pageInfo").style.display = "none";
    document.getElementById("title").style.color = "#60525F"
    document.getElementById("score").style.display = "grid";
    document.getElementById("comboContainer").style.display = "flex";
    document.getElementById("timer").style.display = "inline";
}
/**
 * Blur text function
 */
function hideGame() {
    document.getElementById("gameText").style.display = "none";
    document.getElementById("gameHidden").style.display = "block";
    document.getElementById("gameControls").style.display = "none";
    document.getElementById("score").style.display = "none";
    document.getElementById("comboContainer").style.display = "none";
    document.getElementById("timer").style.display = "none";
}

function pause() {
    document.getElementById("gameText").style.display = "none";
    document.getElementById("gameHidden").style.display = "block";
    document.getElementById("gameControls").style.display = "flex";
    document.getElementById("text-sel").style.display = "grid";
    document.getElementById("pageInfo").style.display = "grid";
    document.getElementById("title").style.color = "#EDD9A3"
}

function getVersion() {
    document.getElementById("vers").innerText = "v. Beta";
}

/**
* @function sanitizeInput sanitizes the user input as described in SP-23
* @param e - the event @type - "beforeinput"
* @returns if the text has been changed
*/
function sanitizeInput(e) {
    // case: delete or single alphabetical character //TODO: add quotation marks etc? would prefer if the retyping was just words, TBC w team
    if (
        e.inputType == "deleteContentBackward" || e.inputType == "deleteContentForward" || /^[a-zA-Z()]$/.test(e.data)
    ) {
        return false;
    }
    e.preventDefault();
    return true;
}

/**
* @function highlightText() highlights prefixes of words in the passage given a search text, the function is only run when the search has been updated
* @param e - the event @type - "before input"
* @param element - the textarea element inputTextBox
*/
let previousSearchIndicies = new Array();
let correctedWordsIndicies = new Array();
let currentSearchIndex = 0;
function highlightText(element) {
    const gameTextArr = suppliedText.split(" ");
    const gameTextElements = document.getElementById("gameText").children;
    const searchText = element.innerText;
    clearPreviousHighlight();
    if (searchText.length >= 1) {
        for (let i = 0; i < gameTextArr.length; i++) {
            const gameTextElement = gameTextElements[i];
            const word = gameTextArr[i];
            if (word.startsWith(searchText) && !correctedWordsIndicies.includes(i.toString())) {
                gameTextElement.innerHTML = "<mark>" + gameTextElement.innerHTML.slice(0, searchText.length) + "</mark>" + gameTextElement.innerHTML.slice(searchText.length);
                previousSearchIndicies.push(i);
            }
        }
    }
    if (previousSearchIndicies.length >= 1) {
        gameTextElements[previousSearchIndicies[currentSearchIndex]].firstElementChild.style.backgroundColor = "lightblue";
    }
}

function clearPreviousHighlight() {

    const gameTextElements = document.getElementById("gameText").children;
    if (previousSearchIndicies.length >= 1) {
        const searchElement = gameTextElements[previousSearchIndicies[currentSearchIndex]].firstElementChild;
        searchElement.outerHTML = `<mark>${searchElement.innerHTML}</mark>`; //clearing the attributes (including style) of the current selected search result
    }
    for (let index of previousSearchIndicies) {
        const gameTextElement = gameTextElements[index];
        const beforePrefix = gameTextElement.innerHTML.split("<mark>")[0];
        const prefix = gameTextElement.innerHTML.split("<mark>")[1];

        gameTextElement.innerHTML = beforePrefix + prefix.split("</mark>")[0] + prefix.split("</mark>")[1];
    }
    previousSearchIndicies = new Array();
    currentSearchIndex = 0;
}


// so far will just be called when enter is pressed, ideally, this will be called each time they make a change to inputbox 
//so that it will update the highlighing 

/**
* @function fuzzyHighlight() highlights fuzzy matches of words in the gameText element, the function is only run when the inputText bar is updated
*/
function fuzzyHighlight() {
    let inputSearch = document.getElementById("inputTextBox").innerText
    const gameTextArr = suppliedText.split(" ");
    const gameTextElements = document.getElementById("gameText").children;
    let wordPlusIndicesArr = [];
    if (inputSearch.length >= 3) {
        wordPlusIndicesArr = fuzzySearch(inputSearch);
    } else {
        //dont activate fuzzy, just highlight exact 2 char matches only starting at corresponding index
        wordPlusIndicesArr = normalSearchOnly(inputSearch);
    }

    let extractedWords = []
    let startingIndex;
    let highlightStart;

    for (let j = 0; j < wordPlusIndicesArr.length; j++) {
        extractedWords.push(wordPlusIndicesArr[j][0])
    }

    clearPreviousHighlight();
    // call function here to revert changes back to normal text pre-highlighting
    revertDynamicHighlightChanges();
    if (inputSearch.length >= 1) {
        for (let i = 0; i < gameTextArr.length; i++) {
            const gameTextElement = gameTextElements[i];
            const word = gameTextArr[i];
            if (extractedWords.includes(word) && !correctedWordsIndicies.includes(i.toString())) {
                if (inputSearch.length >= 3) {
                    startingIndex = extractedWords.indexOf(word)
                    highlightStart = wordPlusIndicesArr[startingIndex][1];
                    gameTextElement.innerHTML = gameTextElement.innerHTML.slice(0, highlightStart) + "<mark>" + inputSearch + "</mark>" + gameTextElement.innerHTML.slice(highlightStart + inputSearch.length);
                    previousSearchIndicies.push(i);
                } else {
                    startingIndex = extractedWords.indexOf(word)
                    highlightStart = wordPlusIndicesArr[startingIndex][1];
                    gameTextElement.innerHTML = gameTextElement.innerHTML.slice(0, highlightStart) + "<mark>" + gameTextElement.innerHTML.slice(highlightStart, highlightStart + inputSearch.length) + "</mark>" + gameTextElement.innerHTML.slice(highlightStart + inputSearch.length);
                    previousSearchIndicies.push(i);
                }
            }
        }
    }
    if (previousSearchIndicies.length >= 1) {
        gameTextElements[previousSearchIndicies[currentSearchIndex]].firstElementChild.style.backgroundColor = "lightblue";
    }
}




/**
* @function revertDynamicHighlightChanges() - compares suppliedText currently during highlighting and the current unchanged suppliedText
* changes back changes from inputText search back into prehighlighting state if not confirmed to changed
*/
function revertDynamicHighlightChanges() {
    const gameTextArr = suppliedText.split(" ");
    const gameTextElements = document.getElementById("gameText").children;
    const duplicateGameTextArr = currentSuppliedTextDuplicate.split(" ");
    for (let i = 0; i < gameTextArr.length; i++) {
        const gameTextElement = gameTextElements[i];
        const duplicateWord = duplicateGameTextArr[i];
        if (gameTextElement.innerText !== duplicateWord && !correctedWordsIndicies.includes(i.toString())) {
            gameTextElement.innerHTML = duplicateWord //change the supplied inner text back to what it was usually
        }
    }



}

/**
* @function confirmChangeOnBlueHighlight() - called on when user presses enter/space to confirm a change. sets the global variable indexOfBlueHighlight to check for where they are correcting the word,
* this same global variable is used as a further check in CheckUserInput()
*/
let indexOfBlueHighlight;
function confirmChangeOnBlueHighlight() {
    let inputSearch = document.getElementById("inputTextBox")
    const gameTextArr = suppliedText.split(" ");
    const gameTextElements = document.getElementById("gameText").children;
    for (let i = 0; i < gameTextArr.length; i++) {
        const gameTextElement = gameTextElements[i];
        if (gameTextElement.innerHTML.indexOf("style") !== -1) {
            indexOfBlueHighlight = i
            checkUserInput(inputSearch) //check the user input at highlighted blue's index too
        }
    }
}

/**
* @function resetHighlights() - removes all marks from the passage to cleanse for next searchTerm to prevent dirtying the divs.
* It is called when enter is pressed, on entering a correct word, and also when an incorrect word is entered
*/
function resetHighlights() {
    const gameTextArr = suppliedText.split(" ");
    const gameTextElements = document.getElementById("gameText").children;
    for (let i = 0; i < gameTextArr.length; i++) {
        const gameTextElement = gameTextElements[i];
        //strip all yellow
        if (gameTextElement.innerHTML.indexOf("<mark>") !== -1) {
            const beforePrefix = gameTextElement.innerHTML.split("<mark>")[0];
            const prefix = gameTextElement.innerHTML.split("<mark>")[1];

            gameTextElement.innerHTML = beforePrefix + prefix.split("</mark>")[0] + prefix.split("</mark>")[1];
        }
        //to remove blue
        if (gameTextElement.innerHTML.indexOf("style") !== -1) {
            const beforePrefix = gameTextElement.innerHTML.split('<mark style="background-color: lightblue;">')[0];
            const prefix = gameTextElement.innerHTML.split('<mark style="background-color: lightblue;">')[1];
            gameTextElement.innerHTML = beforePrefix + prefix.split("</mark>")[0] + prefix.split("</mark>")[1];
        }
        previousSearchIndicies = new Array();
        currentSearchIndex = 0;
    }
}


/**
* @function fuzzySearch() will identify the matched fuzzy words in the text, calls the function from diff_patch_match
* @param testInput - the text from the inputBox game control
* @return - returns an array of arrays, first index is the fuzzy matched word along at the index, where the matching starts, for subsequent corrections and highlights begin at
*/
let testLoc = 0; //to take the first instance of a match in each word
function fuzzySearch(testInput) {
    let dmp = new diff_match_patch();
    let matchingWordPlusIndex = []
    const gameTextArr = suppliedText.split(" ");
    for (let i = 0; i < gameTextArr.length; i++) {
        let match = dmp.match_main(gameTextArr[i], testInput, testLoc)
        if (match !== -1) {
            matchingWordPlusIndex.push([gameTextArr[i], match])
        }
    }
    return matchingWordPlusIndex;
}

function normalSearchOnly(inputSearch) {
    const gameTextArr = suppliedText.split(" ");
    const gameTextElements = document.getElementById("gameText").children;
    const searchText = inputSearch;
    let matchingWordPlusIndex = []
    if (searchText.length >= 1) {
        for (let i = 0; i < gameTextArr.length; i++) {
            const word = gameTextArr[i];
            if (word.indexOf(searchText) !== -1 && !correctedWordsIndicies.includes(i.toString())) {
                matchingWordPlusIndex.push([word, word.indexOf(searchText)])
            }
        }



    }
    return matchingWordPlusIndex
}


let lastUserInputTime;
function inputHandler(element, event) {
    if (event.code == "Enter" || event.code == "Space") {
        confirmChangeOnBlueHighlight();
        resetHighlights();

        indexOfBlueHighlight = null; //to refresh where the blue indicator is
        lastUserInputTime = Date.now()
    }
    else if (event.code == "ArrowUp" || event.code == "ArrowDown" || event.code == "ArrowLeft" || event.code == "ArrowRight") {
        navigateSearchResults(event.code);
        event.preventDefault();
    }
}


let countCorrect = 0;
let countWrong = 0;
let score = 0;
let comboCounter = 0;
let previousCorrectedTime = null;


function checkUserInput(element) {
    let possibleCorrectableIndices = []
    if (element.innerText.length >= 1) {
        let index = -1;
        for (let i = 0; i < Object.keys(correctIndicies).length; i++) {
            if (correctedWordsIndicies.includes(i) == false) {
                //index was being overriden to the last index, by default, we start from correcting the first instance
                if (correctIndicies[Object.keys(correctIndicies)[i]].replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ") == element.innerText && !correctedWordsIndicies.includes(Object.keys(correctIndicies)[i])) {
                    index = Object.keys(correctIndicies)[i];
                    possibleCorrectableIndices.push((index).toString());
                }
            }
        }
        // added end condition to ensure the user is correcting the proper word they choose based on where the blue highlight is
        if (index != "-1" && possibleCorrectableIndices.includes(indexOfBlueHighlight.toString())) {
            index = indexOfBlueHighlight.toString()
            if (correctedWordsIndicies.includes(indexOfBlueHighlight.toString()) == false) {
                replaceWord(correctIndicies[index], index);
                correctedWordsIndicies.push(index);
                const currentTime = Date.now();
                if (previousCorrectedTime == null) {
                    comboCounter = 1;
                }
                else if (currentTime - previousCorrectedTime <= TIME_LIMIT * 1000) {
                    if (comboCounter < 3) {
                        comboCounter++;
                    }
                }
                else {
                    comboCounter = 1;
                }

                restartComboTimer();
                comboStreak = comboStreak + TIME_LIMIT
                comboStreakArr.push(comboStreak)
                previousCorrectedTime = currentTime;
                score += 100 * comboCounter;
                document.getElementById("score").innerText = "score: \n" + score;
                document.getElementById("combo").innerText = "combo: \n" + comboCounter;
                countCorrect++;
                // to update the comparator passage
                currentSuppliedTextDuplicate = suppliedText;
                // to try reset the changed texts after correction
                revertDynamicHighlightChanges();
            }
        }
        else {
            //when wrong, also reset highlights, and change back all dynamically change text from highlighting
            revertDynamicHighlightChanges();

            document.getElementById("inputTextBox").classList.add("error");
            comboCounter = 0;
            score -= 30;
            document.getElementById("score").innerText = "score: \n" + score;
            document.getElementById("combo").innerText = "combo: \n" + comboCounter;
            countWrong++;
            comboStreak = 0;
        }
    }
    setTimeout(() => { document.getElementById("inputTextBox").classList.remove("error"); }, 500);
    document.getElementById("inputTextBox").innerText = "";
}

let comboStreak = 0;
let comboStreakArr = [0]
const WIDTH = 60 //make sure it's the same as in the CSS under #comboBar
const TIME_LIMIT = 5 //make sure it's the same as in the CSS under #comboBar
function restartComboTimer() {
    const comboBar = document.getElementById("comboBar");
    comboBar.style.transition = `none`;
    comboBar.style.width = `${WIDTH}%`;
    comboBar.offsetHeight; // Refresh the user's cache
    comboBar.style.transition = `width ${TIME_LIMIT}s linear 0s`;
    comboBar.style.width = `0px`;


}

function stopComboTimer() {
    const comboBar = document.getElementById("comboBar");
    comboBar.style.transition = `none`;
    comboBar.style.width = `0%`;
}



function navigateSearchResults(key) {
    if (previousSearchIndicies.length >= 1) {
        const gameTextElements = document.getElementById("gameText").children;
        const searchElement = gameTextElements[previousSearchIndicies[currentSearchIndex]].firstElementChild;
        searchElement.outerHTML = `<mark>${searchElement.innerHTML}</mark>`; //clearing the attributes (including style) of the current selected search result
        const length = previousSearchIndicies.length;
        if (key == "ArrowUp" || key == "ArrowLeft") {
            currentSearchIndex = (((currentSearchIndex - 1) % length) + length) % length // modulus formula [ ((a % n ) + n ) % n ] to account for negative values
        }
        if (key == "ArrowDown" || key == "ArrowRight") {
            currentSearchIndex = (currentSearchIndex + 1) % length // currentSearchIndex can't be negative, so currentSearchIndex + 1 can't be negative => use positive only modulus

        }
        gameTextElements[previousSearchIndicies[currentSearchIndex]].firstElementChild.style.backgroundColor = "lightblue";
    }
}

let correctIndicies = {};
function generateCorrectIndicies() {
    suppliedArray = suppliedText.split(" ");
    correctArray = correctText.split(" ");
    for (let i = 0; i < suppliedArray.length; i++) {
        if (suppliedArray[i] != correctArray[i]) {
            correctIndicies[i] = correctArray[i];
        }
    }
}

function replaceWord(correctWord, correctedIndex) {
    document.getElementById("gameText").children[correctedIndex].innerText = correctWord;
    document.getElementById("gameText").children[correctedIndex].style.color = "#EDD9A3";
    document.getElementById("inputTextBox").innerText = "";
}

let hintProvided = 0;

function showHint() {
    if (hintProvided == 0) {
        if (Date.now() - lastUserInputTime >= 30000) {
            document.getElementById("hint").style.visibility = "visible";
        }
    }
}

function resetHint() {
    document.getElementById("hint").innerText = "Hint";
    document.getElementById("hint").style.visibility = "hidden";
    hintProvided = 0;
    var element = document.getElementById("hint");
    element.classList.remove("fade-out");
}

function provideHint() {
    if (hintProvided == 0) {
        wordsLeft = Object.keys(correctIndicies).length - correctedWordsIndicies.length;
        document.getElementById("hint").innerText = wordsLeft + " words left!";
        document.getElementById("hint").className = "fade-out";
        setTimeout(() => { document.getElementById("hint").style.visibility = "hidden"; }, 10000);
        hintProvided = 1;
    }
}

function refresh() {
    window.location.reload();
}

window.onload = function () {
    getVersion();
    loadText();
    document.getElementById("inputTextBox").addEventListener("beforeinput", function (e) { sanitizeInput(e); });
    document.getElementById("inputTextBox").addEventListener("input", function () { fuzzyHighlight(this); });
    document.getElementById("inputTextBox").addEventListener("keydown", function (e) { inputHandler(this, e); });

};

let gameStartTime;
let timerVar = 0;
let hintVar = 0;
function startTimer() {
    gameStartTime = Date.now();
    showGame();
    correctIndicies = {};
    correctedWordsIndicies = new Array();
    document.getElementById("inputTextBox").innerText = ""
    document.getElementById("inputTextBox").setAttribute("contenteditable", true);
    document.getElementById("inputTextBox").focus();
    document.getElementById("timer").innerHTML = "";
    loadText();
    totalSeconds = 0;
    timerVar = setInterval(countTimer, 1000);
    hintVar = setInterval(showHint, 1000);
    setInterval(function () { scoreOverTime.push(score) }, 10000);
    setInterval(function () { xValues.push(totalSeconds) }, 10000);
    lastUserInputTime = Date.now()
    showGame();
    generateCorrectIndicies();
    countCorrect = 0;
    countWrong = 0;
    score = 0;
    comboCounter = 0;
    document.getElementById("score").innerText = `score: \n ${score}`;
    document.getElementById("combo").innerText = `combo: \n ${comboCounter}`;
    previousCorrectedTime = null;
}

function stopTimer() {
    stopComboTimer();
    clearPreviousHighlight();
    document.getElementById("inputTextBox").innerText = "\u2009"
    document.getElementById("inputTextBox").setAttribute("contenteditable", false);
    clearInterval(timerVar);
    clearInterval(hintVar);
    resetHint();
    pause();
    scoreOverTime.push(score);
    xValues.push(totalSeconds);
    showModal();

}

function showModal() {
    document.getElementById("endGameModal").style.display = "block";
    displayStats();


}

function displayStats() {
    document.getElementById("modalScore").innerText = "Score: " + score;
    document.getElementById("modalaccuracy").innerText = "Accuracy: " + Math.max(0, Math.round(((countCorrect - countWrong) / Object.keys(correctIndicies).length) * 100)) + "%"
    calculateComboStreak()
    formatTimeTaken();
    getEveryWord();
    calculateModalGraph();

}

function calculateComboStreak() {
    const maxComboStreak = Math.max(...comboStreakArr)
    const minTimeCombo = Math.min(maxComboStreak, totalSeconds)
    let hour = Math.floor(minTimeCombo / 3600);
    let minute = Math.floor((minTimeCombo - hour * 3600) / 60);
    let seconds = minTimeCombo - (hour * 3600 + minute * 60);
    if (minute === 0) {
        document.getElementById("modalComboStreak").innerText = "Longest Combo Streak: " + seconds + " seconds";
    } else if (minute !== 0 && hour !== 0) {
        document.getElementById("modalComboStreak").innerText = "Longest Combo Streak: " + hour + " hrs " + minute + " mins " + seconds + " seconds";

    }
    else {
        document.getElementById("modalComboStreak").innerText = "Longest Combo Streak: " + minute + " mins " + seconds + " seconds";
    }

}

function formatTimeTaken() {
    let hour = Math.floor(totalSeconds / 3600);
    let minute = Math.floor((totalSeconds - hour * 3600) / 60);
    let seconds = totalSeconds - (hour * 3600 + minute * 60);
    if (minute === 0) {
        document.getElementById("modalTimeTaken").innerText = "Time Taken: " + seconds + " seconds";
    } else if (minute !== 0 && hour !== 0) {
        document.getElementById("modalTimeTaken").innerText = "Time Taken: " + hour + " hrs " + minute + " mins " + seconds + " seconds";

    }
    else {
        document.getElementById("modalTimeTaken").innerText = "Time Taken: " + minute + " mins " + seconds + " seconds";
    }
}



function getEveryWord() {
    if (Object.keys(correctIndicies).length === correctedWordsIndicies.length) {
        document.getElementById("modalGotEverything").innerText = "You got every word!"
    }
    else {
        document.getElementById("modalGotEverything").innerText = "You did not find " + (Object.keys(correctIndicies).length - correctedWordsIndicies.length) + " words in the text!";
    }
}

// Our labels along the x-axis
let xValues = [0];
// For drawing the lines
let scoreOverTime = [0];



let myChart;
let ctx;
function calculateModalGraph() {
    ctx = document.getElementById("myChart");
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [
                {
                    data: scoreOverTime,
                    borderColor: "#3e95cd",
                    fill: false,
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                yAxis: {
                    ticks: {
                        color: "#B2A3B5",
                        beginAtZero: true,
                    },
                    grid: {
                        color: "#B2A3B5",
                    },
                    title: {
                        display: true,
                        text: "Score",
                        padding: { top: 0, left: 0, right: 0, bottom: 0 },
                        color: "#B2A3B5",
                    },
                },
                xAxis: {
                    ticks: {
                        color: "#B2A3B5",
                        beginAtZero: true,
                    },
                    grid: {
                        color: "#B2A3B5",
                    },
                    title: {
                        display: true,
                        text: "Time",
                        padding: { top: 0, left: 0, right: 0, bottom: 0 },
                        color: "#B2A3B5",
                    },
                },
            }
        }
    });
}


// resets global variables added in endGameModal
function resetDataSet() {
    scoreOverTime = [0];
    xValues = [0];
    myChart.destroy();
    comboStreak = 0;
    scoreOverTime = [0];

}


function closeGameModal() {
    endGameModal.style.display = "none";
    resetDataSet();
}

// closes modal when anywhere is clicked
window.onclick = function (event) {
    if (event.target == endGameModal) {
        endGameModal.style.display = "none";
        resetDataSet();
    }
}



function countTimer() {
    const timeElapsed = Date.now() - gameStartTime;
    const seconds = Math.floor(timeElapsed / 1000) % 60;
    const minutes = Math.floor((timeElapsed / 1000) / 60);
    document.getElementById("timer").innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

let difficulty;

function setEasy() {
    difficulty = "Easy";

    document.getElementById("easy").style.color = "#EDD9A3";
    document.getElementById("medium").style.color = "#B2A3B5";
    document.getElementById("hard").style.color = "#B2A3B5";
}

function setMedium() {
    difficulty = "Medium";

    document.getElementById("easy").style.color = "#B2A3B5";
    document.getElementById("medium").style.color = "#EDD9A3";
    document.getElementById("hard").style.color = "#B2A3B5";
}

function setHard() {
    difficulty = "Hard";

    document.getElementById("easy").style.color = "#B2A3B5";
    document.getElementById("medium").style.color = "#B2A3B5";
    document.getElementById("hard").style.color = "#EDD9A3";
}

function setSF() {
    genre = "Sci-Fi"

    document.getElementById("sci-fi").style.color = "#EDD9A3";
    document.getElementById("slice_of_life").style.color = "#B2A3B5";
    document.getElementById("non-fiction").style.color = "#B2A3B5";
    document.getElementById("article").style.color = "#B2A3B5";
    document.getElementById("romance").style.color = "#B2A3B5";
    document.getElementById("comedy").style.color = "#B2A3B5";
    document.getElementById("wikipedia").style.color = "#B2A3B5";
    document.getElementById("mystery").style.color = "#B2A3B5";
}

function setSoL() {
    genre = "Slice of Life"

    document.getElementById("sci-fi").style.color = "#B2A3B5";
    document.getElementById("slice_of_life").style.color = "#EDD9A3";
    document.getElementById("non-fiction").style.color = "#B2A3B5";
    document.getElementById("article").style.color = "#B2A3B5";
    document.getElementById("romance").style.color = "#B2A3B5";
    document.getElementById("comedy").style.color = "#B2A3B5";
    document.getElementById("wikipedia").style.color = "#B2A3B5";
    document.getElementById("mystery").style.color = "#B2A3B5";
}

function setNF() {
    genre = "Non-Fiction"

    document.getElementById("sci-fi").style.color = "#B2A3B5";
    document.getElementById("slice_of_life").style.color = "#B2A3B5";
    document.getElementById("non-fiction").style.color = "#EDD9A3";
    document.getElementById("article").style.color = "#B2A3B5";
    document.getElementById("romance").style.color = "#B2A3B5";
    document.getElementById("comedy").style.color = "#B2A3B5";
    document.getElementById("wikipedia").style.color = "#B2A3B5";
    document.getElementById("mystery").style.color = "#B2A3B5";
}

function setRom() {
    genre = "Romance"

    document.getElementById("sci-fi").style.color = "#B2A3B5";
    document.getElementById("slice_of_life").style.color = "#B2A3B5";
    document.getElementById("non-fiction").style.color = "#B2A3B5";
    document.getElementById("article").style.color = "#B2A3B5";
    document.getElementById("romance").style.color = "#EDD9A3";
    document.getElementById("comedy").style.color = "#B2A3B5";
    document.getElementById("wikipedia").style.color = "#B2A3B5";
    document.getElementById("mystery").style.color = "#B2A3B5";
}

function setArt() {
    genre = "Article"

    document.getElementById("sci-fi").style.color = "#B2A3B5";
    document.getElementById("slice_of_life").style.color = "#B2A3B5";
    document.getElementById("non-fiction").style.color = "#B2A3B5";
    document.getElementById("article").style.color = "#EDD9A3";
    document.getElementById("romance").style.color = "#B2A3B5";
    document.getElementById("comedy").style.color = "#B2A3B5";
    document.getElementById("wikipedia").style.color = "#B2A3B5";
    document.getElementById("mystery").style.color = "#B2A3B5";
}

function setMy() {
    genre = "Mystery"

    document.getElementById("sci-fi").style.color = "#B2A3B5";
    document.getElementById("slice_of_life").style.color = "#B2A3B5";
    document.getElementById("non-fiction").style.color = "#B2A3B5";
    document.getElementById("article").style.color = "#B2A3B5";
    document.getElementById("romance").style.color = "#B2A3B5";
    document.getElementById("comedy").style.color = "#B2A3B5";
    document.getElementById("wikipedia").style.color = "#B2A3B5";
    document.getElementById("mystery").style.color = "#EDD9A3";
}

function setCom() {
    genre = "Comedy"

    document.getElementById("sci-fi").style.color = "#B2A3B5";
    document.getElementById("slice_of_life").style.color = "#B2A3B5";
    document.getElementById("non-fiction").style.color = "#B2A3B5";
    document.getElementById("article").style.color = "#B2A3B5";
    document.getElementById("romance").style.color = "#B2A3B5";
    document.getElementById("comedy").style.color = "#EDD9A3";
    document.getElementById("wikipedia").style.color = "#B2A3B5";
    document.getElementById("mystery").style.color = "#B2A3B5";
}

function setWiki() {
    genre = "Wikipedia"

    document.getElementById("sci-fi").style.color = "#B2A3B5";
    document.getElementById("slice_of_life").style.color = "#B2A3B5";
    document.getElementById("non-fiction").style.color = "#B2A3B5";
    document.getElementById("article").style.color = "#B2A3B5";
    document.getElementById("romance").style.color = "#B2A3B5";
    document.getElementById("comedy").style.color = "#B2A3B5";
    document.getElementById("wikipedia").style.color = "#EDD9A3";
    document.getElementById("mystery").style.color = "#B2A3B5";
}

let genre;

let JSONString = JSON.stringify(
    {
        "Easy": {
            "Sci-Fi": {
                "suppliedText": "There was once an alien that lived on a plannet called planet-1. He lived by himself and had no one else to talk to. He had his own spaceship and could go to many other differente planets. One day he wanted to go look for friends, and so he travalled to a planet neaby called planet-2. He landed his spaceship and went for a walk to look for people. There he found 3 friends and he asked them to join him on his planet.",
                "correctText": "There was once an alien that lived on a planet called planet-1. He lived by himself and had no one else to talk to. He had his own spaceship and could go to many other different planets. One day he wanted to go look for friends, and so he travelled to a planet nearby called planet-2. He landed his spaceship and went for a walk to look for people. There he found 3 friends and he asked them to join him on his planet.",
                "errorCount": "4"
            },
            "Slice of Life": {
                "suppliedText": "On an early Sunday morning, a caterpilar hatches from his egg. The text describes him as \"a tiny and very hungry caterpillar\". He begins to look for something to eat. The very hungry caterpillar eats through increasing quantitys of fruit for the following five days (Monday through Friday). First he starts with one apple on Monday, then two pears on Tuesday, then three plums on Wednesday, four straweberries on Thursday, and five oranges on Friday, but he is still hungry.",
                "correctText": "On an early Sunday morning, a caterpillar hatches from his egg. The text describes him as \"a tiny and very hungry caterpillar\". He begins to look for something to eat. The very hungry caterpillar eats through increasing quantities of fruit for the following five days (Monday through Friday). First he starts with one apple on Monday, then two pears on Tuesday, then three plums on Wednesday, four strawberries on Thursday, and five oranges on Friday, but he is still hungry.",
                "errorCount": "3"
            },
            "Non-Fiction": {
                "suppliedText": "The dog is a mammal with sharp teeth, an excelent sense of smell, and a fine sense of hearing. Each of its four legs ends in a foot, or paw, with five toes. Each toe has a soft pad and a claw. A coat of hair keeps the dog warm. It cooles off by panting and hanging its tongue out of its mouth. People around the world keep doges as pets, guards, or work animals. Some dogs, called ferel dogs, do not live with people. These homeless dogs often roam around in groups, called packs. One type of dog, called the dingo, lives in the wild in Australia.",
                "correctText": "The dog is a mammal with sharp teeth, an excellent sense of smell, and a fine sense of hearing. Each of its four legs ends in a foot, or paw, with five toes. Each toe has a soft pad and a claw. A coat of hair keeps the dog warm. It cools off by panting and hanging its tongue out of its mouth. People around the world keep dogs as pets, guards, or work animals. Some dogs, called feral dogs, do not live with people. These homeless dogs often roam around in groups, called packs. One type of dog, called the dingo, lives in the wild in Australia.",
                "errorCount": "4"
            },
            "Romance": {
                "suppliedText": "Love is a word with many definitions. But the comomn thing about love is that it is a strong feeling of attraction towards a human being or an object. But to me love is not just a feeling, but it is the way you treat the ones you care for. You should treat the ones you love so considerately through your actions. They'll know you care and love them. Love in my eyes, is making that sacrifice for someone, knowing that you might regrat it sooner or later. Love is how you make another person feel when you are in their presence. Many people show or express there love for someone in many and different ways. To me, love is in actions not in werds. The true meaning of love like what is the meaning of life is one of the questions that will remain unsolved forever. But right now, love is a great thing that should be treasured forever and valued as an important part of your life.",
                "correctText": "Love is a word with many definitions. But the common thing about love is that it is a strong feeling of attraction towards a human being or an object. But to me love is not just a feeling, but it is the way you treat the ones you care for. You should treat the ones you love so considerately through your actions. They'll know you care and love them. Love in my eyes, is making that sacrifice for someone, knowing that you might regret it sooner or later. Love is how you make another person feel when you are in their presence. Many people show or express their love for someone in many and different ways. To me, love is in actions not in words. The true meaning of love like what is the meaning of life is one of the questions that will remain unsolved forever. But right now, love is a great thing that should be treasured forever and valued as an important part of your life.",
                "errorCount": "4"
            },
            "Article": {
                "suppliedText": "Street signs and markings are all around us. It is important to pay attention to dem. They help keep us safe. Learn about some of them here. Crosswalks tell us where to cross the street. An orange hand tells walkers to stope. It is not safe to cross a street when you see this sine. The green walking sign means it is safe to cross. Cars are supposed to wate. But you should always look both ways before crossing a street. Have you ever noticed a bumpy strip? It warns that the pavement is changing or ending. It helps people who have trouble seeing. A person who is walking is called a pedestrian. Some street signs use that word. See if you can spot the word pedestrian next time you are out!",
                "correctText": "Street signs and markings are all around us. It is important to pay attention to them. They help keep us safe. Learn about some of them here. Crosswalks tell us where to cross the street. An orange hand tells walkers to stop. It is not safe to cross a street when you see this sign. The green walking sign means it is safe to cross. Cars are supposed to wait. But you should always look both ways before crossing a street. Have you ever noticed a bumpy strip? It warns that the pavement is changing or ending. It helps people who have trouble seeing. A person who is walking is called a pedestrian. Some street signs use that word. See if you can spot the word pedestrian next time you are out!",
                "errorCount": "4"
            },
            "Mystery": {
                "suppliedText": "Ted and Kat's cousin Joe camee over to their house to stay over the summer break. Every day al three of them went to the beach and park and had a lot of fun. On the day before Joe had to leave to go back to his home, they took him to see the London Eye. Since they had gone on the ride before, Ted and Kat let Joe go on the ride by himself. They watch the wheel mov around and around until the ride finishes. Everybody leaves, bute where is their cousin Joe? They look here and there and everywhere, but they can not find Joe. Where iss he? Why can they not see him? Maybe he flewe away?",
                "correctText": "Ted and Kat's cousin Joe came over to their house to stay over the summer break. Every day all three of them went to the beach and park and had a lot of fun. On the day before Joe had to leave to go back to his home, they took him to see the London Eye. Since they had gone on the ride before, Ted and Kat let Joe go on the ride by himself. They watch the wheel move around and around until the ride finishes. Everybody leaves, but where is their cousin Joe? They look here and there and everywhere, but they can not find Joe. Where is he? Why can they not see him? Maybe he flew away?",
                "errorCount": "6"
            },
            "Comedy": {
                "suppliedText": "Floof the dog realy wants a phone... even if he can not use one! All his friends had one. Mum and Dad were alwais looking at theirs. But Floof had a very big problem... his big paws! Any time he saw a phone left somewhere, he would try to turn it on, and nothin would happen. Floof's big paws were too big. One day in the park, he saw someone's phone! Floof picked it up with his grat big paws. He asked everyone whether it was their phone, because Floof is a goud boy. Nobody knew whose phone it was. Then another dog turned up. \"It's mine,\" he said. He was happy he could return it. This dog was called Ollie, but he had a problem. He had big claws! Both Ollie and Floof were sad. But Floof got a brilliant idea. \"Why don't we use it as a bal! I will throw it to you, and you to me!\" Floof said. And who would have thought it, but..big paws and big claws were best to play catch. It was the best fun two dogs have ever had with a phon, in the entire history of phones!",
                "correctText": "Floof the dog really wants a phone... even if he can not use one! All his friends had one. Mum and Dad were always looking at theirs. But Floof had a very big problem... his big paws! Any time he saw a phone left somewhere, he would try to turn it on, and nothing would happen. Floof's big paws were too big. One day in the park, he saw someone's phone! Floof picked it up with his great big paws. He asked everyone whether it was their phone, because Floof is a good boy. Nobody knew whose phone it was. Then another dog turned up. \"It's mine,\" he said. He was happy he could return it. This dog was called Ollie, but he had a problem. He had big claws! Both Ollie and Floof were sad. But Floof got a brilliant idea. \"Why don't we use it as a ball! I will throw it to you, and you to me!\" Floof said. And who would have thought it, but..big paws and big claws were best to play catch. It was the best fun two dogs have ever had with a phone, in the entire history of phones!",
                "errorCount": "7"
            },
            "Wikipedia": {
                "suppliedText": "A movie or film is something whic uses pictures that move and sound to tell stories or teach people something. Most people watch movies as a type of fun. For some people, funn movies can mean movies that make them laugh, while for others it can mean movies that make them cry, or feel scared. A movie is made with a camera that takes pictures very quickly, at 24 or 25 pictures everi second. Movies can be made up, or show real life, or a mix of the two. To make a movie someone needs to write the story with what each person says and does. There needs to be som people who pay money to people working on the movie. Movies also need someune who tells others what to do, and everyone listens to that persun to make the movie.",
                "correctText": "A movie or film is something which uses pictures that move and sound to tell stories or teach people something. Most people watch movies as a type of fun. For some people, funny movies can mean movies that make them laugh, while for others it can mean movies that make them cry, or feel scared. A movie is made with a camera that takes pictures very quickly, at 24 or 25 pictures every second. Movies can be made up, or show real life, or a mix of the two. To make a movie someone needs to write the story with what each person says and does. There needs to be some people who pay money to people working on the movie. Movies also need someone who tells others what to do, and everyone listens to that person to make the movie.",
                "errorCount": "6"
            }
        },
        "Medium": {
            "Sci-Fi": {
                "suppliedText": "A self proclamied exorxist and fraud named Arataka Reigen attempts to exorcize an evil spirit, despite having only stumbled onto it by accident. Much to Reigen's shock, the spirit seems to only be annoyed by his inefecitive attacks, which consist of throwing a handful of table salt at the spirit (actually meant to be purified salt). Reigen then unleashes his secret weapon: calling in an actual pyschic (also referred to as an esper), Shigeo Kageyama (a.k.a. \"Mob\") to banish the spirit for him with his psychokinetic powers. Mob is an extremelly powerful psychic, despite only being in middle school. Some time later, Reigen is contracted to get rid of evil spirits inhabiting a tuneel. Once again, Reigen manages to trick Mob into doing most of the work for him. One of the ghosts, the decreased leader of a biker gang, warns of an even more powerful monster located deeper in the tunnel, and begs Reigen and Mob to not fight it. However, Mob manages to take it down anyway. The spirits of the leader and his gang are finally at peace and move on to the afterlife.",
                "correctText": "A self proclaimed exorcist and fraud named Arataka Reigen attempts to exorcise an evil spirit, despite having only stumbled onto it by accident. Much to Reigen's shock, the spirit seems to only be annoyed by his ineffective attacks, which consist of throwing a handful of table salt at the spirit (actually meant to be purified salt). Reigen then unleashes his secret weapon: calling in an actual psychic (also referred to as an esper), Shigeo Kageyama (a.k.a. \"Mob\") to banish the spirit for him with his psychokinetic powers. Mob is an extremely powerful psychic, despite only being in middle school. Some time later, Reigen is contracted to get rid of evil spirits inhabiting a tunnel. Once again, Reigen manages to trick Mob into doing most of the work for him. One of the ghosts, the deceased leader of a biker gang, warns of an even more powerful monster located deeper in the tunnel, and begs Reigen and Mob to not fight it. However, Mob manages to take it down anyway. The spirits of the leader and his gang are finally at peace and move on to the afterlife.",
                "errorCount": "7"
            },
            "Slice of Life": {
                "suppliedText": "In 1991, Takaki Tono quickly befriends Akari Shinohara after she transfers to his elementary school in Tokyo. They grow very close to each other due to similiar interests and atitudes such as both prefering to stay inside during recess due to their seasonal allergies. As a result, they form a strong bond which is shown when they speak to each other using their given names without any form of honorifics as that is a sign of deep friendship and familiarity in Japan. Right after graduating from elementary school in 1994, Akari moves to the nearby prefecture of Tochigi due to her parents' jobs. The two keep in contact by writing letters but eventually begin to drift apart. When Takaki learns that his family will be moving to Kagoshima on the other side of the country the following year in 1995, he decides to personalley go see Akari one last time since they will be too far apart to see and visit each other once he moves. He also writes a letter for Akari to confess his feelings for her. However, Takaki loses the letter during the journey and a severve snowstorm delays his train for several hours. When the two finally meet late that night and share their first kiss, Takaki realizes they will never be together.",
                "correctText": "In 1991, Takaki Tono quickly befriends Akari Shinohara after she transfers to his elementary school in Tokyo. They grow very close to each other due to similar interests and attitudes such as both preferring to stay inside during recess due to their seasonal allergies. As a result, they form a strong bond which is shown when they speak to each other using their given names without any form of honorifics as that is a sign of deep friendship and familiarity in Japan. Right after graduating from elementary school in 1994, Akari moves to the nearby prefecture of Tochigi due to her parents' jobs. The two keep in contact by writing letters but eventually begin to drift apart. When Takaki learns that his family will be moving to Kagoshima on the other side of the country the following year in 1995, he decides to personally go see Akari one last time since they will be too far apart to see and visit each other once he moves. He also writes a letter for Akari to confess his feelings for her. However, Takaki loses the letter during the journey and a severe snowstorm delays his train for several hours. When the two finally meet late that night and share their first kiss, Takaki realizes they will never be together.",
                "errorCount": "5"
            },
            "Non-Fiction": {
                "suppliedText": "In the second half of the 1800s the United States took over lands that lay far beyend its bordars. In 1867 Russia sold Alaska to the United States for 7.2 million dollars. In 1898 the United States claimed posesion of the Hawaiian Islands in the Pacific Ocean. Alaska and Hawaii would be made states in 1959. In 1898 the United States and Spain went to war because of U.S. support for the independant movement in Cuba, which was then ruled by Spain. At the close of the war the United States gained control over Puerto Rico and the island of Guam. The United States also took posession of the Philipines after paying Spain 20 million dollars. Cuba was granted independence. This conflict, known as the Spanish-American War, began the rise of the United States as a world power.",
                "correctText": "In the second half of the 1800s the United States took over lands that lay far beyond its borders. In 1867 Russia sold Alaska to the United States for 7.2 million dollars. In 1898 the United States claimed possession of the Hawaiian Islands in the Pacific Ocean. Alaska and Hawaii would be made states in 1959. In 1898 the United States and Spain went to war because of U.S. support for the independence movement in Cuba, which was then ruled by Spain. At the close of the war the United States gained control over Puerto Rico and the island of Guam. The United States also took possession of the Philippines after paying Spain 20 million dollars. Cuba was granted independence. This conflict, known as the Spanish-American War, began the rise of the United States as a world power.",
                "errorCount": "6"
            },
            "Romance": {
                "suppliedText": "Before I met you, I didn't think love was for me. It was something other people had and felt. Something in movies and in TV shows. It felt more like a wish I had then something reel. Now that I'm with you, love is so much more tangiblle. It's something I can reach out and touch. It's so much more than a wesh or a hope (though it does give me hope, for so many things), it's the very real, wonderful person I wake up to. The warm hand next to mine, the brush of heir against my cheek. I love you and because of that love, I love so much mre than you. I love myself and the world in a way I never thought possible. You've made that possible for me. You've made evrything possible.",
                "correctText": "Before I met you, I didn't think love was for me. It was something other people had and felt. Something in movies and in TV shows. It felt more like a wish I had then something real. Now that I'm with you, love is so much more tangible. It's something I can reach out and touch. It's so much more than a wish or a hope (though it does give me hope, for so many things), it's the very real, wonderful person I wake up to. The warm hand next to mine, the brush of hair against my cheek. I love you and because of that love, I love so much more than you. I love myself and the world in a way I never thought possible. You've made that possible for me. You've made everything possible.",
                "errorCount": "4"
            },
            "Article": {
                "suppliedText": "Banks are legally mandated to file suspicious-activity reports with the goverment in order to call attention to activity that resembles money laundering, fraud, and other criminal conduct. These reports are routed to a permanent databaise maintained by FINCEN, which can be searched by tens of thousands of law-enforcement and other federal government personnel. The reports are a routine response to any financial activty that appears suspiciuous. They are not proof of criminel activity, and often do not result in criminal charges, though the information in them can be used in law-enforcement proceedings. \"This is a permanent record. They should be there,\" the official, who described an exhaustive search for the reports, said. \"And there is nothing there.\"",
                "correctText": "Banks are legally mandated to file suspicious-activity reports with the government in order to call attention to activity that resembles money laundering, fraud, and other criminal conduct. These reports are routed to a permanent database maintained by FINCEN, which can be searched by tens of thousands of law-enforcement and other federal government personnel. The reports are a routine response to any financial activity that appears suspicious. They are not proof of criminal activity, and often do not result in criminal charges, though the information in them can be used in law-enforcement proceedings. \"This is a permanent record. They should be there,\" the official, who described an exhaustive search for the reports, said. \"And there is nothing there.\"",
                "errorCount": "5"
            },
            "Mystery": {
                "suppliedText": "Greta's partner Joel grew up with five brothers and a sister in a feistty household on an isolated NT property. But he doesn't talk about those days - not the deaths of his sister and mother, nor the origin of the scarrs that snake around his body. Now, many years later, he returns with Greta and their three young boys to prepare the place for sale. The boys are quick to setle in, and Joel seems preocupied with work, but Greta has a growing sense of unease, struggling in the build-up's opprressive heat and living in the shadow of the old, burned-out family home. She knows she's a stranger in this uncany place, with its eerie and alluring landscape, hostile neighbour, and a toxic dam whose clear waters belie its poison. And then there's the mysterious girl living rough whom Greta tries to beffriend. Determined to make sense of it all, Greta is drawn into Joel's unspoken past and confrontted by her own. Before long the curlew's haunting cry will call her to face the secrets she and Joel can no longer outrrun.",
                "correctText": "Greta's partner Joel grew up with five brothers and a sister in a feisty household on an isolated NT property. But he doesn't talk about those days - not the deaths of his sister and mother, nor the origin of the scars that snake around his body. Now, many years later, he returns with Greta and their three young boys to prepare the place for sale. The boys are quick to settle in, and Joel seems preoccupied with work, but Greta has a growing sense of unease, struggling in the build-up's oppressive heat and living in the shadow of the old, burned-out family home. She knows she's a stranger in this uncanny place, with its eerie and alluring landscape, hostile neighbour, and a toxic dam whose clear waters belie its poison. And then there's the mysterious girl living rough whom Greta tries to befriend. Determined to make sense of it all, Greta is drawn into Joel's unspoken past and confronted by her own. Before long the curlew's haunting cry will call her to face the secrets she and Joel can no longer outrun.",
                "errorCount": "9"
            },
            "Comedy": {
                "suppliedText": "I stood there and with all the breath in my furry body, I blew, and blew, and blew. But I could not blow that house down. And as I sat there, on the grass, the dew still fresh from morning, knowing that breakfast, lunch, and dinner was starring out a window from a brick house, mocking me, taunting me, and jering at me, I knew I needed to take a good, hard look at my life and make some changes. That's why I'm here today--not at the end of my journey towards being a better creatture, but somewhere in the middle. I'm asking for forgiveness. For the straw. For the stticks. Not for the brick, because that house was built well and I believe it got sold the folowing year for double what it cost to errect, and so, good on that pig, because he must have gotten the architekture gene his siblings didn't. Me, I'm just going around to differrent wolf packs, talking to the pups about making good decisions. Mostly I just tell them to stick to chickens.",
                "correctText": "I stood there and with all the breath in my furry body, I blew, and blew, and blew. But I could not blow that house down. And as I sat there, on the grass, the dew still fresh from morning, knowing that breakfast, lunch, and dinner was staring out a window from a brick house, mocking me, taunting me, and jeering at me, I knew I needed to take a good, hard look at my life and make some changes. That's why I'm here today--not at the end of my journey towards being a better creature, but somewhere in the middle. I'm asking for forgiveness. For the straw. For the sticks. Not for the brick, because that house was built well and I believe it got sold the following year for double what it cost to erect, and so, good on that pig, because he must have gotten the architecture gene his siblings didn't. Me, I'm just going around to different wolf packs, talking to the pups about making good decisions. Mostly I just tell them to stick to chickens.",
                "errorCount": "8"
            },
            "Wikipedia": {
                "suppliedText": "The earliest roots of science can be traced to Ancient Egypt and Mesopotomia in around 3000 to 1200 BCE. Their contributiuns to mathematics, astronomy and medicine entered and shaped Greek natural philosophy of classical antiquty, whereby formal attempts were made to provide explanatiuns of events in the physical world based on natural causes. After the fall of the Western Roman Empire, knowledge of Greek conceptions of the world deterioratted in Western Europe during the early centuries (400 to 1000 CE) of the Middle Ages, but was preserved in the Muslim world during the Islamic Golden Age. The recovery and asimilation of Greek works and Islamic inquiries into Western Europe from the 10th to 13th century revived \"natural philosophe\", which was later transformed by the Scientific Revolution that began in the 16th century as new ideas and discoveries departed from previous Greek conceptions and tradisions. The scientific method soon played a greater role in knowlege creation and it was not until the 19th century that many of the institutional and professional features of science began to take shape; along with the changing of \"natural philosophy\" to \"natural science.\"",
                "correctText": "The earliest roots of science can be traced to Ancient Egypt and Mesopotomia in around 3000 to 1200 BCE. Their contributions to mathematics, astronomy and medicine entered and shaped Greek natural philosophy of classical antiquity, whereby formal attempts were made to provide explanations of events in the physical world based on natural causes. After the fall of the Western Roman Empire, knowledge of Greek conceptions of the world deteriorated in Western Europe during the early centuries (400 to 1000 CE) of the Middle Ages, but was preserved in the Muslim world during the Islamic Golden Age. The recovery and assimilation of Greek works and Islamic inquiries into Western Europe from the 10th to 13th century revived \"natural philosophy\", which was later transformed by the Scientific Revolution that began in the 16th century as new ideas and discoveries departed from previous Greek conceptions and traditions. The scientific method soon played a greater role in knowledge creation and it was not until the 19th century that many of the institutional and professional features of science began to take shape; along with the changing of \"natural philosophy\" to \"natural science.\"",
                "errorCount": "8"
            }
        },
        "Hard": {
            "Sci-Fi": {
                "suppliedText": "The naraator, a pilot, crash-lands his plane in the Sahara desert. While he tries to repair his engine and monitor his dweedling supply of water and food, a little boy appears out of nowhere and simply asks him to draw a sheep. The author then learns that this \"little prince\" comes from the far away Asteroid B-612, where he left a rose and three volcaneos. The prince's most prized poseeshon was the rose, but her tempesteous mien and fickleness tired him and he decided to leave his tiny planet. To his surprise, the flower was visibly sad to see him go, but she urged him on nonetheless. Before arriving on Earth, the prince visited other planets and met with strange individuals: a king, a vain man, a drunyard, a lamplighter, and a geographer. At the geographer's sugesstion, he visited Earth but dropped down into the Sahara Desert. He found no friends there, but a snake told him that if he ever needed to return to his home planet, he could take advantage of the snake's bite. He met a fox that taught him to realize that to know others we must \"tame\" them; this is what makes things and people unique. \"The esenntial is invisible to the eye,\" says the fox.",
                "correctText": "The narrator, a pilot, crash-lands his plane in the Sahara desert. While he tries to repair his engine and monitor his dwindling supply of water and food, a little boy appears out of nowhere and simply asks him to draw a sheep. The author then learns that this \"little prince\" comes from the far away Asteroid B-612, where he left a rose and three volcanoes. The prince's most prized possession was the rose, but her tempestuous mien and fickleness tired him and he decided to leave his tiny planet. To his surprise, the flower was visibly sad to see him go, but she urged him on nonetheless. Before arriving on Earth, the prince visited other planets and met with strange individuals: a king, a vain man, a drunkard, a lamplighter, and a geographer. At the geographer's suggestion, he visited Earth but dropped down into the Sahara Desert. He found no friends there, but a snake told him that if he ever needed to return to his home planet, he could take advantage of the snake's bite. He met a fox that taught him to realize that to know others we must \"tame\" them; this is what makes things and people unique. \"The essential is invisible to the eye,\" says the fox.",
                "errorCount": "7"
            },
            "Slice of Life": {
                "suppliedText": "During Body Improvement Club practice, Mob faints and is left in the clubroom to recover. The Telepathy Club, permmitted to stay in the room which is now being used to store bodybuilding equipement, comments that Mob will never be popular even if he trains his body. Distrauhgt, he is intercepted on his way home by a woman in a smiling mask, who informs him that she can help him become popular. He follows her to an underground meeting area where a cult known as (LOL) has formed in service to a man with the power to make anyone laugh and smile. A reporter from Mob's school, Mezato Ichi, is forceibly converted, but even the cult leader Dimple is unable to convert Mob. It is revealed that Dimple is a high level spirit posessing a man, and the spirit emerges to kill Mob. The strain causes Mob to reach 100% and \"explode\", unleashing a terrible amount of psychic power and exorcising Dimple. This frees the converts of the cult.",
                "correctText": "During Body Improvement Club practice, Mob faints and is left in the clubroom to recover. The Telepathy Club, permitted to stay in the room which is now being used to store bodybuilding equipment, comments that Mob will never be popular even if he trains his body. Distraught, he is intercepted on his way home by a woman in a smiling mask, who informs him that she can help him become popular. He follows her to an underground meeting area where a cult known as (LOL) has formed in service to a man with the power to make anyone laugh and smile. A reporter from Mob's school, Mezato Ichi, is forcibly converted, but even the cult leader Dimple is unable to convert Mob. It is revealed that Dimple is a high level spirit possessing a man, and the spirit emerges to kill Mob. The strain causes Mob to reach 100% and \"explode\", unleashing a terrible amount of psychic power and exorcising Dimple. This frees the converts of the cult.",
                "errorCount": "4"
            },
            "Non-Fiction": {
                "suppliedText": "Thailand,  country located in the center of mainland Southeast Asia. Located wholy within the tropics, Thailand encompases diverse ecosystems, including the hilley forested areas of the northern fronter, the fertile rice fields of the central plains, the broad plataau of the northeast, and the rugged coasts along the narrow southern peninsula. Until the second half of the 20th century, Thailand was primarily an agriculturel country, but since the 1960s increasing numbers of people have moved to Bangkok, the capital, and to other cities. Siam, as Thailand was officially called until 1939, was never brought under European colonial domination. Independant Siam was ruled by an absolate monarchy until a revolution there in 1932. Since that time, Thailand has been a constitutional monarchy, and all subsequent constututions have provided for an elected parliament. Political authority, however, has often been held by the military, which has taken power through coups.",
                "correctText": "Thailand,  country located in the centre of mainland Southeast Asia. Located wholly within the tropics, Thailand encompasses diverse ecosystems, including the hilly forested areas of the northern frontier, the fertile rice fields of the central plains, the broad plateau of the northeast, and the rugged coasts along the narrow southern peninsula. Until the second half of the 20th century, Thailand was primarily an agricultural country, but since the 1960s increasing numbers of people have moved to Bangkok, the capital, and to other cities. Siam, as Thailand was officially called until 1939, was never brought under European colonial domination. Independent Siam was ruled by an absolute monarchy until a revolution there in 1932. Since that time, Thailand has been a constitutional monarchy, and all subsequent constitutions have provided for an elected parliament. Political authority, however, has often been held by the military, which has taken power through coups.",
                "errorCount": "6"
            },
            "Romance": {
                "suppliedText": "Love is the first emotion that human beings ever encounter. As a fetus in the wom a child can become emotionally attached to the sound of their parent's voice, loving them before they even know they. The same goes for parents, the minute a women finds out she is with child an instant bond and love is formed. It is an emotion that we are genetically programed to experiense yet many people spend a majority of their life trying to understand the complixity of it. Every day people will talk about things they love such as their pet, phone, siblins, or some other aspect of their life. However, one of the hardest things for some people to find is a significant other that they can share the real bond of love with and while the whole world is in saerch of this idea of \"true love\", few find it because few understand it.",
                "correctText": "Love is the first emotion that human beings ever encounter. As a fetus in the womb a child can become emotionally attached to the sound of their parent's voice, loving them before they even know them. The same goes for parents, the minute a woman finds out she is with child an instant bond and love is formed. It is an emotion that we are genetically programmed to experience yet many people spend a majority of their life trying to understand the complexity of it. Every day people will talk about things they love such as their pet, phone, siblings, or some other aspect of their life. However, one of the hardest things for some people to find is a significant other that they can share the real bond of love with and while the whole world is in search of this idea of \"true love\", few find it because few understand it.",
                "errorCount": "8"
            },
            "Article": {
                "suppliedText": "A cursory glance over other reviews shows that the word cynical crops up often. Personally I would not describe Syme as cynical in any way, indeed at several points he is in need of a generuous transfuision of cynicism from a donor synic. The issue is that he isn't idealistic or inclined to acsept the propaganda or marketing at face value. For Syme politics is about power, I don't know if he read Weber, but the bibligraphy is fairly evenly divided between English, French and German language scholarship, he might have picked up that idea of power exercised through oligarchyes at second hand. Syme's views are stark, but not cynical, indeed he is fanciful in places. One example I'll return to below, another is he rejurgitates that the 'mob' 'spontaneously' cremated Julius Caesar's body and erected an altar in his memory which is just crazy fantasy. For things like that to happen , particularly with the appearance of spontanity, takes organisation.",
                "correctText": "A cursory glance over other reviews shows that the word cynical crops up often. Personally I would not describe Syme as cynical in any way, indeed at several points he is in need of a generous transfusion of cynicism from a donor cynic. The issue is that he isn't idealistic or inclined to accept the propaganda or marketing at face value. For Syme politics is about power, I don't know if he read Weber, but the bibliography is fairly evenly divided between English, French and German language scholarship, he might have picked up that idea of power exercised through oligarchies at second hand. Syme's views are stark, but not cynical, indeed he is fanciful in places. One example I'll return to below, another is he regurgitates that the 'mob' 'spontaneously' cremated Julius Caesar's body and erected an altar in his memory which is just crazy fantasy. For things like that to happen , particularly with the appearance of spontaneity, takes organisation.",
                "errorCount": "8"
            },
            "Mystery": {
                "suppliedText": "Josh Whitham, glazed, corners of his waterloged coat stained with sticky dust, collar turned inside out and hair unkemp, stared at the rusting, swollen, quivering, nervous, bewilderred thing sitting in the west corner of the warehouse. The thing that once symbolised fineness and the last glow of youth twenty years ago was now as hoarry and old as himself. Most of all, he didn't know if he had the courage to plung into its icy jaws again, now he was going to do this alone. He wondered whether it would be an exit to liberasion or a coffin to absolute death, or both. It was the last thing Elspeth had ever left him, hours before he signed the contract for her euthanasia. Gastric cancer made her no longer who she was. Infinite pain cloudded her vision. Every time she tried to turn to the man she had always cared about, chains closed around her head, as his outline disolved into thousands of grainny, prickly squares. All she saw, everything she deppicted in her brain was but the profile of a monstar. So she left Josh this with her reasons, and what he would need the most, right now.",
                "correctText": "Josh Whitham, glazed, corners of his waterlogged coat stained with sticky dust, collar turned inside out and hair unkempt, stared at the rusting, swollen, quivering, nervous, bewildered thing sitting in the west corner of the warehouse. The thing that once symbolised fineness and the last glow of youth twenty years ago was now as hoary and old as himself. Most of all, he didn't know if he had the courage to plunge into its icy jaws again, now he was going to do this alone. He wondered whether it would be an exit to liberation or a coffin to absolute death, or both. It was the last thing Elspeth had ever left him, hours before he signed the contract for her euthanasia. Gastric cancer made her no longer who she was. Infinite pain clouded her vision. Every time she tried to turn to the man she had always cared about, chains closed around her head, as his outline dissolved into thousands of grainy, prickly squares. All she saw, everything she depicted in her brain was but the profile of a monster. So she left Josh this with her reasons, and what he would need the most, right now.",
                "errorCount": "11"
            },
            "Comedy": {
                "suppliedText": "\"I suspect that beneath your offensively and vulgarly efeminate facade there mae be a soul of sorts. Have you read widely in Boethius?\" \"Who? Oh, heavens no. I never even read newspapers.\" \"Then you must begin a reading program imediately so that you may understand the crises of our age,\" Ignatius said solemnly. \"Begin with the late Romans, including Boethius, of course. Then you should dip rather extenssively into early Medieval. You may skip the Renaissance and the Enlightenment. That is mostly dangerous propagandda. Now that I think of it, you had better skip the Romantics and the Victorians, too. For the contemporrary period, you should study some selekted comic books. I recommend Batman especially, for he tends to transcend the abismal society in which he's found himself. His morality is rathar rigid, also. I rather respect Batman.\"",
                "correctText": "\"I suspect that beneath your offensively and vulgarly effeminate facade there may be a soul of sorts. Have you read widely in Boethius?\" \"Who? Oh, heavens no. I never even read newspapers.\" \"Then you must begin a reading program immediately so that you may understand the crises of our age,\" Ignatius said solemnly. \"Begin with the late Romans, including Boethius, of course. Then you should dip rather extensively into early Medieval. You may skip the Renaissance and the Enlightenment. That is mostly dangerous propaganda. Now that I think of it, you had better skip the Romantics and the Victorians, too. For the contemporary period, you should study some selected comic books. I recommend Batman especially, for he tends to transcend the abysmal society in which he's found himself. His morality is rather rigid, also. I rather respect Batman.\"",
                "errorCount": "9"
            },
            "Wikipedia": {
                "suppliedText": "Electronics uses active devices to control electron flow by ampliffication and rectification, which distinguishes it from classical electrical enginering, which only uses passive effects such as resistance, capacitanse and inductance to control electric current flow. An electronic component is any physical entity in an electronic system used to affect the electrons or their asociated fields in a manner consistent with the intended function of the electronic system. Components are generally intended to be connected together, usually by being solderred to a printed circuit board(PCB), to create an electronic circuit with a particular function (for example an amplifier and radio receiver). Components may be packaged singlly, or in more complex groups as integrated circuits. Some common electronic components are capacitors, inductors, resistors, transistors, etc. Components are often categorissed as active (e.g. transistors) or passive (e.g. resistors and inductors).",
                "correctText": "Electronics uses active devices to control electron flow by amplification and rectification, which distinguishes it from classical electrical engineering, which only uses passive effects such as resistance, capacitance and inductance to control electric current flow. An electronic component is any physical entity in an electronic system used to affect the electrons or their associated fields in a manner consistent with the intended function of the electronic system. Components are generally intended to be connected together, usually by being soldered to a printed circuit board(PCB), to create an electronic circuit with a particular function (for example an amplifier and radio receiver). Components may be packaged singly, or in more complex groups as integrated circuits. Some common electronic components are capacitors, inductors, resistors, transistors, etc. Components are often categorised as active (e.g. transistors) or passive (e.g. resistors and inductors).",
                "errorCount": "7"
            }
        }
    }
)

let DailyString = JSON.stringify({
    "Daily Challenge": {
        suppliedText:
            '"The boy with fair hair lowerred himself down the last few feet of rock and began to pick his way toward the lagoun. Though he had taken off his school sweater and trailled it now from one hand, his grey shirt stuk to him and his hair was plasterred to his forehead. All round him the long scar smashed into the jungle was a bath of heat. He was clamberring heavily among the crepers and broken trunks when a bird, a vision of red and yellow, flashed upards with a witch-like cry; and this cry was echod by another. "Hi!" it said. "Wait a minute!" The undergrowth at the side of the scar was shaken and a multitute of raindrops fell pattering. "Wait a minute," the voice said. "I got caught up." The fair boy stopped and jerkked his stockings with an automatic gesture that made the jungle seem for a moment like the Home Counties."',
        correctText:
            '"The boy with fair hair lowered himself down the last few feet of rock and began to pick his way toward the lagoon. Though he had taken off his school sweater and trailed it now from one hand, his grey shirt stuck to him and his hair was plastered to his forehead. All round him the long scar smashed into the jungle was a bath of heat. He was clambering heavily among the creepers and broken trunks when a bird, a vision of red and yellow, flashed upwards with a witch-like cry; and this cry was echoed by another. "Hi!" it said. "Wait a minute!" The undergrowth at the side of the scar was shaken and a multitude of raindrops fell pattering. "Wait a minute," the voice said. "I got caught up." The fair boy stopped and jerked his stockings with an automatic gesture that made the jungle seem for a moment like the Home Counties."',
        errorCount: "11",
    }
});

/**
* @function loadDaily displays today's text
*/
function loadDaily() {
    const today = new Date();
    //One day (24 hours) is 86,400,000 milliseconds
    const daysPassed = Math.floor(today.getTime() / 86400000);
    // if a user sets their local machine date to before January 1, 1970 -> negative days since starting date -> negative array index (remainder) -> undefined
    // modulus formula [ ((a % n ) + n ) % n ] to account for negative values
    const textBank = JSON.parse(DailyString);
    const keys = Object.keys(textBank);
    const length = keys.length;
    const key = keys[((daysPassed % length) + length) % length];
    suppliedText = textBank[key]["suppliedText"];
    correctText = textBank[key]["correctText"];
    // testing only for daily for a comparator
    currentSuppliedTextDuplicate = suppliedText
    // console.log(currentSuppliedTextDuplicate);
}

let correctText;
let suppliedText;
let currentSuppliedTextDuplicate;
function loadText() {
    // if genre not selected, show daily
    if (typeof genre == "undefined") {
        loadDaily();
    } else {
        const textBank = JSON.parse(JSONString);
        suppliedText = textBank[difficulty][genre]["suppliedText"];
        correctText = textBank[difficulty][genre]["correctText"];
    }
    const passageSurr = separateWords();
    document.getElementById("gameText").innerHTML = passageSurr;
    document.getElementById("gameHidden").innerHTML = passageSurr;
    //to work for any supplied text
    currentSuppliedTextDuplicate = suppliedText
}

// to add divs between each word
function separateWords() {
    const passageArr = suppliedText.split(" ");
    let wordArr = [];
    for (let i = 0; i < passageArr.length; i++) {
        wordElement = "<word>" + passageArr[i] + "</word>";
        wordArr.push(wordElement);
    }
    return wordArr.join(" ");
}





/**
 * Diff Match and Patch
 * Copyright 2018 The diff-match-patch Authors.
 * https://github.com/google/diff-match-patch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Computes the difference between two texts to create a patch.
 * Applies the patch onto another text, allowing for errors.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class containing the diff, match and patch methods.
 * @constructor
 */
var diff_match_patch = function () {

    // Defaults.
    // Redefine these in your program to override the defaults.

    // Number of seconds to map a diff before giving up (0 for infinity).
    this.Diff_Timeout = 1.0;
    // Cost of an empty edit operation in terms of edit characters.
    this.Diff_EditCost = 4;
    // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
    this.Match_Threshold = 0.5;
    // How far to search for a match (0 = exact location, 1000+ = broad match).
    // A match this many characters away from the expected location will add
    // 1.0 to the score (0.0 is a perfect match).
    this.Match_Distance = 1000;
    // When deleting a large block of text (over ~64 characters), how close do
    // the contents have to be to match the expected contents. (0.0 = perfection,
    // 1.0 = very loose).  Note that Match_Threshold controls how closely the
    // end points of a delete need to match.
    this.Patch_DeleteThreshold = 0.5;
    // Chunk size for context length.
    this.Patch_Margin = 4;

    // The number of bits in an int.
    this.Match_MaxBits = 32;
};


//  DIFF FUNCTIONS


/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;

/**
 * Class representing one diff tuple.
 * Attempts to look like a two-element array (which is what this used to be).
 * @param {number} op Operation, one of: DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL.
 * @param {string} text Text to be deleted, inserted, or retained.
 * @constructor
 */
diff_match_patch.Diff = function (op, text) {
    this[0] = op;
    this[1] = text;
};

diff_match_patch.Diff.prototype.length = 2;

/**
 * Emulate the output of a two-element array.
 * @return {string} Diff operation as a string.
 */
diff_match_patch.Diff.prototype.toString = function () {
    return this[0] + ',' + this[1];
};


/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean=} opt_checklines Optional speedup flag. If present and false,
 *     then don't run a line-level diff first to identify the changed areas.
 *     Defaults to true, which does a faster, slightly less optimal diff.
 * @param {number=} opt_deadline Optional time when the diff should be complete
 *     by.  Used internally for recursive calls.  Users should set DiffTimeout
 *     instead.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 */
diff_match_patch.prototype.diff_main = function (text1, text2, opt_checklines,
    opt_deadline) {
    // Set a deadline by which time the diff must be complete.
    if (typeof opt_deadline == 'undefined') {
        if (this.Diff_Timeout <= 0) {
            opt_deadline = Number.MAX_VALUE;
        } else {
            opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
        }
    }
    var deadline = opt_deadline;

    // Check for null inputs.
    if (text1 == null || text2 == null) {
        throw new Error('Null input. (diff_main)');
    }

    // Check for equality (speedup).
    if (text1 == text2) {
        if (text1) {
            return [new diff_match_patch.Diff(DIFF_EQUAL, text1)];
        }
        return [];
    }

    if (typeof opt_checklines == 'undefined') {
        opt_checklines = true;
    }
    var checklines = opt_checklines;

    // Trim off common prefix (speedup).
    var commonlength = this.diff_commonPrefix(text1, text2);
    var commonprefix = text1.substring(0, commonlength);
    text1 = text1.substring(commonlength);
    text2 = text2.substring(commonlength);

    // Trim off common suffix (speedup).
    commonlength = this.diff_commonSuffix(text1, text2);
    var commonsuffix = text1.substring(text1.length - commonlength);
    text1 = text1.substring(0, text1.length - commonlength);
    text2 = text2.substring(0, text2.length - commonlength);

    // Compute the diff on the middle block.
    var diffs = this.diff_compute_(text1, text2, checklines, deadline);

    // Restore the prefix and suffix.
    if (commonprefix) {
        diffs.unshift(new diff_match_patch.Diff(DIFF_EQUAL, commonprefix));
    }
    if (commonsuffix) {
        diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, commonsuffix));
    }
    this.diff_cleanupMerge(diffs);
    return diffs;
};


/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean} checklines Speedup flag.  If false, then don't run a
 *     line-level diff first to identify the changed areas.
 *     If true, then run a faster, slightly less optimal diff.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_compute_ = function (text1, text2, checklines,
    deadline) {
    var diffs;

    if (!text1) {
        // Just add some text (speedup).
        return [new diff_match_patch.Diff(DIFF_INSERT, text2)];
    }

    if (!text2) {
        // Just delete some text (speedup).
        return [new diff_match_patch.Diff(DIFF_DELETE, text1)];
    }

    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    var i = longtext.indexOf(shorttext);
    if (i != -1) {
        // Shorter text is inside the longer text (speedup).
        diffs = [new diff_match_patch.Diff(DIFF_INSERT, longtext.substring(0, i)),
        new diff_match_patch.Diff(DIFF_EQUAL, shorttext),
        new diff_match_patch.Diff(DIFF_INSERT,
            longtext.substring(i + shorttext.length))];
        // Swap insertions for deletions if diff is reversed.
        if (text1.length > text2.length) {
            diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }
        return diffs;
    }

    if (shorttext.length == 1) {
        // Single character string.
        // After the previous speedup, the character can't be an equality.
        return [new diff_match_patch.Diff(DIFF_DELETE, text1),
        new diff_match_patch.Diff(DIFF_INSERT, text2)];
    }

    // Check to see if the problem can be split in two.
    var hm = this.diff_halfMatch_(text1, text2);
    if (hm) {
        // A half-match was found, sort out the return data.
        var text1_a = hm[0];
        var text1_b = hm[1];
        var text2_a = hm[2];
        var text2_b = hm[3];
        var mid_common = hm[4];
        // Send both pairs off for separate processing.
        var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
        var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
        // Merge the results.
        return diffs_a.concat([new diff_match_patch.Diff(DIFF_EQUAL, mid_common)],
            diffs_b);
    }

    if (checklines && text1.length > 100 && text2.length > 100) {
        return this.diff_lineMode_(text1, text2, deadline);
    }

    return this.diff_bisect_(text1, text2, deadline);
};


/**
 * Do a quick line-level diff on both strings, then rediff the parts for
 * greater accuracy.
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_lineMode_ = function (text1, text2, deadline) {
    // Scan the text on a line-by-line basis first.
    var a = this.diff_linesToChars_(text1, text2);
    text1 = a.chars1;
    text2 = a.chars2;
    var linearray = a.lineArray;

    var diffs = this.diff_main(text1, text2, false, deadline);

    // Convert the diff back to original text.
    this.diff_charsToLines_(diffs, linearray);
    // Eliminate freak matches (e.g. blank lines)
    this.diff_cleanupSemantic(diffs);

    // Rediff any replacement blocks, this time character-by-character.
    // Add a dummy entry at the end.
    diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, ''));
    var pointer = 0;
    var count_delete = 0;
    var count_insert = 0;
    var text_delete = '';
    var text_insert = '';
    while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
            case DIFF_INSERT:
                count_insert++;
                text_insert += diffs[pointer][1];
                break;
            case DIFF_DELETE:
                count_delete++;
                text_delete += diffs[pointer][1];
                break;
            case DIFF_EQUAL:
                // Upon reaching an equality, check for prior redundancies.
                if (count_delete >= 1 && count_insert >= 1) {
                    // Delete the offending records and add the merged ones.
                    diffs.splice(pointer - count_delete - count_insert,
                        count_delete + count_insert);
                    pointer = pointer - count_delete - count_insert;
                    var subDiff =
                        this.diff_main(text_delete, text_insert, false, deadline);
                    for (var j = subDiff.length - 1; j >= 0; j--) {
                        diffs.splice(pointer, 0, subDiff[j]);
                    }
                    pointer = pointer + subDiff.length;
                }
                count_insert = 0;
                count_delete = 0;
                text_delete = '';
                text_insert = '';
                break;
        }
        pointer++;
    }
    diffs.pop();  // Remove the dummy entry at the end.

    return diffs;
};


/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisect_ = function (text1, text2, deadline) {
    // Cache the text lengths to prevent multiple calls.
    var text1_length = text1.length;
    var text2_length = text2.length;
    var max_d = Math.ceil((text1_length + text2_length) / 2);
    var v_offset = max_d;
    var v_length = 2 * max_d;
    var v1 = new Array(v_length);
    var v2 = new Array(v_length);
    // Setting all elements to -1 is faster in Chrome & Firefox than mixing
    // integers and undefined.
    for (var x = 0; x < v_length; x++) {
        v1[x] = -1;
        v2[x] = -1;
    }
    v1[v_offset + 1] = 0;
    v2[v_offset + 1] = 0;
    var delta = text1_length - text2_length;
    // If the total number of characters is odd, then the front path will collide
    // with the reverse path.
    var front = (delta % 2 != 0);
    // Offsets for start and end of k loop.
    // Prevents mapping of space beyond the grid.
    var k1start = 0;
    var k1end = 0;
    var k2start = 0;
    var k2end = 0;
    for (var d = 0; d < max_d; d++) {
        // Bail out if deadline is reached.
        if ((new Date()).getTime() > deadline) {
            break;
        }

        // Walk the front path one step.
        for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
            var k1_offset = v_offset + k1;
            var x1;
            if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
                x1 = v1[k1_offset + 1];
            } else {
                x1 = v1[k1_offset - 1] + 1;
            }
            var y1 = x1 - k1;
            while (x1 < text1_length && y1 < text2_length &&
                text1.charAt(x1) == text2.charAt(y1)) {
                x1++;
                y1++;
            }
            v1[k1_offset] = x1;
            if (x1 > text1_length) {
                // Ran off the right of the graph.
                k1end += 2;
            } else if (y1 > text2_length) {
                // Ran off the bottom of the graph.
                k1start += 2;
            } else if (front) {
                var k2_offset = v_offset + delta - k1;
                if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
                    // Mirror x2 onto top-left coordinate system.
                    var x2 = text1_length - v2[k2_offset];
                    if (x1 >= x2) {
                        // Overlap detected.
                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                    }
                }
            }
        }

        // Walk the reverse path one step.
        for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
            var k2_offset = v_offset + k2;
            var x2;
            if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
                x2 = v2[k2_offset + 1];
            } else {
                x2 = v2[k2_offset - 1] + 1;
            }
            var y2 = x2 - k2;
            while (x2 < text1_length && y2 < text2_length &&
                text1.charAt(text1_length - x2 - 1) ==
                text2.charAt(text2_length - y2 - 1)) {
                x2++;
                y2++;
            }
            v2[k2_offset] = x2;
            if (x2 > text1_length) {
                // Ran off the left of the graph.
                k2end += 2;
            } else if (y2 > text2_length) {
                // Ran off the top of the graph.
                k2start += 2;
            } else if (!front) {
                var k1_offset = v_offset + delta - k2;
                if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
                    var x1 = v1[k1_offset];
                    var y1 = v_offset + x1 - k1_offset;
                    // Mirror x2 onto top-left coordinate system.
                    x2 = text1_length - x2;
                    if (x1 >= x2) {
                        // Overlap detected.
                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                    }
                }
            }
        }
    }
    // Diff took too long and hit the deadline or
    // number of diffs equals number of characters, no commonality at all.
    return [new diff_match_patch.Diff(DIFF_DELETE, text1),
    new diff_match_patch.Diff(DIFF_INSERT, text2)];
};


/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisectSplit_ = function (text1, text2, x, y,
    deadline) {
    var text1a = text1.substring(0, x);
    var text2a = text2.substring(0, y);
    var text1b = text1.substring(x);
    var text2b = text2.substring(y);

    // Compute both diffs serially.
    var diffs = this.diff_main(text1a, text2a, false, deadline);
    var diffsb = this.diff_main(text1b, text2b, false, deadline);

    return diffs.concat(diffsb);
};


/**
 * Split two texts into an array of strings.  Reduce the texts to a string of
 * hashes where each Unicode character represents one line.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
 *     An object containing the encoded text1, the encoded text2 and
 *     the array of unique strings.
 *     The zeroth element of the array of unique strings is intentionally blank.
 * @private
 */
diff_match_patch.prototype.diff_linesToChars_ = function (text1, text2) {
    var lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
    var lineHash = {};   // e.g. lineHash['Hello\n'] == 4

    // '\x00' is a valid character, but various debuggers don't like it.
    // So we'll insert a junk entry to avoid generating a null character.
    lineArray[0] = '';

    /**
     * Split a text into an array of strings.  Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     * Modifies linearray and linehash through being a closure.
     * @param {string} text String to encode.
     * @return {string} Encoded string.
     * @private
     */
    function diff_linesToCharsMunge_(text) {
        var chars = '';
        // Walk the text, pulling out a substring for each line.
        // text.split('\n') would would temporarily double our memory footprint.
        // Modifying text would create many large strings to garbage collect.
        var lineStart = 0;
        var lineEnd = -1;
        // Keeping our own length variable is faster than looking it up.
        var lineArrayLength = lineArray.length;
        while (lineEnd < text.length - 1) {
            lineEnd = text.indexOf('\n', lineStart);
            if (lineEnd == -1) {
                lineEnd = text.length - 1;
            }
            var line = text.substring(lineStart, lineEnd + 1);

            if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
                (lineHash[line] !== undefined)) {
                chars += String.fromCharCode(lineHash[line]);
            } else {
                if (lineArrayLength == maxLines) {
                    // Bail out at 65535 because
                    // String.fromCharCode(65536) == String.fromCharCode(0)
                    line = text.substring(lineStart);
                    lineEnd = text.length;
                }
                chars += String.fromCharCode(lineArrayLength);
                lineHash[line] = lineArrayLength;
                lineArray[lineArrayLength++] = line;
            }
            lineStart = lineEnd + 1;
        }
        return chars;
    }
    // Allocate 2/3rds of the space for text1, the rest for text2.
    var maxLines = 40000;
    var chars1 = diff_linesToCharsMunge_(text1);
    maxLines = 65535;
    var chars2 = diff_linesToCharsMunge_(text2);
    return { chars1: chars1, chars2: chars2, lineArray: lineArray };
};


/**
 * Rehydrate the text in a diff from a string of line hashes to real lines of
 * text.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {!Array.<string>} lineArray Array of unique strings.
 * @private
 */
diff_match_patch.prototype.diff_charsToLines_ = function (diffs, lineArray) {
    for (var i = 0; i < diffs.length; i++) {
        var chars = diffs[i][1];
        var text = [];
        for (var j = 0; j < chars.length; j++) {
            text[j] = lineArray[chars.charCodeAt(j)];
        }
        diffs[i][1] = text.join('');
    }
};


/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
diff_match_patch.prototype.diff_commonPrefix = function (text1, text2) {
    // Quick check for common null cases.
    if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
        return 0;
    }
    // Binary search.
    // Performance analysis: https://neil.fraser.name/news/2007/10/09/
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerstart = 0;
    while (pointermin < pointermid) {
        if (text1.substring(pointerstart, pointermid) ==
            text2.substring(pointerstart, pointermid)) {
            pointermin = pointermid;
            pointerstart = pointermin;
        } else {
            pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
};


/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
diff_match_patch.prototype.diff_commonSuffix = function (text1, text2) {
    // Quick check for common null cases.
    if (!text1 || !text2 ||
        text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
        return 0;
    }
    // Binary search.
    // Performance analysis: https://neil.fraser.name/news/2007/10/09/
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerend = 0;
    while (pointermin < pointermid) {
        if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
            text2.substring(text2.length - pointermid, text2.length - pointerend)) {
            pointermin = pointermid;
            pointerend = pointermin;
        } else {
            pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
};


/**
 * Determine if the suffix of one string is the prefix of another.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of the first
 *     string and the start of the second string.
 * @private
 */
diff_match_patch.prototype.diff_commonOverlap_ = function (text1, text2) {
    // Cache the text lengths to prevent multiple calls.
    var text1_length = text1.length;
    var text2_length = text2.length;
    // Eliminate the null case.
    if (text1_length == 0 || text2_length == 0) {
        return 0;
    }
    // Truncate the longer string.
    if (text1_length > text2_length) {
        text1 = text1.substring(text1_length - text2_length);
    } else if (text1_length < text2_length) {
        text2 = text2.substring(0, text1_length);
    }
    var text_length = Math.min(text1_length, text2_length);
    // Quick check for the worst case.
    if (text1 == text2) {
        return text_length;
    }

    // Start by looking for a single character match
    // and increase length until no match is found.
    // Performance analysis: https://neil.fraser.name/news/2010/11/04/
    var best = 0;
    var length = 1;
    while (true) {
        var pattern = text1.substring(text_length - length);
        var found = text2.indexOf(pattern);
        if (found == -1) {
            return best;
        }
        length += found;
        if (found == 0 || text1.substring(text_length - length) ==
            text2.substring(0, length)) {
            best = length;
            length++;
        }
    }
};


/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 * @private
 */
diff_match_patch.prototype.diff_halfMatch_ = function (text1, text2) {
    if (this.Diff_Timeout <= 0) {
        // Don't risk returning a non-optimal diff if we have unlimited time.
        return null;
    }
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null;  // Pointless.
    }
    var dmp = this;  // 'this' becomes 'window' in a closure.

    /**
     * Does a substring of shorttext exist within longtext such that the substring
     * is at least half the length of longtext?
     * Closure, but does not reference any external variables.
     * @param {string} longtext Longer string.
     * @param {string} shorttext Shorter string.
     * @param {number} i Start index of quarter length substring within longtext.
     * @return {Array.<string>} Five element Array, containing the prefix of
     *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
     *     of shorttext and the common middle.  Or null if there was no match.
     * @private
     */
    function diff_halfMatchI_(longtext, shorttext, i) {
        // Start with a 1/4 length substring at position i as a seed.
        var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
        var j = -1;
        var best_common = '';
        var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
        while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
            var prefixLength = dmp.diff_commonPrefix(longtext.substring(i),
                shorttext.substring(j));
            var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i),
                shorttext.substring(0, j));
            if (best_common.length < suffixLength + prefixLength) {
                best_common = shorttext.substring(j - suffixLength, j) +
                    shorttext.substring(j, j + prefixLength);
                best_longtext_a = longtext.substring(0, i - suffixLength);
                best_longtext_b = longtext.substring(i + prefixLength);
                best_shorttext_a = shorttext.substring(0, j - suffixLength);
                best_shorttext_b = shorttext.substring(j + prefixLength);
            }
        }
        if (best_common.length * 2 >= longtext.length) {
            return [best_longtext_a, best_longtext_b,
                best_shorttext_a, best_shorttext_b, best_common];
        } else {
            return null;
        }
    }

    // First check if the second quarter is the seed for a half-match.
    var hm1 = diff_halfMatchI_(longtext, shorttext,
        Math.ceil(longtext.length / 4));
    // Check again based on the third quarter.
    var hm2 = diff_halfMatchI_(longtext, shorttext,
        Math.ceil(longtext.length / 2));
    var hm;
    if (!hm1 && !hm2) {
        return null;
    } else if (!hm2) {
        hm = hm1;
    } else if (!hm1) {
        hm = hm2;
    } else {
        // Both matched.  Select the longest.
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
    }

    // A half-match was found, sort out the return data.
    var text1_a, text1_b, text2_a, text2_b;
    if (text1.length > text2.length) {
        text1_a = hm[0];
        text1_b = hm[1];
        text2_a = hm[2];
        text2_b = hm[3];
    } else {
        text2_a = hm[0];
        text2_b = hm[1];
        text1_a = hm[2];
        text1_b = hm[3];
    }
    var mid_common = hm[4];
    return [text1_a, text1_b, text2_a, text2_b, mid_common];
};


/**
 * Reduce the number of edits by eliminating semantically trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemantic = function (diffs) {
    var changes = false;
    var equalities = [];  // Stack of indices where equalities are found.
    var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
    /** @type {?string} */
    var lastEquality = null;
    // Always equal to diffs[equalities[equalitiesLength - 1]][1]
    var pointer = 0;  // Index of current position.
    // Number of characters that changed prior to the equality.
    var length_insertions1 = 0;
    var length_deletions1 = 0;
    // Number of characters that changed after the equality.
    var length_insertions2 = 0;
    var length_deletions2 = 0;
    while (pointer < diffs.length) {
        if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
            equalities[equalitiesLength++] = pointer;
            length_insertions1 = length_insertions2;
            length_deletions1 = length_deletions2;
            length_insertions2 = 0;
            length_deletions2 = 0;
            lastEquality = diffs[pointer][1];
        } else {  // An insertion or deletion.
            if (diffs[pointer][0] == DIFF_INSERT) {
                length_insertions2 += diffs[pointer][1].length;
            } else {
                length_deletions2 += diffs[pointer][1].length;
            }
            // Eliminate an equality that is smaller or equal to the edits on both
            // sides of it.
            if (lastEquality && (lastEquality.length <=
                Math.max(length_insertions1, length_deletions1)) &&
                (lastEquality.length <= Math.max(length_insertions2,
                    length_deletions2))) {
                // Duplicate record.
                diffs.splice(equalities[equalitiesLength - 1], 0,
                    new diff_match_patch.Diff(DIFF_DELETE, lastEquality));
                // Change second copy to insert.
                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                // Throw away the equality we just deleted.
                equalitiesLength--;
                // Throw away the previous equality (it needs to be reevaluated).
                equalitiesLength--;
                pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                length_insertions1 = 0;  // Reset the counters.
                length_deletions1 = 0;
                length_insertions2 = 0;
                length_deletions2 = 0;
                lastEquality = null;
                changes = true;
            }
        }
        pointer++;
    }

    // Normalize the diff.
    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
    this.diff_cleanupSemanticLossless(diffs);

    // Find any overlaps between deletions and insertions.
    // e.g: <del>abcxxx</del><ins>xxxdef</ins>
    //   -> <del>abc</del>xxx<ins>def</ins>
    // e.g: <del>xxxabc</del><ins>defxxx</ins>
    //   -> <ins>def</ins>xxx<del>abc</del>
    // Only extract an overlap if it is as big as the edit ahead or behind it.
    pointer = 1;
    while (pointer < diffs.length) {
        if (diffs[pointer - 1][0] == DIFF_DELETE &&
            diffs[pointer][0] == DIFF_INSERT) {
            var deletion = diffs[pointer - 1][1];
            var insertion = diffs[pointer][1];
            var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
            var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
            if (overlap_length1 >= overlap_length2) {
                if (overlap_length1 >= deletion.length / 2 ||
                    overlap_length1 >= insertion.length / 2) {
                    // Overlap found.  Insert an equality and trim the surrounding edits.
                    diffs.splice(pointer, 0, new diff_match_patch.Diff(DIFF_EQUAL,
                        insertion.substring(0, overlap_length1)));
                    diffs[pointer - 1][1] =
                        deletion.substring(0, deletion.length - overlap_length1);
                    diffs[pointer + 1][1] = insertion.substring(overlap_length1);
                    pointer++;
                }
            } else {
                if (overlap_length2 >= deletion.length / 2 ||
                    overlap_length2 >= insertion.length / 2) {
                    // Reverse overlap found.
                    // Insert an equality and swap and trim the surrounding edits.
                    diffs.splice(pointer, 0, new diff_match_patch.Diff(DIFF_EQUAL,
                        deletion.substring(0, overlap_length2)));
                    diffs[pointer - 1][0] = DIFF_INSERT;
                    diffs[pointer - 1][1] =
                        insertion.substring(0, insertion.length - overlap_length2);
                    diffs[pointer + 1][0] = DIFF_DELETE;
                    diffs[pointer + 1][1] =
                        deletion.substring(overlap_length2);
                    pointer++;
                }
            }
            pointer++;
        }
        pointer++;
    }
};


/**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemanticLossless = function (diffs) {
    /**
     * Given two strings, compute a score representing whether the internal
     * boundary falls on logical boundaries.
     * Scores range from 6 (best) to 0 (worst).
     * Closure, but does not reference any external variables.
     * @param {string} one First string.
     * @param {string} two Second string.
     * @return {number} The score.
     * @private
     */
    function diff_cleanupSemanticScore_(one, two) {
        if (!one || !two) {
            // Edges are the best.
            return 6;
        }

        // Each port of this function behaves slightly differently due to
        // subtle differences in each language's definition of things like
        // 'whitespace'.  Since this function's purpose is largely cosmetic,
        // the choice has been made to use each language's native features
        // rather than force total conformity.
        var char1 = one.charAt(one.length - 1);
        var char2 = two.charAt(0);
        var nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_);
        var nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_);
        var whitespace1 = nonAlphaNumeric1 &&
            char1.match(diff_match_patch.whitespaceRegex_);
        var whitespace2 = nonAlphaNumeric2 &&
            char2.match(diff_match_patch.whitespaceRegex_);
        var lineBreak1 = whitespace1 &&
            char1.match(diff_match_patch.linebreakRegex_);
        var lineBreak2 = whitespace2 &&
            char2.match(diff_match_patch.linebreakRegex_);
        var blankLine1 = lineBreak1 &&
            one.match(diff_match_patch.blanklineEndRegex_);
        var blankLine2 = lineBreak2 &&
            two.match(diff_match_patch.blanklineStartRegex_);

        if (blankLine1 || blankLine2) {
            // Five points for blank lines.
            return 5;
        } else if (lineBreak1 || lineBreak2) {
            // Four points for line breaks.
            return 4;
        } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
            // Three points for end of sentences.
            return 3;
        } else if (whitespace1 || whitespace2) {
            // Two points for whitespace.
            return 2;
        } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
            // One point for non-alphanumeric.
            return 1;
        }
        return 0;
    }

    var pointer = 1;
    // Intentionally ignore the first and last element (don't need checking).
    while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] == DIFF_EQUAL &&
            diffs[pointer + 1][0] == DIFF_EQUAL) {
            // This is a single edit surrounded by equalities.
            var equality1 = diffs[pointer - 1][1];
            var edit = diffs[pointer][1];
            var equality2 = diffs[pointer + 1][1];

            // First, shift the edit as far left as possible.
            var commonOffset = this.diff_commonSuffix(equality1, edit);
            if (commonOffset) {
                var commonString = edit.substring(edit.length - commonOffset);
                equality1 = equality1.substring(0, equality1.length - commonOffset);
                edit = commonString + edit.substring(0, edit.length - commonOffset);
                equality2 = commonString + equality2;
            }

            // Second, step character by character right, looking for the best fit.
            var bestEquality1 = equality1;
            var bestEdit = edit;
            var bestEquality2 = equality2;
            var bestScore = diff_cleanupSemanticScore_(equality1, edit) +
                diff_cleanupSemanticScore_(edit, equality2);
            while (edit.charAt(0) === equality2.charAt(0)) {
                equality1 += edit.charAt(0);
                edit = edit.substring(1) + equality2.charAt(0);
                equality2 = equality2.substring(1);
                var score = diff_cleanupSemanticScore_(equality1, edit) +
                    diff_cleanupSemanticScore_(edit, equality2);
                // The >= encourages trailing rather than leading whitespace on edits.
                if (score >= bestScore) {
                    bestScore = score;
                    bestEquality1 = equality1;
                    bestEdit = edit;
                    bestEquality2 = equality2;
                }
            }

            if (diffs[pointer - 1][1] != bestEquality1) {
                // We have an improvement, save it back to the diff.
                if (bestEquality1) {
                    diffs[pointer - 1][1] = bestEquality1;
                } else {
                    diffs.splice(pointer - 1, 1);
                    pointer--;
                }
                diffs[pointer][1] = bestEdit;
                if (bestEquality2) {
                    diffs[pointer + 1][1] = bestEquality2;
                } else {
                    diffs.splice(pointer + 1, 1);
                    pointer--;
                }
            }
        }
        pointer++;
    }
};

// Define some regex patterns for matching boundaries.
diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
diff_match_patch.whitespaceRegex_ = /\s/;
diff_match_patch.linebreakRegex_ = /[\r\n]/;
diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/;
diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/;

/**
 * Reduce the number of edits by eliminating operationally trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupEfficiency = function (diffs) {
    var changes = false;
    var equalities = [];  // Stack of indices where equalities are found.
    var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
    /** @type {?string} */
    var lastEquality = null;
    // Always equal to diffs[equalities[equalitiesLength - 1]][1]
    var pointer = 0;  // Index of current position.
    // Is there an insertion operation before the last equality.
    var pre_ins = false;
    // Is there a deletion operation before the last equality.
    var pre_del = false;
    // Is there an insertion operation after the last equality.
    var post_ins = false;
    // Is there a deletion operation after the last equality.
    var post_del = false;
    while (pointer < diffs.length) {
        if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
            if (diffs[pointer][1].length < this.Diff_EditCost &&
                (post_ins || post_del)) {
                // Candidate found.
                equalities[equalitiesLength++] = pointer;
                pre_ins = post_ins;
                pre_del = post_del;
                lastEquality = diffs[pointer][1];
            } else {
                // Not a candidate, and can never become one.
                equalitiesLength = 0;
                lastEquality = null;
            }
            post_ins = post_del = false;
        } else {  // An insertion or deletion.
            if (diffs[pointer][0] == DIFF_DELETE) {
                post_del = true;
            } else {
                post_ins = true;
            }
            /*
             * Five types to be split:
             * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
             * <ins>A</ins>X<ins>C</ins><del>D</del>
             * <ins>A</ins><del>B</del>X<ins>C</ins>
             * <ins>A</del>X<ins>C</ins><del>D</del>
             * <ins>A</ins><del>B</del>X<del>C</del>
             */
            if (lastEquality && ((pre_ins && pre_del && post_ins && post_del) ||
                ((lastEquality.length < this.Diff_EditCost / 2) &&
                    (pre_ins + pre_del + post_ins + post_del) == 3))) {
                // Duplicate record.
                diffs.splice(equalities[equalitiesLength - 1], 0,
                    new diff_match_patch.Diff(DIFF_DELETE, lastEquality));
                // Change second copy to insert.
                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                equalitiesLength--;  // Throw away the equality we just deleted;
                lastEquality = null;
                if (pre_ins && pre_del) {
                    // No changes made which could affect previous entry, keep going.
                    post_ins = post_del = true;
                    equalitiesLength = 0;
                } else {
                    equalitiesLength--;  // Throw away the previous equality.
                    pointer = equalitiesLength > 0 ?
                        equalities[equalitiesLength - 1] : -1;
                    post_ins = post_del = false;
                }
                changes = true;
            }
        }
        pointer++;
    }

    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
};


/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupMerge = function (diffs) {
    // Add a dummy entry at the end.
    diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, ''));
    var pointer = 0;
    var count_delete = 0;
    var count_insert = 0;
    var text_delete = '';
    var text_insert = '';
    var commonlength;
    while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
            case DIFF_INSERT:
                count_insert++;
                text_insert += diffs[pointer][1];
                pointer++;
                break;
            case DIFF_DELETE:
                count_delete++;
                text_delete += diffs[pointer][1];
                pointer++;
                break;
            case DIFF_EQUAL:
                // Upon reaching an equality, check for prior redundancies.
                if (count_delete + count_insert > 1) {
                    if (count_delete !== 0 && count_insert !== 0) {
                        // Factor out any common prefixies.
                        commonlength = this.diff_commonPrefix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            if ((pointer - count_delete - count_insert) > 0 &&
                                diffs[pointer - count_delete - count_insert - 1][0] ==
                                DIFF_EQUAL) {
                                diffs[pointer - count_delete - count_insert - 1][1] +=
                                    text_insert.substring(0, commonlength);
                            } else {
                                diffs.splice(0, 0, new diff_match_patch.Diff(DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)));
                                pointer++;
                            }
                            text_insert = text_insert.substring(commonlength);
                            text_delete = text_delete.substring(commonlength);
                        }
                        // Factor out any common suffixies.
                        commonlength = this.diff_commonSuffix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            diffs[pointer][1] = text_insert.substring(text_insert.length -
                                commonlength) + diffs[pointer][1];
                            text_insert = text_insert.substring(0, text_insert.length -
                                commonlength);
                            text_delete = text_delete.substring(0, text_delete.length -
                                commonlength);
                        }
                    }
                    // Delete the offending records and add the merged ones.
                    pointer -= count_delete + count_insert;
                    diffs.splice(pointer, count_delete + count_insert);
                    if (text_delete.length) {
                        diffs.splice(pointer, 0,
                            new diff_match_patch.Diff(DIFF_DELETE, text_delete));
                        pointer++;
                    }
                    if (text_insert.length) {
                        diffs.splice(pointer, 0,
                            new diff_match_patch.Diff(DIFF_INSERT, text_insert));
                        pointer++;
                    }
                    pointer++;
                } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
                    // Merge this equality with the previous one.
                    diffs[pointer - 1][1] += diffs[pointer][1];
                    diffs.splice(pointer, 1);
                } else {
                    pointer++;
                }
                count_insert = 0;
                count_delete = 0;
                text_delete = '';
                text_insert = '';
                break;
        }
    }
    if (diffs[diffs.length - 1][1] === '') {
        diffs.pop();  // Remove the dummy entry at the end.
    }

    // Second pass: look for single edits surrounded on both sides by equalities
    // which can be shifted sideways to eliminate an equality.
    // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
    var changes = false;
    pointer = 1;
    // Intentionally ignore the first and last element (don't need checking).
    while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] == DIFF_EQUAL &&
            diffs[pointer + 1][0] == DIFF_EQUAL) {
            // This is a single edit surrounded by equalities.
            if (diffs[pointer][1].substring(diffs[pointer][1].length -
                diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
                // Shift the edit over the previous equality.
                diffs[pointer][1] = diffs[pointer - 1][1] +
                    diffs[pointer][1].substring(0, diffs[pointer][1].length -
                        diffs[pointer - 1][1].length);
                diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                diffs.splice(pointer - 1, 1);
                changes = true;
            } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
                diffs[pointer + 1][1]) {
                // Shift the edit over the next equality.
                diffs[pointer - 1][1] += diffs[pointer + 1][1];
                diffs[pointer][1] =
                    diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
                    diffs[pointer + 1][1];
                diffs.splice(pointer + 1, 1);
                changes = true;
            }
        }
        pointer++;
    }
    // If shifts were made, the diff needs reordering and another shift sweep.
    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
};


/**
 * loc is a location in text1, compute and return the equivalent location in
 * text2.
 * e.g. 'The cat' vs 'The big cat', 1->1, 5->8
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {number} loc Location within text1.
 * @return {number} Location within text2.
 */
diff_match_patch.prototype.diff_xIndex = function (diffs, loc) {
    var chars1 = 0;
    var chars2 = 0;
    var last_chars1 = 0;
    var last_chars2 = 0;
    var x;
    for (x = 0; x < diffs.length; x++) {
        if (diffs[x][0] !== DIFF_INSERT) {  // Equality or deletion.
            chars1 += diffs[x][1].length;
        }
        if (diffs[x][0] !== DIFF_DELETE) {  // Equality or insertion.
            chars2 += diffs[x][1].length;
        }
        if (chars1 > loc) {  // Overshot the location.
            break;
        }
        last_chars1 = chars1;
        last_chars2 = chars2;
    }
    // Was the location was deleted?
    if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
        return last_chars2;
    }
    // Add the remaining character length.
    return last_chars2 + (loc - last_chars1);
};


/**
 * Convert a diff array into a pretty HTML report.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 */
diff_match_patch.prototype.diff_prettyHtml = function (diffs) {
    var html = [];
    var pattern_amp = /&/g;
    var pattern_lt = /</g;
    var pattern_gt = />/g;
    var pattern_para = /\n/g;
    for (var x = 0; x < diffs.length; x++) {
        var op = diffs[x][0];    // Operation (insert, delete, equal)
        var data = diffs[x][1];  // Text of change.
        var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
            .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
        switch (op) {
            case DIFF_INSERT:
                html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
                break;
            case DIFF_DELETE:
                html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
                break;
            case DIFF_EQUAL:
                html[x] = '<span>' + text + '</span>';
                break;
        }
    }
    return html.join('');
};


/**
 * Compute and return the source text (all equalities and deletions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Source text.
 */
diff_match_patch.prototype.diff_text1 = function (diffs) {
    var text = [];
    for (var x = 0; x < diffs.length; x++) {
        if (diffs[x][0] !== DIFF_INSERT) {
            text[x] = diffs[x][1];
        }
    }
    return text.join('');
};


/**
 * Compute and return the destination text (all equalities and insertions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Destination text.
 */
diff_match_patch.prototype.diff_text2 = function (diffs) {
    var text = [];
    for (var x = 0; x < diffs.length; x++) {
        if (diffs[x][0] !== DIFF_DELETE) {
            text[x] = diffs[x][1];
        }
    }
    return text.join('');
};


/**
 * Compute the Levenshtein distance; the number of inserted, deleted or
 * substituted characters.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {number} Number of changes.
 */
diff_match_patch.prototype.diff_levenshtein = function (diffs) {
    var levenshtein = 0;
    var insertions = 0;
    var deletions = 0;
    for (var x = 0; x < diffs.length; x++) {
        var op = diffs[x][0];
        var data = diffs[x][1];
        switch (op) {
            case DIFF_INSERT:
                insertions += data.length;
                break;
            case DIFF_DELETE:
                deletions += data.length;
                break;
            case DIFF_EQUAL:
                // A deletion and an insertion is one substitution.
                levenshtein += Math.max(insertions, deletions);
                insertions = 0;
                deletions = 0;
                break;
        }
    }
    levenshtein += Math.max(insertions, deletions);
    return levenshtein;
};


/**
 * Crush the diff into an encoded string which describes the operations
 * required to transform text1 into text2.
 * E.g. =3\t-2\t+ing  -> Keep 3 chars, delete 2 chars, insert 'ing'.
 * Operations are tab-separated.  Inserted text is escaped using %xx notation.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Delta text.
 */
diff_match_patch.prototype.diff_toDelta = function (diffs) {
    var text = [];
    for (var x = 0; x < diffs.length; x++) {
        switch (diffs[x][0]) {
            case DIFF_INSERT:
                text[x] = '+' + encodeURI(diffs[x][1]);
                break;
            case DIFF_DELETE:
                text[x] = '-' + diffs[x][1].length;
                break;
            case DIFF_EQUAL:
                text[x] = '=' + diffs[x][1].length;
                break;
        }
    }
    return text.join('\t').replace(/%20/g, ' ');
};


/**
 * Given the original text1, and an encoded string which describes the
 * operations required to transform text1 into text2, compute the full diff.
 * @param {string} text1 Source string for the diff.
 * @param {string} delta Delta text.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.diff_fromDelta = function (text1, delta) {
    var diffs = [];
    var diffsLength = 0;  // Keeping our own length var is faster in JS.
    var pointer = 0;  // Cursor in text1
    var tokens = delta.split(/\t/g);
    for (var x = 0; x < tokens.length; x++) {
        // Each token begins with a one character parameter which specifies the
        // operation of this token (delete, insert, equality).
        var param = tokens[x].substring(1);
        switch (tokens[x].charAt(0)) {
            case '+':
                try {
                    diffs[diffsLength++] =
                        new diff_match_patch.Diff(DIFF_INSERT, decodeURI(param));
                } catch (ex) {
                    // Malformed URI sequence.
                    throw new Error('Illegal escape in diff_fromDelta: ' + param);
                }
                break;
            case '-':
            // Fall through.
            case '=':
                var n = parseInt(param, 10);
                if (isNaN(n) || n < 0) {
                    throw new Error('Invalid number in diff_fromDelta: ' + param);
                }
                var text = text1.substring(pointer, pointer += n);
                if (tokens[x].charAt(0) == '=') {
                    diffs[diffsLength++] = new diff_match_patch.Diff(DIFF_EQUAL, text);
                } else {
                    diffs[diffsLength++] = new diff_match_patch.Diff(DIFF_DELETE, text);
                }
                break;
            default:
                // Blank tokens are ok (from a trailing \t).
                // Anything else is an error.
                if (tokens[x]) {
                    throw new Error('Invalid diff operation in diff_fromDelta: ' +
                        tokens[x]);
                }
        }
    }
    if (pointer != text1.length) {
        throw new Error('Delta length (' + pointer +
            ') does not equal source text length (' + text1.length + ').');
    }
    return diffs;
};


//  MATCH FUNCTIONS


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc'.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 */
diff_match_patch.prototype.match_main = function (text, pattern, loc) {
    // Check for null inputs.
    if (text == null || pattern == null || loc == null) {
        throw new Error('Null input. (match_main)');
    }

    loc = Math.max(0, Math.min(loc, text.length));
    if (text == pattern) {
        // Shortcut (potentially not guaranteed by the algorithm)
        return 0;
    } else if (!text.length) {
        // Nothing to match.
        return -1;
    } else if (text.substring(loc, loc + pattern.length) == pattern) {
        // Perfect match at the perfect spot!  (Includes case of null pattern)
        return loc;
    } else {
        // Do a fuzzy compare.
        return this.match_bitap_(text, pattern, loc);
    }
};


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc' using the
 * Bitap algorithm.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 * @private
 */
diff_match_patch.prototype.match_bitap_ = function (text, pattern, loc) {
    if (pattern.length > this.Match_MaxBits) {
        throw new Error('Pattern too long for this browser.');
    }

    // Initialise the alphabet.
    var s = this.match_alphabet_(pattern);

    var dmp = this;  // 'this' becomes 'window' in a closure.

    /**
     * Compute and return the score for a match with e errors and x location.
     * Accesses loc and pattern through being a closure.
     * @param {number} e Number of errors in match.
     * @param {number} x Location of match.
     * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
     * @private
     */
    function match_bitapScore_(e, x) {
        var accuracy = e / pattern.length;
        var proximity = Math.abs(loc - x);
        if (!dmp.Match_Distance) {
            // Dodge divide by zero error.
            return proximity ? 1.0 : accuracy;
        }
        return accuracy + (proximity / dmp.Match_Distance);
    }

    // Highest score beyond which we give up.
    var score_threshold = this.Match_Threshold;
    // Is there a nearby exact match? (speedup)
    var best_loc = text.indexOf(pattern, loc);
    if (best_loc != -1) {
        score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
        // What about in the other direction? (speedup)
        best_loc = text.lastIndexOf(pattern, loc + pattern.length);
        if (best_loc != -1) {
            score_threshold =
                Math.min(match_bitapScore_(0, best_loc), score_threshold);
        }
    }

    // Initialise the bit arrays.
    var matchmask = 1 << (pattern.length - 1);
    best_loc = -1;

    var bin_min, bin_mid;
    var bin_max = pattern.length + text.length;
    var last_rd;
    for (var d = 0; d < pattern.length; d++) {
        // Scan for the best match; each iteration allows for one more error.
        // Run a binary search to determine how far from 'loc' we can stray at this
        // error level.
        bin_min = 0;
        bin_mid = bin_max;
        while (bin_min < bin_mid) {
            if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
                bin_min = bin_mid;
            } else {
                bin_max = bin_mid;
            }
            bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
        }
        // Use the result from this iteration as the maximum for the next.
        bin_max = bin_mid;
        var start = Math.max(1, loc - bin_mid + 1);
        var finish = Math.min(loc + bin_mid, text.length) + pattern.length;

        var rd = Array(finish + 2);
        rd[finish + 1] = (1 << d) - 1;
        for (var j = finish; j >= start; j--) {
            // The alphabet (s) is a sparse hash, so the following line generates
            // warnings.
            var charMatch = s[text.charAt(j - 1)];
            if (d === 0) {  // First pass: exact match.
                rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
            } else {  // Subsequent passes: fuzzy match.
                rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) |
                    (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
                    last_rd[j + 1];
            }
            if (rd[j] & matchmask) {
                var score = match_bitapScore_(d, j - 1);
                // This match will almost certainly be better than any existing match.
                // But check anyway.
                if (score <= score_threshold) {
                    // Told you so.
                    score_threshold = score;
                    best_loc = j - 1;
                    if (best_loc > loc) {
                        // When passing loc, don't exceed our current distance from loc.
                        start = Math.max(1, 2 * loc - best_loc);
                    } else {
                        // Already passed loc, downhill from here on in.
                        break;
                    }
                }
            }
        }
        // No hope for a (better) match at greater error levels.
        if (match_bitapScore_(d + 1, loc) > score_threshold) {
            break;
        }
        last_rd = rd;
    }
    return best_loc;
};


/**
 * Initialise the alphabet for the Bitap algorithm.
 * @param {string} pattern The text to encode.
 * @return {!Object} Hash of character locations.
 * @private
 */
diff_match_patch.prototype.match_alphabet_ = function (pattern) {
    var s = {};
    for (var i = 0; i < pattern.length; i++) {
        s[pattern.charAt(i)] = 0;
    }
    for (var i = 0; i < pattern.length; i++) {
        s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
    }
    return s;
};






//  PATCH FUNCTIONS


/**
 * Increase the context until it is unique,
 * but don't let the pattern expand beyond Match_MaxBits.
 * @param {!diff_match_patch.patch_obj} patch The patch to grow.
 * @param {string} text Source text.
 * @private
 */
diff_match_patch.prototype.patch_addContext_ = function (patch, text) {
    if (text.length == 0) {
        return;
    }
    if (patch.start2 === null) {
        throw Error('patch not initialized');
    }
    var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
    var padding = 0;

    // Look for the first and last matches of pattern in text.  If two different
    // matches are found, increase the pattern length.
    while (text.indexOf(pattern) != text.lastIndexOf(pattern) &&
        pattern.length < this.Match_MaxBits - this.Patch_Margin -
        this.Patch_Margin) {
        padding += this.Patch_Margin;
        pattern = text.substring(patch.start2 - padding,
            patch.start2 + patch.length1 + padding);
    }
    // Add one chunk for good luck.
    padding += this.Patch_Margin;

    // Add the prefix.
    var prefix = text.substring(patch.start2 - padding, patch.start2);
    if (prefix) {
        patch.diffs.unshift(new diff_match_patch.Diff(DIFF_EQUAL, prefix));
    }
    // Add the suffix.
    var suffix = text.substring(patch.start2 + patch.length1,
        patch.start2 + patch.length1 + padding);
    if (suffix) {
        patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, suffix));
    }

    // Roll back the start points.
    patch.start1 -= prefix.length;
    patch.start2 -= prefix.length;
    // Extend the lengths.
    patch.length1 += prefix.length + suffix.length;
    patch.length2 += prefix.length + suffix.length;
};


/**
 * Compute a list of patches to turn text1 into text2.
 * Use diffs if provided, otherwise compute it ourselves.
 * There are four ways to call this function, depending on what data is
 * available to the caller:
 * Method 1:
 * a = text1, b = text2
 * Method 2:
 * a = diffs
 * Method 3 (optimal):
 * a = text1, b = diffs
 * Method 4 (deprecated, use method 3):
 * a = text1, b = text2, c = diffs
 *
 * @param {string|!Array.<!diff_match_patch.Diff>} a text1 (methods 1,3,4) or
 * Array of diff tuples for text1 to text2 (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>=} opt_b text2 (methods 1,4) or
 * Array of diff tuples for text1 to text2 (method 3) or undefined (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>=} opt_c Array of diff tuples
 * for text1 to text2 (method 4) or undefined (methods 1,2,3).
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_make = function (a, opt_b, opt_c) {
    var text1, diffs;
    if (typeof a == 'string' && typeof opt_b == 'string' &&
        typeof opt_c == 'undefined') {
        // Method 1: text1, text2
        // Compute diffs from text1 and text2.
        text1 = /** @type {string} */(a);
        diffs = this.diff_main(text1, /** @type {string} */(opt_b), true);
        if (diffs.length > 2) {
            this.diff_cleanupSemantic(diffs);
            this.diff_cleanupEfficiency(diffs);
        }
    } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' &&
        typeof opt_c == 'undefined') {
        // Method 2: diffs
        // Compute text1 from diffs.
        diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(a);
        text1 = this.diff_text1(diffs);
    } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' &&
        typeof opt_c == 'undefined') {
        // Method 3: text1, diffs
        text1 = /** @type {string} */(a);
        diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_b);
    } else if (typeof a == 'string' && typeof opt_b == 'string' &&
        opt_c && typeof opt_c == 'object') {
        // Method 4: text1, text2, diffs
        // text2 is not used.
        text1 = /** @type {string} */(a);
        diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_c);
    } else {
        throw new Error('Unknown call format to patch_make.');
    }

    if (diffs.length === 0) {
        return [];  // Get rid of the null case.
    }
    var patches = [];
    var patch = new diff_match_patch.patch_obj();
    var patchDiffLength = 0;  // Keeping our own length var is faster in JS.
    var char_count1 = 0;  // Number of characters into the text1 string.
    var char_count2 = 0;  // Number of characters into the text2 string.
    // Start with text1 (prepatch_text) and apply the diffs until we arrive at
    // text2 (postpatch_text).  We recreate the patches one by one to determine
    // context info.
    var prepatch_text = text1;
    var postpatch_text = text1;
    for (var x = 0; x < diffs.length; x++) {
        var diff_type = diffs[x][0];
        var diff_text = diffs[x][1];

        if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
            // A new patch starts here.
            patch.start1 = char_count1;
            patch.start2 = char_count2;
        }

        switch (diff_type) {
            case DIFF_INSERT:
                patch.diffs[patchDiffLength++] = diffs[x];
                patch.length2 += diff_text.length;
                postpatch_text = postpatch_text.substring(0, char_count2) + diff_text +
                    postpatch_text.substring(char_count2);
                break;
            case DIFF_DELETE:
                patch.length1 += diff_text.length;
                patch.diffs[patchDiffLength++] = diffs[x];
                postpatch_text = postpatch_text.substring(0, char_count2) +
                    postpatch_text.substring(char_count2 +
                        diff_text.length);
                break;
            case DIFF_EQUAL:
                if (diff_text.length <= 2 * this.Patch_Margin &&
                    patchDiffLength && diffs.length != x + 1) {
                    // Small equality inside a patch.
                    patch.diffs[patchDiffLength++] = diffs[x];
                    patch.length1 += diff_text.length;
                    patch.length2 += diff_text.length;
                } else if (diff_text.length >= 2 * this.Patch_Margin) {
                    // Time for a new patch.
                    if (patchDiffLength) {
                        this.patch_addContext_(patch, prepatch_text);
                        patches.push(patch);
                        patch = new diff_match_patch.patch_obj();
                        patchDiffLength = 0;
                        // Unlike Unidiff, our patch lists have a rolling context.
                        // https://github.com/google/diff-match-patch/wiki/Unidiff
                        // Update prepatch text & pos to reflect the application of the
                        // just completed patch.
                        prepatch_text = postpatch_text;
                        char_count1 = char_count2;
                    }
                }
                break;
        }

        // Update the current character count.
        if (diff_type !== DIFF_INSERT) {
            char_count1 += diff_text.length;
        }
        if (diff_type !== DIFF_DELETE) {
            char_count2 += diff_text.length;
        }
    }
    // Pick up the leftover patch if not empty.
    if (patchDiffLength) {
        this.patch_addContext_(patch, prepatch_text);
        patches.push(patch);
    }

    return patches;
};


/**
 * Given an array of patches, return another array that is identical.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_deepCopy = function (patches) {
    // Making deep copies is hard in JavaScript.
    var patchesCopy = [];
    for (var x = 0; x < patches.length; x++) {
        var patch = patches[x];
        var patchCopy = new diff_match_patch.patch_obj();
        patchCopy.diffs = [];
        for (var y = 0; y < patch.diffs.length; y++) {
            patchCopy.diffs[y] =
                new diff_match_patch.Diff(patch.diffs[y][0], patch.diffs[y][1]);
        }
        patchCopy.start1 = patch.start1;
        patchCopy.start2 = patch.start2;
        patchCopy.length1 = patch.length1;
        patchCopy.length2 = patch.length2;
        patchesCopy[x] = patchCopy;
    }
    return patchesCopy;
};


/**
 * Merge a set of patches onto the text.  Return a patched text, as well
 * as a list of true/false values indicating which patches were applied.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @param {string} text Old text.
 * @return {!Array.<string|!Array.<boolean>>} Two element Array, containing the
 *      new text and an array of boolean values.
 */
diff_match_patch.prototype.patch_apply = function (patches, text) {
    if (patches.length == 0) {
        return [text, []];
    }

    // Deep copy the patches so that no changes are made to originals.
    patches = this.patch_deepCopy(patches);

    var nullPadding = this.patch_addPadding(patches);
    text = nullPadding + text + nullPadding;

    this.patch_splitMax(patches);
    // delta keeps track of the offset between the expected and actual location
    // of the previous patch.  If there are patches expected at positions 10 and
    // 20, but the first patch was found at 12, delta is 2 and the second patch
    // has an effective expected position of 22.
    var delta = 0;
    var results = [];
    for (var x = 0; x < patches.length; x++) {
        var expected_loc = patches[x].start2 + delta;
        var text1 = this.diff_text1(patches[x].diffs);
        var start_loc;
        var end_loc = -1;
        if (text1.length > this.Match_MaxBits) {
            // patch_splitMax will only provide an oversized pattern in the case of
            // a monster delete.
            start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits),
                expected_loc);
            if (start_loc != -1) {
                end_loc = this.match_main(text,
                    text1.substring(text1.length - this.Match_MaxBits),
                    expected_loc + text1.length - this.Match_MaxBits);
                if (end_loc == -1 || start_loc >= end_loc) {
                    // Can't find valid trailing context.  Drop this patch.
                    start_loc = -1;
                }
            }
        } else {
            start_loc = this.match_main(text, text1, expected_loc);
        }
        if (start_loc == -1) {
            // No match found.  :(
            results[x] = false;
            // Subtract the delta for this failed patch from subsequent patches.
            delta -= patches[x].length2 - patches[x].length1;
        } else {
            // Found a match.  :)
            results[x] = true;
            delta = start_loc - expected_loc;
            var text2;
            if (end_loc == -1) {
                text2 = text.substring(start_loc, start_loc + text1.length);
            } else {
                text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
            }
            if (text1 == text2) {
                // Perfect match, just shove the replacement text in.
                text = text.substring(0, start_loc) +
                    this.diff_text2(patches[x].diffs) +
                    text.substring(start_loc + text1.length);
            } else {
                // Imperfect match.  Run a diff to get a framework of equivalent
                // indices.
                var diffs = this.diff_main(text1, text2, false);
                if (text1.length > this.Match_MaxBits &&
                    this.diff_levenshtein(diffs) / text1.length >
                    this.Patch_DeleteThreshold) {
                    // The end points match, but the content is unacceptably bad.
                    results[x] = false;
                } else {
                    this.diff_cleanupSemanticLossless(diffs);
                    var index1 = 0;
                    var index2;
                    for (var y = 0; y < patches[x].diffs.length; y++) {
                        var mod = patches[x].diffs[y];
                        if (mod[0] !== DIFF_EQUAL) {
                            index2 = this.diff_xIndex(diffs, index1);
                        }
                        if (mod[0] === DIFF_INSERT) {  // Insertion
                            text = text.substring(0, start_loc + index2) + mod[1] +
                                text.substring(start_loc + index2);
                        } else if (mod[0] === DIFF_DELETE) {  // Deletion
                            text = text.substring(0, start_loc + index2) +
                                text.substring(start_loc + this.diff_xIndex(diffs,
                                    index1 + mod[1].length));
                        }
                        if (mod[0] !== DIFF_DELETE) {
                            index1 += mod[1].length;
                        }
                    }
                }
            }
        }
    }
    // Strip the padding off.
    text = text.substring(nullPadding.length, text.length - nullPadding.length);
    return [text, results];
};


/**
 * Add some padding on text start and end so that edges can match something.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} The padding string added to each side.
 */
diff_match_patch.prototype.patch_addPadding = function (patches) {
    var paddingLength = this.Patch_Margin;
    var nullPadding = '';
    for (var x = 1; x <= paddingLength; x++) {
        nullPadding += String.fromCharCode(x);
    }

    // Bump all the patches forward.
    for (var x = 0; x < patches.length; x++) {
        patches[x].start1 += paddingLength;
        patches[x].start2 += paddingLength;
    }

    // Add some padding on start of first diff.
    var patch = patches[0];
    var diffs = patch.diffs;
    if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
        // Add nullPadding equality.
        diffs.unshift(new diff_match_patch.Diff(DIFF_EQUAL, nullPadding));
        patch.start1 -= paddingLength;  // Should be 0.
        patch.start2 -= paddingLength;  // Should be 0.
        patch.length1 += paddingLength;
        patch.length2 += paddingLength;
    } else if (paddingLength > diffs[0][1].length) {
        // Grow first equality.
        var extraLength = paddingLength - diffs[0][1].length;
        diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
        patch.start1 -= extraLength;
        patch.start2 -= extraLength;
        patch.length1 += extraLength;
        patch.length2 += extraLength;
    }

    // Add some padding on end of last diff.
    patch = patches[patches.length - 1];
    diffs = patch.diffs;
    if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
        // Add nullPadding equality.
        diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, nullPadding));
        patch.length1 += paddingLength;
        patch.length2 += paddingLength;
    } else if (paddingLength > diffs[diffs.length - 1][1].length) {
        // Grow last equality.
        var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
        diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
        patch.length1 += extraLength;
        patch.length2 += extraLength;
    }

    return nullPadding;
};


/**
 * Look through the patches and break up any which are longer than the maximum
 * limit of the match algorithm.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 */
diff_match_patch.prototype.patch_splitMax = function (patches) {
    var patch_size = this.Match_MaxBits;
    for (var x = 0; x < patches.length; x++) {
        if (patches[x].length1 <= patch_size) {
            continue;
        }
        var bigpatch = patches[x];
        // Remove the big old patch.
        patches.splice(x--, 1);
        var start1 = bigpatch.start1;
        var start2 = bigpatch.start2;
        var precontext = '';
        while (bigpatch.diffs.length !== 0) {
            // Create one of several smaller patches.
            var patch = new diff_match_patch.patch_obj();
            var empty = true;
            patch.start1 = start1 - precontext.length;
            patch.start2 = start2 - precontext.length;
            if (precontext !== '') {
                patch.length1 = patch.length2 = precontext.length;
                patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, precontext));
            }
            while (bigpatch.diffs.length !== 0 &&
                patch.length1 < patch_size - this.Patch_Margin) {
                var diff_type = bigpatch.diffs[0][0];
                var diff_text = bigpatch.diffs[0][1];
                if (diff_type === DIFF_INSERT) {
                    // Insertions are harmless.
                    patch.length2 += diff_text.length;
                    start2 += diff_text.length;
                    patch.diffs.push(bigpatch.diffs.shift());
                    empty = false;
                } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 &&
                    patch.diffs[0][0] == DIFF_EQUAL &&
                    diff_text.length > 2 * patch_size) {
                    // This is a large deletion.  Let it pass in one chunk.
                    patch.length1 += diff_text.length;
                    start1 += diff_text.length;
                    empty = false;
                    patch.diffs.push(new diff_match_patch.Diff(diff_type, diff_text));
                    bigpatch.diffs.shift();
                } else {
                    // Deletion or equality.  Only take as much as we can stomach.
                    diff_text = diff_text.substring(0,
                        patch_size - patch.length1 - this.Patch_Margin);
                    patch.length1 += diff_text.length;
                    start1 += diff_text.length;
                    if (diff_type === DIFF_EQUAL) {
                        patch.length2 += diff_text.length;
                        start2 += diff_text.length;
                    } else {
                        empty = false;
                    }
                    patch.diffs.push(new diff_match_patch.Diff(diff_type, diff_text));
                    if (diff_text == bigpatch.diffs[0][1]) {
                        bigpatch.diffs.shift();
                    } else {
                        bigpatch.diffs[0][1] =
                            bigpatch.diffs[0][1].substring(diff_text.length);
                    }
                }
            }
            // Compute the head context for the next patch.
            precontext = this.diff_text2(patch.diffs);
            precontext =
                precontext.substring(precontext.length - this.Patch_Margin);
            // Append the end context for this patch.
            var postcontext = this.diff_text1(bigpatch.diffs)
                .substring(0, this.Patch_Margin);
            if (postcontext !== '') {
                patch.length1 += postcontext.length;
                patch.length2 += postcontext.length;
                if (patch.diffs.length !== 0 &&
                    patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
                    patch.diffs[patch.diffs.length - 1][1] += postcontext;
                } else {
                    patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, postcontext));
                }
            }
            if (!empty) {
                patches.splice(++x, 0, patch);
            }
        }
    }
};


/**
 * Take a list of patches and return a textual representation.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} Text representation of patches.
 */
diff_match_patch.prototype.patch_toText = function (patches) {
    var text = [];
    for (var x = 0; x < patches.length; x++) {
        text[x] = patches[x];
    }
    return text.join('');
};


/**
 * Parse a textual representation of patches and return a list of Patch objects.
 * @param {string} textline Text representation of patches.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.patch_fromText = function (textline) {
    var patches = [];
    if (!textline) {
        return patches;
    }
    var text = textline.split('\n');
    var textPointer = 0;
    var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
    while (textPointer < text.length) {
        var m = text[textPointer].match(patchHeader);
        if (!m) {
            throw new Error('Invalid patch string: ' + text[textPointer]);
        }
        var patch = new diff_match_patch.patch_obj();
        patches.push(patch);
        patch.start1 = parseInt(m[1], 10);
        if (m[2] === '') {
            patch.start1--;
            patch.length1 = 1;
        } else if (m[2] == '0') {
            patch.length1 = 0;
        } else {
            patch.start1--;
            patch.length1 = parseInt(m[2], 10);
        }

        patch.start2 = parseInt(m[3], 10);
        if (m[4] === '') {
            patch.start2--;
            patch.length2 = 1;
        } else if (m[4] == '0') {
            patch.length2 = 0;
        } else {
            patch.start2--;
            patch.length2 = parseInt(m[4], 10);
        }
        textPointer++;

        while (textPointer < text.length) {
            var sign = text[textPointer].charAt(0);
            try {
                var line = decodeURI(text[textPointer].substring(1));
            } catch (ex) {
                // Malformed URI sequence.
                throw new Error('Illegal escape in patch_fromText: ' + line);
            }
            if (sign == '-') {
                // Deletion.
                patch.diffs.push(new diff_match_patch.Diff(DIFF_DELETE, line));
            } else if (sign == '+') {
                // Insertion.
                patch.diffs.push(new diff_match_patch.Diff(DIFF_INSERT, line));
            } else if (sign == ' ') {
                // Minor equality.
                patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, line));
            } else if (sign == '@') {
                // Start of next patch.
                break;
            } else if (sign === '') {
                // Blank line?  Whatever.
            } else {
                // WTF?
                throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
            }
            textPointer++;
        }
    }
    return patches;
};


/**
 * Class representing one patch operation.
 * @constructor
 */
diff_match_patch.patch_obj = function () {
    /** @type {!Array.<!diff_match_patch.Diff>} */
    this.diffs = [];
    /** @type {?number} */
    this.start1 = null;
    /** @type {?number} */
    this.start2 = null;
    /** @type {number} */
    this.length1 = 0;
    /** @type {number} */
    this.length2 = 0;
};


/**
 * Emulate GNU diff's format.
 * Header: @@ -382,8 +481,9 @@
 * Indices are printed as 1-based, not 0-based.
 * @return {string} The GNU diff string.
 */
diff_match_patch.patch_obj.prototype.toString = function () {
    var coords1, coords2;
    if (this.length1 === 0) {
        coords1 = this.start1 + ',0';
    } else if (this.length1 == 1) {
        coords1 = this.start1 + 1;
    } else {
        coords1 = (this.start1 + 1) + ',' + this.length1;
    }
    if (this.length2 === 0) {
        coords2 = this.start2 + ',0';
    } else if (this.length2 == 1) {
        coords2 = this.start2 + 1;
    } else {
        coords2 = (this.start2 + 1) + ',' + this.length2;
    }
    var text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
    var op;
    // Escape the body of the patch with %xx notation.
    for (var x = 0; x < this.diffs.length; x++) {
        switch (this.diffs[x][0]) {
            case DIFF_INSERT:
                op = '+';
                break;
            case DIFF_DELETE:
                op = '-';
                break;
            case DIFF_EQUAL:
                op = ' ';
                break;
        }
        text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
    }
    return text.join('').replace(/%20/g, ' ');
};

// CLOSURE:begin_strip
// Lines below here will not be included in the Closure-compatible library.

// Export these global variables so that they survive Google's JS compiler.
// In a browser, 'this' will be 'window'.
// Users of node.js should 'require' the uncompressed version since Google's
// JS compiler may break the following exports for non-browser environments.
/** @suppress {globalThis} */
this['diff_match_patch'] = diff_match_patch;
/** @suppress {globalThis} */
this['DIFF_DELETE'] = DIFF_DELETE;
/** @suppress {globalThis} */
this['DIFF_INSERT'] = DIFF_INSERT;
/** @suppress {globalThis} */
this['DIFF_EQUAL'] = DIFF_EQUAL;
