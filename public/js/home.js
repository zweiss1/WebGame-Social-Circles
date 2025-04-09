// Wait until all of the DOM is loaded before grabbing images, so we can be sure that they've been loaded
window.addEventListener("load", onDOMLoaded); // Interestingly, the event type "DOMContentLoaded" doesn't wait for things like CSS and images, while "load" does.

// DOM REFERENCES
const canvas = document.getElementById("gameCanvas"); // game canvas
const context = canvas.getContext("2d"); // graphics context of game canvas

const characterImageHolder = document.getElementById("characterImageStorage"); // hidden div in which images are loaded so we can use them here. I'm using it so I can render images from the server on the canvas.
const uiImageHolder = document.getElementById("uiImageStorage"); // same as characterImageHolder but for ui images

const characterImages = {}; //stores images for the game characters, to be rendered on the canvas
const characters = {};

const UIObjects = {}; // stores all of the buttons and interactive elements in the UI (except for the characters), so we can route clicks to them
const UIImages = {};

const socialCircles = {};


// EVENT LISTENERS

canvas.addEventListener("click", onCanvasClicked); // onCanvasClicked will process the click event and call different functions based on where you clicked. It's like a router for clicks!



// CANVAS OBJECTS

// This object stores the 3 possible actions
const ACTIONS = Object.freeze({
    INVITE: "INVITE", 
    RIZZUP: "RIZZUP",
    COALMINE: "COALMINE"
});

// Returns a random one of the three actions
function randomAction(){
    let roll = Math.floor(Math.random() * 3);
    switch (roll){
        case 0:
            return ACTIONS.INVITE;
        case 1:
            return ACTIONS.RIZZUP;
        default:
            return ACTIONS.COALMINE;
    }
}

// Returns a random action that isn't the one provided in the argument (so we don't generate a character that likes and dislikes the same thing)
function randomActionExcl(action){
    let choices = [];
    Object.keys(ACTIONS).forEach((key, index) => {
        if (ACTIONS[key] != action) choices.push(ACTIONS[key]);
    });
    return pickBetween(choices[0], choices[1]);
}

// Helper function for the above
function pickBetween(choice1, choice2){
    if (Math.floor(Math.random() * 2) == 0) return choice1;
    else return choice2;
}

// Represents a single character
class Character{
    like;
    dislike;
    name;
    ui;

    constructor(name, like, dislike, img, x = 0, y = 0){
        this.name = name;
        this.like = like;
        this.dislike = dislike;
        // TODO: the onclick function for a character should give a tooltip or open the characters page or something
        this.ui = new UIObject(name, img, x, y, 3, 75, 75, false, false, undefined);
    }


}

// populates the characters object with characters that have random likes and dislikes
function generateCharacters(){
    // Since character likes and dislikes won't be random, we don't need this.
    // let randomLikes = [];
    // for (let i = 0; i < 9; i++){
    //     randomLikes.push(randomAction);
    // }
    // since each character has one like and dislike and they can't be the same, there will be three pairs of characters with the same like and dislike
    characters["harold"] = new Character("Harold", ACTIONS.INVITE, ACTIONS.RIZZUP, characterImages["harold"], 0, 0);
    characters["henry"] = new Character("Henry", ACTIONS.RIZZUP, ACTIONS.COALMINE, characterImages["henry"], 0, 0);
    characters["howard"] = new Character("Howard", ACTIONS.COALMINE, ACTIONS.INVITE, characterImages["howard"], 0, 0);
    characters["margot"] = new Character("Margot", ACTIONS.INVITE, ACTIONS.COALMINE, characterImages["margot"], 0, 0);
    characters["melissa"] = new Character("Melissa", ACTIONS.RIZZUP, ACTIONS.INVITE, characterImages["melissa"], 0, 0);
    characters["sharon"] = new Character("Sharon", ACTIONS.COALMINE, ACTIONS.RIZZUP, characterImages["sharon"], 0, 0);
    characters["tyler"] = new Character("Tyler", ACTIONS.INVITE, ACTIONS.RIZZUP, characterImages["tyler"], 0, 0);
    characters["valerie"] = new Character("Valerie", ACTIONS.RIZZUP, ACTIONS.COALMINE, characterImages["valerie"], 0, 0);
    characters["chet"] = new Character("Chet", ACTIONS.COALMINE, ACTIONS.RIZZUP, characterImages["chet"], 0, 0);
}

// Initializes the social circles and assigns them characters
function createSocialCircles(){
    socialCircles["leftCircle"] = new SocialCircle(characters["harold"], characters["henry"], characters["howard"], UIObjects["leftCircle"]);
    socialCircles["middleCircle"] = new SocialCircle(characters["margot"], characters["melissa"], characters["sharon"], UIObjects["middleCircle"]);
    socialCircles["rightCircle"] = new SocialCircle(characters["tyler"], characters["valerie"], characters["chet"], UIObjects["rightCircle"]);
}

// Shuffles the 9 characters around the social circles. Do between rounds.
function shuffleCharacters(){
    // Turn the characters into an array
    let chars = [];
    Object.values(socialCircles).forEach((circle, index) => {
        Object.values(circle.characters).forEach((char, index) => {
            chars.push(char);
        });
    });

    // Now, shuffle the array (3 times for good measure)
    shuffle(chars);
    shuffle(chars);
    shuffle(chars);

    // Now, put the characters in the slots
    socialCircles["leftCircle"].characters = {}; // populate left circle
    for (let i = 0; i < 3; i++){
        let char = chars.pop();
        socialCircles["leftCircle"].characters[char.name] = char;
    }

    socialCircles["middleCircle"].characters = {}; // populate left circle
    for (let i = 0; i < 3; i++){
        let char = chars.pop();
        socialCircles["middleCircle"].characters[char.name] = char;
    }

    socialCircles["rightCircle"].characters = {}; // populate left circle
    for (let i = 0; i < 3; i++){
        let char = chars.pop();
        socialCircles["rightCircle"].characters[char.name] = char;
    }

    // Don't forget to call renderUI() after shuffling the characters!
}

// Shuffles an array once
function shuffle(arr){
    for (let i = 0; i < arr.length; i++){
        // swap curr with a random index
        let rand = Math.floor(Math.random() * arr.length);
        let temp = arr[rand];
        let temp2 = arr[i];
        arr[i] = temp;
        arr[rand] = temp2;
    }
}

// Represents one of the three social circles, containing 3 characters each
class SocialCircle{
    characters; //should be instances of Character
    ui;

    constructor(character1, character2, character3, ui){
        this.ui = ui;

        this.characters = {};
        this.characters[character1.name] = character1;
        this.characters[character2.name] = character2;
        this.characters[character3.name] = character3;
    }

    //Draw the social circle and the characters inside
    draw(x = this.ui.x, y = this.ui.y, w = this.ui.width, h = this.ui.height){
        // Draw the social circle first, since the characters are rendered on top of it
        this.ui.draw(x, y, w, h);

        // Then draw the characters.
        let arr = Object.values(this.characters);


        // create positions to draw the characters at inside of the circle. They should make a triangle.
        arr[0].ui.x = (this.ui.centerX - (this.ui.width / 4)) - (arr[0].ui.width / 2);
        arr[0].ui.y = (this.ui.centerY + (this.ui.height / 4)) - (arr[0].ui.height / 2);

        arr[1].ui.x = this.ui.centerX - (arr[1].ui.width / 2);
        arr[1].ui.y = (this.ui.centerY - (this.ui.height / 4)) - (arr[1].ui.height / 2);

        arr[2].ui.x = (this.ui.centerX + (this.ui.width / 4)) - (arr[2].ui.width / 2);
        arr[2].ui.y = (this.ui.centerY + (this.ui.height / 4)) - (arr[2].ui.height / 2);

        // Now we draw the characters using the default values
        arr[0].ui.draw(undefined, undefined, undefined, undefined);
        arr[1].ui.draw(undefined, undefined, undefined, undefined);
        arr[2].ui.draw(undefined, undefined, undefined, undefined);
    }
}

class UIObject{
    name;
    x;
    y;
    centerX; // x and y values of the center of the object. Based on width and height.
    centerY;
    z; // higher Z value means "closer" to the user. If two elements are nested and someone clicks inside the innermost one, the one with the higher Z-value (ideally the inner one) will have its onClick function called.
    width;
    height;
    image; // Reference to an Image object of the source image.

    // Creates an instance of the UIObject class. this constructor will draw the object if drawObject is true, which is the default value.
    constructor(name, image, x = 0, y = 0, z = 0, width = -1, height = -1, isCircle = false, drawObject = true, onClick = () => {console.log("Clicked " + this.name)}){
        this.name = name;
        this.image = image;
        this.x = x;
        this.y = y;
        this.z = z;

        // Change the distance function if it's a circle, so it's based on radius
        if (isCircle) this.containsPos = this.containsPosCircle;

        if (width == -1) this.width = image.width; // default width and height to the width and height of the image
        else this.width = width;
        if (height == -1) this.height = image.height;
        else this.height = height;
        this.onClick = onClick;

        this.centerX = x + (this.width / 2);
        this.centerY = y + (this.height / 2);

        if (drawObject){
            this.draw();
        }
    }

    // Draw the UI image
    draw(x = this.x, y = this.y, w = this.width, h = this.height){
        context.drawImage(this.image, x, y, w, h);
    }

    // the x and y values given here will be the x and y values of the center of the image
    drawCenter(x, y, w = this.width, h = this.height){
        context.drawImage(this.image, x - this.width / 2, y - this.height / 2, w, h);
    }

    // Can use to check if a click pos is inside this UI object. This might return true even if the object hasn't been drawn
    containsPos(x, y){
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    // Width is treated as radius, Checks if a position is inside a circle originating at the center of the image
    containsPosCircle(x, y){
        return Math.sqrt(Math.abs(x - this.centerX) ** 2 + Math.abs(y - this.centerY) ** 2) <= this.width / 2;
    }
}






// CANVAS LOGIC

let selectedCircle = null; // Which circle is highlighted. The selected social circle will recieve the action if one of the three action buttons (rizz, party, coalmine) is clicked
let startedGame = false; // This is used to stop the user from being able to click game ui before the game has started

const PT_INCREMENT = 10; // The amount by which score is modified per character. If a character recieves an action they like, your score will increase by PT_INCREMENT.
const PT_DECREMENT = 4; // same as above, but for dislikes.
let points = 0; // Tracks the number of points in the current game

let currentRound = 1; // Starts at 1 and finishes after round 20.
const MAXROUNDS = 20 // Max number of rounds, inclusive.



// TODO: Add button logic, add rounds, points, games, high score, merge with other branches.



// Create the UIObjects for the social circles and the selection circle (add buttons here later?)
function initializeUI(){
    //draw the 3 social circles
    UIObjects["leftCircle"] = new UIObject("leftCircle", UIImages["blueCircle"], 0, 175, 2, 250, 250, true, false, onCircleClicked);
    UIObjects["middleCircle"] = new UIObject("middleCircle", UIImages["blueCircle"], 225, 0, 2, 250, 250, true, false, onCircleClicked);
    UIObjects["rightCircle"] = new UIObject("rightCircle", UIImages["blueCircle"], 450, 175, 2, 250, 250, true, false, onCircleClicked);
    
    //the background that renders behind the selected circle (draw this as mainCircle.x - 5 and mainCircle.y - 5 since it's wider and taller.)
    UIObjects["selectionCircle"] = new UIObject("selectionCircle", UIImages["purpleCircle"], 0, 0, 1, 260, 260, true, false, () => {});


    // buttons should be centered with the circles, but 40 pixels thinner
    UIObjects["partybtn"] = new UIObject("partybtn", UIImages["partybtn"], 20, 440, 3, 192, 40, false, false, () => {onButtonClicked(UIObjects["partybtn"]);});
    UIObjects["rizzbtn"] = new UIObject("rizzbtn", UIImages["rizzbtn"], 252, 440, 3, 192, 40, false, false, () => {onButtonClicked(UIObjects["rizzbtn"]);});
    UIObjects["coalminebtn"] = new UIObject("coalminebtn", UIImages["coalminebtn"], 484, 440, 3, 192, 40, false, false, () => {onButtonClicked(UIObjects["coalminebtn"]);});

    // Associate an action with the action buttons, to make it easier to score moves
    UIObjects["partybtn"].action = ACTIONS.INVITE;
    UIObjects["rizzbtn"].action = ACTIONS.RIZZUP;
    UIObjects["coalminebtn"].action = ACTIONS.COALMINE;
}


// Render all UIObjects in order of least to greatest Z-value
function renderUI(){
    // Draw selection circle if a circle has been selected
    if (selectedCircle != null){
        UIObjects["selectionCircle"].draw();
    }

    // Next, draw the social circles
    socialCircles["leftCircle"].draw(undefined, undefined, undefined, undefined);
    socialCircles["middleCircle"].draw(undefined, undefined, undefined, undefined);
    socialCircles["rightCircle"].draw(undefined, undefined, undefined, undefined);

    UIObjects["partybtn"].draw(undefined, undefined, undefined, undefined);
    UIObjects["coalminebtn"].draw(undefined, undefined, undefined, undefined);
    UIObjects["rizzbtn"].draw(undefined, undefined, undefined, undefined);

    // Gray out the buttons if a circle isn't selected, to make it clear that they can't be clicked
    if (selectedCircle == null){
        grayOut(UIObjects["partybtn"]);
        grayOut(UIObjects["coalminebtn"]);
        grayOut(UIObjects["rizzbtn"]);
    }
}

function startGame(){
    startedGame = true;
    clearCanvas();
    points = 0;
    renderUI();
}

// Either starts the next round or ends the game depending on the round number
function nextRound(){
    // do score stuff?
    console.log("You have " + points + " points.");

    if (currentRound < MAXROUNDS){ // Go to the next round if that wasn't the last round
        currentRound += 1;
        shuffleCharacters();
        renderUI();
    }
    else {
        // Otherwise, end the game
        endGame();
    }
}


// Does the selected action to the selected social circle, and then adds the points gained this round to your score before starting the next round or ending the game
function onButtonClicked(btn){
    console.log(btn.action);
    points += calculatePoints(getSocialCircle(selectedCircle), btn.action);
    nextRound();
}

// Calculates and returns the number of points an action will grant.
function calculatePoints(targetCircle, action){
    let pts = 0;
    Object.values(targetCircle.characters).forEach((char) => {
        if (char.like == action) pts += PT_INCREMENT;
        if (char.dislike == action) pts -= PT_DECREMENT; // probably won't need to check for a dislike if they already like an action, but better safe than sorry
    });

    return pts;
}

// Check if the score of the game is a new high score, prepare the game to be reset, display UI showing the game is over with the score (fade out?)
function endGame(){
    console.log("ended game.");
}



// Callback for when a social circle is clicked
function onCircleClicked(){
    // if this circle is already selected, deselect it. Otherwise, select it.
    if (selectedCircle == this){
        selectedCircle = null;
    }
    else {
        selectedCircle = this;
        let selectionCircle = UIObjects["selectionCircle"]
        selectionCircle.x = this.x - 5;
        selectionCircle.y = this.y - 5;
    }

    // Render UI
    clearCanvas();
    renderUI();
}

// Given a UIObject representing a social circle, return the social circle that represents that object.
// This is to be used to figure out which Social Circle selectedCircle is, because I don't want to refactor 
// all of the functions built on selectedCircle's UIObject type
function getSocialCircle(uiCircle){
    let circles = Object.values(socialCircles);
    for (let i = 0; i < circles.length; i++){
        if (circles[i].ui == uiCircle){
            return circles[i];
        }
    }

    // This shouldn't be possible, but just in case...
    console.error("Searching for a social circle that doesn't exist???");
}

function clearCanvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// grays out a ui element by drawing a gray box over it. if the arg is null, gray out the whole canvas
function grayOut(uiObject){
    if (uiObject == null){
        context.globalAlpha = 0.8;
        context.drawImage(UIImages["gray"], 0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;
        return;
    }
    context.globalAlpha = 0.8;
    context.drawImage(UIImages["gray"], uiObject.x, uiObject.y, uiObject.width, uiObject.height);
    context.globalAlpha = 1;
}

// Grabs the name of a source image from an img element without the file extension. 
// The idea is that we can name our UI images things like "loginButton.png" and then
// this function can be used to name the UI images.
function parseImgName(imgElement){
    let nameStr = imgElement.src;
    let out = "";
    let recordingChars = false;
    // traverse backwards through the string. Start recording chars after we pass a '.' (meaning we've finished the file extension)
    // and stop recording chars when we hit a '\' or a '/', because then we're getting into the path.
    for (let i = nameStr.length - 1; i >= 0; i--){
        if (nameStr[i] == '/' || nameStr[i] == '\\'){
            break;
        }
        if (recordingChars){
            out = nameStr[i] + out;
        }
        if (nameStr[i] == '.'){
            recordingChars = true;
        }
    }
    return out;
}

// parses a name from a file path
function parseSrcName(nameStr){
    let out = "";
    let recordingChars = false;
    // traverse backwards through the string. Start recording chars after we pass a '.' (meaning we've finished the file extension)
    // and stop recording chars when we hit a '\' or a '/', because then we're getting into the path.
    for (let i = nameStr.length - 1; i >= 0; i--){
        if (nameStr[i] == '/' || nameStr[i] == '\\'){
            break;
        }
        if (recordingChars){
            out = nameStr[i] + out;
        }
        if (nameStr[i] == '.'){
            recordingChars = true;
        }
    }
    return out;
}


// given an X and Y position of a click, return the UI element with the highest Z-value that was clicked. This can return null.
function getClickedElement(x, y){
    let clicked = null;
    for (let i = 0; i < Object.keys(UIObjects).length; i++){
        let obj = UIObjects[Object.keys(UIObjects)[i]];
        // if object was clicked and clicked hasn't been assigned or it has and its z-value is less than clicked's...
        if (obj.containsPos(x, y) && (clicked == null || clicked.z < obj.z)){
            clicked = obj;
        }
    }

    return clicked;
}

function getClickedElements(x, y){
    let clicked = [];
    for (let i = 0; i < Object.keys(UIObjects).length; i++){
        let obj = UIObjects[Object.keys(UIObjects)[i]];
        // if object was clicked and clicked hasn't been assigned or it has and its z-value is less than clicked's...
        if (obj.containsPos(x, y)){
            clicked.push(obj);
        }
    }

    return clicked;
}

function onCanvasClicked(event){
    // if the game hasn't started, just start it
    if (!startedGame){
        startGame();
        return;
    }


    //Get the position of the mouse click relative to the canvas (rather than the page)
    let x = event.x - canvas.getBoundingClientRect().x; // absolute pos of mouse click - absolute pos of canvas = pos of mouse relative to canvas
    let y = event.y - canvas.getBoundingClientRect().y;

    // Find which element was clicked by iterating theough the list and getting the element clicked with the highest Z-value
    // let clickedElements = getClickedElements(x, y);
    // if (clickedElements.length != 0){
    //     for (let i = 0; i < clickedElements.length; i++){
    //         clickedElements[i].onClick();
    //     }
    // }
    let clickedElement = getClickedElement(x, y);
    if (clickedElement != null){
        clickedElement.onClick();
    }

}


















// SETUP CALLBACKS

// wait until DOM is loaded so we can reference images without worrying about if they're loaded or not
function onDOMLoaded(event){
    // Store character images in characterImages
    characterImageHolder.querySelectorAll("img").forEach((img, index) => {
        let image = new Image();

        // NEED AN ARRAY STORING EVERY IMAGE, DONT INSTANTIATE THEM HERE (because there will be duplicates of some), DO IT MANUALLY IN initializeUI()

        image.src = img.src; 
        characterImages[parseImgName(img)] = image;
    });

    // Create and store UI objects
    uiImageHolder.querySelectorAll("img").forEach((img, index) => {
        let image = new Image();
        image.src = img.src;
        UIImages[parseImgName(img)] = image;
    });
    
    // Create all of the UI objects
    initializeUI();

    // Generate the list of characters for the game
    generateCharacters();

    // Create the social circles and assign the characters to them
    createSocialCircles();

    // then, render the UI
    renderUI();

    // Now, we can gray out the screen until they click the canvas to start the game
    grayOut(null);
}