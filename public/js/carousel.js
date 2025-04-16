const buttons = document.querySelectorAll("[data-carousel-button]"); //Gets the previous and next buttons

buttons.forEach(button => {
    button.addEventListener("click", () =>{ //adding event listener for both buttons
        const offset = button.dataset.carouselButton === "next" ? 1 : -1; //checking if we clicked the previous or next button
        const slides = button.closest("[data-carousel]").querySelector('[data-slides]');

        const activeSlide = slides.querySelector("[data-active]"); //gets the active slide
        let newIndex = [...slides.children].indexOf(activeSlide) + offset //moves to next or previous slide based of which button pressed
        if(newIndex < 0) newIndex=slides.children.length -1; //looping from first to last and last to first slide
        if(newIndex >=slides.children.length) newIndex=0;

        slides.children[newIndex].dataset.active=true;
        delete activeSlide.dataset.active;
    });
});