// Handle  increment and decrement categories.
let quantity_decrease_buttons = document.querySelectorAll(".quantity-decrease");
let quantity_total_elements = document.querySelectorAll(".quantity-total p");
let quantity_increase_buttons = document.querySelectorAll(".quantity-increase");
let product_delete_buttons = document.querySelectorAll(".item-actions .delete");
let product_id_elements = document.querySelectorAll(".product-items .product-id");

// Add event listeners to each "quantity-decrease" button
quantity_decrease_buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
        decreaseQuantity(index);
    });
});
quantity_increase_buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
        increaseQuantity(index);
    });
});

// Function to decrease quantity
const decreaseQuantity = (index) => {
    let quantity_val = parseInt(quantity_total_elements[index].innerText);
    quantity_val = quantity_val > 1 ? quantity_val - 1 : quantity_val;
    quantity_total_elements[index].textContent = quantity_val;
};

// Function to increase quantity
const increaseQuantity = (index) => {
    let quantity_val = parseInt(quantity_total_elements[index].innerText);
    quantity_val = quantity_val + 1;
    quantity_total_elements[index].textContent = quantity_val;
};

    // ............For add cart items in cart....................
    const addtocart = document.getElementById("addtocart");
    const  addoncart = async ()=>{
        const quant_total = document.getElementById("quantity-total").innerText;
        const prod_is = document.getElementById("prod-is").innerText;
        const quantity = parseInt(quant_total);
    console.log("Add to cart", parseInt(quant_total), "and :", prod_is);
    const prodaddrequset = await fetch("/bahadur/v1/product/add",{
        method: "POST",
        headers: {
            "Content-type":"application/json"
        },
        body: JSON.stringify({
            prod_is,
            quantity
        })
    });
    const respon = await prodaddrequset.json();
    console.log("responce",respon);
};
addtocart.addEventListener("click", addoncart);