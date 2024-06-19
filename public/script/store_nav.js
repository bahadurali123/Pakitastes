const close_btn = document.getElementById("close-btn");
const open_btn = document.getElementById("open-btn");
const nav_section = document.getElementById("nav-section");
close_btn.addEventListener("click", ()=>{
    nav_section.style.transform = "translateX(-200px)";
    close_btn.setAttribute("class", "rotatebtn");
    setTimeout(() => {
        open_btn.style.display = "block";
        close_btn.removeAttribute("class", "rotatebtn");
    }, 4000);
})
open_btn.addEventListener("click", ()=>{
    nav_section.style.transform = "translateX(200px)";
    close_btn.setAttribute("class", "rotatebtn");
    open_btn.style.display = "none";
    setTimeout(() => {
        close_btn.removeAttribute("class", "rotatebtn");
    }, 4000);
});