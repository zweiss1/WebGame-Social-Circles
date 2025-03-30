// Wait until all of the DOM is loaded before grabbing images, so we can be sure that they've been loaded
window.addEventListener("load", onDOMLoaded); // Interestingly, the event type "DOMContentLoaded" doesn't wait for things like CSS and images, while "load" does.

// DOM REFERENCES
const canvas = document.getElementById("gameCanvas"); // game canvas
const context = canvas.getContext("2d"); // graphics context of game canvas

const imageHolder = document.getElementById("imageStorage"); // hidden div in which images are loaded so we can use them here. I'm using it so I can render images from the server on the canvas.
const characterImages = [];

console.log("test");

function onDOMLoaded(event){
    console.log("test");
    imageHolder.querySelectorAll("img").forEach((img, index) => {
        console.log("Loading an image called: " + img.src);
        let image = new Image();
        image.src = img.src;
        characterImages.push(image);
    });
    characterImages.forEach((image, i) => {
        context.drawImage(image, 0, 0, 100, 100);
        console.log("drew image");
    });
}