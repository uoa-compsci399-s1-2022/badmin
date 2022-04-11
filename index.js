const textBank = ["andy's text", "joji's text", "angel's text"];
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
	document.getElementById("gameText").innerHTML = text;
	document.getElementById("gameHidden").innerHTML = text;
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
function sanitizeInput(e, element) {
	// case: delete or single alphabetical character //TODO: add quotation marks etc? would prefer if the retyping was just words, TBC w team
	if (e.inputType == 'deleteContentBackward' || e.inputType == 'deleteContentForward' || /^[a-zA-Z()]$/.test(e.data)) {
		return false;
	}
	e.preventDefault();
	return true;
}
/**
 * @function textInputHandler() uses the input text to search & highlight relevant words
 * @param e - the event @type - "beforeinput"
 * @param element - the textarea element inputTextBox
 */
function textInputHandler(e, element) {
	if (!sanitizeInput(e)) { // if the text has been changed
		//highlight text
	}
}
window.onload = function () {
	loadDaily()
	hideGame()
	Getversion()
	document.getElementById("inputTextBox").addEventListener("beforeinput", function (e) { textInputHandler(e, this); });
}