// for retings
const product_total_rating = document.getElementById("product-total-rating");
const store_total_rating = document.getElementById("store-total-rating");
const product_h2 = document.querySelector("#product-total-rating .pname");
const store_h2 = document.querySelector("#store-total-rating .sname");
const products_reviews_section = document.getElementById("products-reviews-section");
const store_reviews_section = document.getElementById("store-reviews-section");


products_reviews_section.style.display = "none";
store_h2.style.color = "red";
console.log(store_h2)

store_total_rating.addEventListener('click', ()=>{
    store_reviews_section.style.display = "grid";
    products_reviews_section.style.display = "none";
    store_h2.style.color = "red";
    product_h2.style.color = "black";
});
product_total_rating.addEventListener('click', ()=>{
    products_reviews_section.style.display = "grid";
    store_reviews_section.style.display = "none";
    store_h2.style.color = "black";
    product_h2.style.color = "red";
});