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
        this.ui = new UIObject(name, img, x, y, 3, 75, 75, true, true, undefined);
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

function shuffleCharacters(){
    // Turn the characters into an array
    let chars = [];
    chars.push(socialCircles["leftCircle"].character1);
    chars.push(socialCircles["leftCircle"].character2);
    chars.push(socialCircles["leftCircle"].character3);
    chars.push(socialCircles["middleCircle"].character1);
    chars.push(socialCircles["middleCircle"].character2);
    chars.push(socialCircles["middleCircle"].character3);
    chars.push(socialCircles["rightCircle"].character1);
    chars.push(socialCircles["rightCircle"].character2);
    chars.push(socialCircles["rightCircle"].character3);

    // Now, shuffle the array (3 times for good measure)
    shuffle(chars);
    shuffle(chars);
    shuffle(chars);

    // Now, put the characters in the slots
    socialCircles["leftCircle"].character1 = chars.pop();
    socialCircles["leftCircle"].character2 = chars.pop();
    socialCircles["leftCircle"].character3 = chars.pop();
    socialCircles["middleCircle"].character1 = chars.pop();
    socialCircles["middleCircle"].character2 = chars.pop();
    socialCircles["middleCircle"].character3 = chars.pop();
    socialCircles["rightCircle"].character1 = chars.pop();
    socialCircles["rightCircle"].character2 = chars.pop();
    socialCircles["rightCircle"].character3 = chars.pop();
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

        let arr = Object.values(this.characters);

        // create positions to draw the characters at inside of the circle. They should make a triangle.
        arr[0].ui.x = (this.ui.centerX - (this.ui.width / 4)) - (arr[0].ui.width / 2);
        arr[0].ui.y = (this.ui.centerY + (this.ui.height / 4)) - (arr[0].ui.height / 2);
        //this.charCenterPos1X = this.ui.centerX - (this.ui.width / 4);
        //this.charCenterPos1Y = this.ui.centerY + (this.ui.height / 4);

        arr[1].ui.x = this.ui.centerX - (arr[1].ui.width / 2);
        arr[1].ui.y = (this.ui.centerX - (this.ui.height / 4)) - (arr[1].ui.height / 2);
        // this.charCenterPos2X = this.ui.centerX;
        // this.charCenterPos2Y = this.ui.centerY - (this.ui.height / 4);

        arr[2].ui.x = (this.ui.centerX + (this.ui.width / 4)) - (arr[2].ui.width / 2);
        arr[2].ui.y = (this.ui.centerY + (this.ui.height / 4)) - (arr[2].ui.height / 2);
        // this.charCenterPos3X = this.ui.centerX + (this.ui.width / 4);
        // this.charCenterPos3Y = this.ui.centerY + (this.ui.height / 4);

        arr[0].draw(undefined, undefined, undefined, undefined);
        arr[1].draw(undefined, undefined, undefined, undefined);
        arr[2].draw(undefined, undefined, undefined, undefined);
    }

    draw(x, y, w, h){
        // Draw the social circle first, since the characters are rendered on top of it
        this.ui.draw(x, y, w, h);

        // Then draw the characters. I'm using drawCenter because it's easier to think about positions of images being based on their centers rather than their top left corners.
        let arr = Object.keys(this.characters);
        arr[0].drawCenter(this.charCenterPos1X, this.charCenterPos1Y, undefined, undefined);
        arr[1].drawCenter(this.charCenterPos2X, this.charCenterPos2Y, undefined, undefined);
        arr[2].drawCenter(this.charCenterPos3X, this.charCenterPos3Y, undefined, undefined);
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

let selectedCircle = null;

function initializeUI(){
    //draw the 3 social circles
    UIObjects["leftCircle"] = new UIObject("leftCircle", UIImages["blueCircle"], 0, 175, 2, 250, 250, true, true, onCircleClicked);
    UIObjects["middleCircle"] = new UIObject("middleCircle", UIImages["blueCircle"], 225, 0, 2, 250, 250, true, true, onCircleClicked);
    UIObjects["rightCircle"] = new UIObject("rightCircle", UIImages["blueCircle"], 450, 175, 2, 250, 250, true, true, onCircleClicked);
    
    //the background that renders behind the selected circle (draw this as mainCircle.x - 5 and mainCircle.y - 5 since it's wider and taller.)
    UIObjects["selectionCircle"] = new UIObject("selectionCircle", UIImages["blueCircle"], 0, 0, 1, 260, 260, true, false, undefined);
}


// Render all canvas objects in order of least to greatest Z-value
function renderUI(){
    let keys = Object.keys(UIObjects);
    keys.sort((key1, key2) => UIObjects[key1].z - UIObjects[key2].z);
    console.log(keys);
    keys.forEach((key, i) => {
        console.log(key);
        console.log(UIObjects[key].z);
    });

    for (let i = 0; i < keys.length; i++){
        let obj = UIObjects[keys[i]];

        // only draw the selection circle if a circle has been selected
        if (keys[i] != "selectionCircle" || keys[i] == "selectionCircle" && selectedCircle != null){
            obj.draw();
        }
    }
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

function clearCanvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
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
    
}