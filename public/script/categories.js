const contaner = document.querySelectorAll("#categories-section-2 a");
const videos = document.querySelectorAll("#categories-section-2 video");

contaner.forEach((button, index) => {
    button.addEventListener("mouseenter", () => {
        const video = videos[index];
        video.play();
    });
});