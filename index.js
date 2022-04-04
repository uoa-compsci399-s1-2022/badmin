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
    const text =  textBank[((daysPassed % length) + length) % length];
    document.getElementById("gameText").innerHTML = text;
    document.getElementById("gameHidden").innerHTML = text;
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


window.onload = function () {
    loadDaily()
    hideGame()
    Getversion()
}