const textBank = ["andys text", "joji's text", "angel's text"];
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
    document.getElementById("gameText").innerHTML = textBank[((daysPassed % length) + length) % length];
}
window.onload = function () {
    loadDaily()
}