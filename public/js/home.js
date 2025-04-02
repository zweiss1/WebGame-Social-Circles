// Wait until all of the DOM is loaded before grabbing images, so we can be sure that they've been loaded
window.addEventListener("load", onDOMLoaded); // Interestingly, the event type "DOMContentLoaded" doesn't wait for things like CSS and images, while "load" does.

// DOM REFERENCES
const canvas = document.getElementById("gameCanvas"); // game canvas
const context = canvas.getContext("2d"); // graphics context of game canvas

const characterImageHolder = document.getElementById("characterImageStorage"); // hidden div in which images are loaded so we can use them here. I'm using it so I can render images from the server on the canvas.
const uiImageHolder = document.getElementById("uiImageStorage"); // same as characterImageHolder but for ui images

const characterImages = []; //stores images for the game characters, to be rendered on the canvas

const UIObjects = []; // stores all of the buttons and interactive elements in the UI, so we can route clicks to them



// EVENT LISTENERS

canvas.addEventListener("click", onCanvasClicked); // onCanvasClicked will process the click event and call different functions based on where you clicked. It's like a router for clicks!



// CANVAS OBJECTS

class UIObject{
    name;
    x;
    y;
    z; // higher Z value means "closer" to the user. If two elements are nested and someone clicks inside the innermost one, the one with the higher Z-value (ideally the inner one) will have its onClick function called.
    width;
    height;
    image; // Reference to an Image object of the source image.

    // Creates an instance of the UIObject class. this constructor will draw the object if drawObject is true, which is the default value.
    constructor(name, image, x = 0, y = 0, z = 0, drawObject = true, onClick = () => {console.log("Clicked " + this.name)}){
        this.name = name;
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = image.width;
        this.height = image.height;
        this.onClick = onClick;

        if (drawObject){
            this.draw();
        }
    }

    // Draw the UI image
    draw(x = this.x, y = this.y, w = this.width, h = this.height){
        context.drawImage(this.image, x, y, w, h);
    }

    // Can use to check if a click pos is inside this UI object. This might return true even if the object hasn't been drawn
    containsPos(x, y){
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    // Width is treated as radius, Checks if a position is inside a circle originating at the center of the image
    containsPosCircle(x, y){
        
    }
}


// Lets us pair character images with the names of characters
class CharacterImage{
    constructor(name, image){
        this.name = name; // name of the character
        this.image = image; // Image object
    }
}




// CANVAS LOGIC

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

// given an X and Y position of a click, return the UI element with the highest Z-value that was clicked. This can return null.
function getClickedElement(x, y){
    let clicked = null;
    for (let i = 0; i < UIObjects.length; i++){
        // if object was clicked and curr hasn't been assigned or it has and its z-value is less than 
        if (UIObjects[i].containsPos(x, y) && (clicked == null || clicked.z < UIObjects[i].z)){
            clicked = UIObjects[i];
        }
    }

    return clicked;
}

function onCanvasClicked(event){
    //Get the position of the mouse click relative to the canvas (rather than the page)
    let x = event.x - canvas.getBoundingClientRect().x; // absolute pos of mouse click - absolute pos of canvas = pos of mouse relative to canvas
    let y = event.y - canvas.getBoundingClientRect().y;

    // Find which element was clicked by iterating theough the list and getting the element clicked with the highest Z-value
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
        image.src = img.src;
        characterImages.push(image);
    });
    characterImages.forEach((image, i) => { //remove this when testing is done
        context.drawImage(image, 0, 0, 100, 100);
    });

    // Create and store UI objects
    uiImageHolder.querySelectorAll("img").forEach((img, index) => {
        let image = new Image();
        image.src = img.src;
        console.log(img);
        console.log(img.src);
        console.log(parseImgName(img));
        UIObjects.push(new UIObject(parseImgName(img), image, 100, 100, undefined, true, undefined));
    });

}