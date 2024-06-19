// for bookmarks
const tot_store_bookmarks = document.getElementById("tot-store-bookmarks");
const tot_products_bookmarks = document.getElementById("tot-products-bookmarks");
const store_body = document.getElementById("store-body");
const products_body = document.getElementById("products-body");

products_body.style.display = "none";
tot_store_bookmarks.style.color = "red";

tot_store_bookmarks.addEventListener('click', ()=>{
    store_body.style.display = "contents";
    products_body.style.display = "none";
    tot_store_bookmarks.style.color = "red";
    tot_products_bookmarks.style.color = "black";
});
tot_products_bookmarks.addEventListener('click', ()=>{
    products_body.style.display = "contents";
    store_body.style.display = "none";
    tot_products_bookmarks.style.color = "red";
    tot_store_bookmarks.style.color = "black";
});