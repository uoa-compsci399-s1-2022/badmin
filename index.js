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
    document.getElementById("readyMessage").style.display = "none";
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
        const prefix = gameTextElement.innerHTML.split("<mark>")[1];
        gameTextElement.innerHTML = prefix.split("</mark>")[0] + prefix.split("</mark>")[1];
    }
    previousSearchIndicies = new Array();
    currentSearchIndex = 0;
}
let lastUserInputTime;
function inputHandler(element, event) {
    if (event.code == "Enter" || event.code == "Space") {
        clearPreviousHighlight()
        checkUserInput(element);
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
    if (element.innerText.length >= 1) {
        let index = -1;
        for (let i = 0; i < Object.keys(correctIndicies).length; i++) {
            if (correctedWordsIndicies.includes(i) == false) {
                if (correctIndicies[Object.keys(correctIndicies)[i]].replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ") == element.innerText) {
                    index = Object.keys(correctIndicies)[i];
                }
            }
        }
        if (index != -1) {
            if (correctedWordsIndicies.includes(index) == false) {
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
            }
        }
        else {
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
    document.getElementById("inputTextBox").addEventListener("input", function () { highlightText(this); });
    document.getElementById("inputTextBox").addEventListener("keydown", function (e) { inputHandler(this, e); });
};

function showReadyMessage() {
    document.getElementById("readyMessage").style.display = "block";
}

let gameStartTime;
let totalSeconds;
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
/**
 * Everything that will appear on modal 
 */
function displayStats() {
    document.getElementById("modalScore").innerText = "Score: " + score;
    document.getElementById("modalaccuracy").innerText = "Accuracy: " + Math.max(0, Math.round((countCorrect) / (Object.keys(correctIndicies).length + countWrong) * 100)) + "%"
    calculateComboStreak()
    formatTimeTaken();
    getEveryWord();
    calculateModalGraph();

}
/**
 * See how long the combo was held for in seconds 
 */
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
/**
 * See how long the game was in play until stop button was clicked
 */
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

/**
 * On the stats page display how many words the user got and how much words they did not get
 */

function getEveryWord() {
    if (Object.keys(correctIndicies).length === correctedWordsIndicies.length) {
        document.getElementById("modalGotEverything").innerText = "You got every word!"
    }
    else if(Object.keys(correctIndicies).length - correctedWordsIndicies.length ==1 ){
        document.getElementById("modalGotEverything").innerText = "You did not find " + (Object.keys(correctIndicies).length - correctedWordsIndicies.length) + " word in the text!";
    }
    else {
        document.getElementById("modalGotEverything").innerText = "You did not find " + (Object.keys(correctIndicies).length - correctedWordsIndicies.length) + " words in the text!";
    }
}

/**
 * Graph function which is displayed in modal
 */

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
    totalSeconds = seconds
    const minutes = Math.floor((timeElapsed / 1000) / 60);
    document.getElementById("timer").innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Displays text on screen on the basis of genre and difficulty specified
 */
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
/**
 * JSON text containing all text which will be displayed
 */

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
                "suppliedText": "A self-proclamied exorxist and fraud named Arataka Reigen attempts to exorcize an evil spirit, despite having only stumbled onto it by accident. Much to Reigen's shock, the spirit seems to only be annoyed by his inefecitive attacks, which consist of throwing a handful of table salt at the spirit (actually meant to be purified salt). Reigen then unleashes his secret weapon: calling in an actual pyschic (also referred to as an esper), Shigeo Kageyama (a.k.a. \"Mob\") to banish the spirit for him with his psychokinetic powers. Mob is an extremelly powerful psychic, despite only being in middle school. Some time later, Reigen is contracted to get rid of evil spirits inhabiting a tuneel. Once again, Reigen manages to trick Mob into doing most of the work for him. One of the ghosts, the decreased leader of a biker gang, warns of an even more powerful monster located deeper in the tunnel, and begs Reigen and Mob to not fight it. However, Mob manages to take it down anyway. The spirits of the leader and his gang are finally at peace and move on to the afterlife.",
                "correctText": "A self-proclaimed exorcist and fraud named Arataka Reigen attempts to exorcise an evil spirit, despite having only stumbled onto it by accident. Much to Reigen's shock, the spirit seems to only be annoyed by his ineffective attacks, which consist of throwing a handful of table salt at the spirit (actually meant to be purified salt). Reigen then unleashes his secret weapon: calling in an actual psychic (also referred to as an esper), Shigeo Kageyama (a.k.a. \"Mob\") to banish the spirit for him with his psychokinetic powers. Mob is an extremely powerful psychic, despite only being in middle school. Some time later, Reigen is contracted to get rid of evil spirits inhabiting a tunnel. Once again, Reigen manages to trick Mob into doing most of the work for him. One of the ghosts, the deceased leader of a biker gang, warns of an even more powerful monster located deeper in the tunnel, and begs Reigen and Mob to not fight it. However, Mob manages to take it down anyway. The spirits of the leader and his gang are finally at peace and move on to the afterlife.",
                "errorCount": "7"
            },
            "Slice of Life": {
                "suppliedText": "In 1991, Takaki Tono quickly befriends Akari Shinohara after she transfers to his elementary school in Tokyo. They grow very close to each other due to similiar interests and atitudes such as both prefering to stay inside during recess due to their seasonal allergies. As a result, they form a strong bond which is shown when they speak to each other using their given names without any form of honorifics as that is a sign of deep friendship and familiarity in Japan. Right after graduating from elementary school in 1994, Akari moves to the nearby prefecture of Tochigi due to her parents' jobs. The two keep in contact by writing letters but eventually begin to drift apart. When Takaki learns that his family will be moving to Kagoshima on the other side of the country the following year in 1995, he decides to personalley go see Akari one last time since they will be too far apart to see and visit each other once he moves. He also writes a letter for Akari to confess his feelings for her. However, Takaki loses the letter during the journey and a severve snowstorm delays his train for several hours. When the two finally meet late that night and share their first kiss, Takaki realizes they will never be together.",
                "correctText": "In 1991, Takaki Tono quickly befriends Akari Shinohara after she transfers to his elementary school in Tokyo. They grow very close to each other due to similar interests and attitudes such as both preferring to stay inside during recess due to their seasonal allergies. As a result, they form a strong bond which is shown when they speak to each other using their given names without any form of honorifics as that is a sign of deep friendship and familiarity in Japan. Right after graduating from elementary school in 1994, Akari moves to the nearby prefecture of Tochigi due to her parents' jobs. The two keep in contact by writing letters but eventually begin to drift apart. When Takaki learns that his family will be moving to Kagoshima on the other side of the country the following year in 1995, he decides to personally go see Akari one last time since they will be too far apart to see and visit each other once he moves. He also writes a letter for Akari to confess his feelings for her. However, Takaki loses the letter during the journey and a severe snowstorm delays his train for several hours. When the two finally meet late that night and share their first kiss, Takaki realises they will never be together.",
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
                "correctText": "The narrator, a pilot, crash-lands his plane in the Sahara desert. While he tries to repair his engine and monitor his dwindling supply of water and food, a little boy appears out of nowhere and simply asks him to draw a sheep. The author then learns that this \"little prince\" comes from the far away Asteroid B-612, where he left a rose and three volcanoes. The prince's most prized possession was the rose, but her tempestuous mien and fickleness tired him and he decided to leave his tiny planet. To his surprise, the flower was visibly sad to see him go, but she urged him on nonetheless. Before arriving on Earth, the prince visited other planets and met with strange individuals: a king, a vain man, a drunkard, a lamplighter, and a geographer. At the geographer's suggestion, he visited Earth but dropped down into the Sahara Desert. He found no friends there, but a snake told him that if he ever needed to return to his home planet, he could take advantage of the snake's bite. He met a fox that taught him to realise that to know others we must \"tame\" them; this is what makes things and people unique. \"The essential is invisible to the eye,\" says the fox.",
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
}

let correctText;
let suppliedText;
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
