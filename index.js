const textBank = ["andy's text", "joji's text text.", "angel's text"];
//TODO: we need global variables to store the game text that the user chooses, along with other global variables such as its corresponding error count etc
let gameText;
/**
 * @function loadDaily displays today's text
 */
function loadDaily() {
	const today = new Date();
	// One day (24 hours) is 86,400,000 milliseconds
	const daysPassed = Math.floor(today.getTime() / 86400000);
	// if a user sets their local machine date to before January 1, 1970 -> negative days since starting date -> negative array index (remainder) -> undefined
	// modulus formula [ ((a % n ) + n ) % n ] to account for negative values
	const length = textBank.length;
	const text = textBank[((daysPassed % length) + length) % length];
	document.getElementById("gameText").innerHTML = separateWords(text);
	document.getElementById("gameHidden").innerHTML = separateWords(text);
	gameText = text;
}

// to add divs between each word
function separateWords(passage) {
	const passageArr = passage.split(" ")
	let wordArr = []
	for (let i = 0; i < passageArr.length; i++) {
		wordElement = "<word>" + passageArr[i] + "</word>"
		wordArr.push(wordElement)
	}
	return wordArr.join(" ")
}

/**
 * Hide text function
 */

function showGame() {
	document.getElementById("gameText").style.display = "block";
	document.getElementById("gameHidden").style.display = "none";
}

function hideGame() {
	document.getElementById("gameText").style.display = "none";
	document.getElementById("gameHidden").style.display = "block";
}

function Getversion() {
	document.getElementById("vers").innerText = "v. Beta";
}

/**
 * @function sanitizeInput sanitizes the user input as described in SP-23
 * @param e - the event @type - "beforeinput"
 * @returns if the text has been changed
 */
function sanitizeInput(e) {
	// case: delete or single alphabetical character //TODO: add quotation marks etc? would prefer if the retyping was just words, TBC w team
	if (e.inputType == 'deleteContentBackward' || e.inputType == 'deleteContentForward' || /^[a-zA-Z()]$/.test(e.data)) {
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
function highlightText(element) {
	const gameTextArr = gameText.split(" ");
	const gameTextElements = document.getElementById("gameText").children;
	const searchText = element.value;
	for (let index of previousSearchIndicies) {
		const gameTextElement = gameTextElements[index];
		const prefix = gameTextElement.innerHTML.split("<mark>")[1];
		gameTextElement.innerHTML = prefix.split("</mark>")[0] + prefix.split("</mark>")[1];
	}
	previousSearchIndicies = new Array();
	if (searchText.length >= 1) {
		for (let i = 0; i < gameTextArr.length; i++) {
			const gameTextElement = gameTextElements[i];
			const word = gameTextArr[i];
			if (word.startsWith(searchText) && !correctedWordsIndicies.includes(i)) {
				gameTextElement.innerHTML = "<mark>" + gameTextElement.innerHTML.slice(0, searchText.length) + "</mark>" + gameTextElement.innerHTML.slice(searchText.length);
				previousSearchIndicies.push(i);
			}
		}
	}
}
window.onload = function () {
	loadDaily()
	hideGame()
	Getversion()
	document.getElementById("inputTextBox").addEventListener("beforeinput", function (e) { sanitizeInput(e); });
	document.getElementById("inputTextBox").addEventListener("input", function () { highlightText(this); });
}