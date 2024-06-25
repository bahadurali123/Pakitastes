// Handle  increment decrement quantity and delete cart product.
let quantity_decrease_buttons = document.querySelectorAll(".quantity-decrease");
let quantity_total_elements = document.querySelectorAll(".quantity-total p");
let quantity_increase_buttons = document.querySelectorAll(".quantity-increase");
let product_delete_buttons = document.querySelectorAll(".item-actions .delete");
let product_bookmark_buttons = document.querySelectorAll(".item-actions .bookmark");
let product_like_buttons = document.querySelectorAll(".item-actions .like");
let product_id_elements = document.querySelectorAll(".product-items .product-id");
const urlis = window.location.origin;

// Add event listeners to each "quantity-decrease" button
product_delete_buttons.forEach((button, index) => {
    // button.addEventListener("click", deleteProduct(index));
    button.addEventListener("click", () => {
        deleteProduct(index);
        location.reload();
    });
});
product_bookmark_buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
        bookmarkProduct(index);
        location.reload();
    });
});
product_like_buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
        likeProduct(index);
        location.reload();
    });
});

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

// Function to decrease and increase quantity
const decreaseQuantity = (index) => {
    let quantity_val = parseInt(quantity_total_elements[index].innerText);
    quantity_val = quantity_val > 1 ? quantity_val - 1 : quantity_val;
    quantity_total_elements[index].textContent = quantity_val;
    const itemId = product_id_elements[index].innerText;
    updataProduct(index, itemId, quantity_val)
};
const increaseQuantity = (index) => {
    let quantity_val = parseInt(quantity_total_elements[index].innerText);
    quantity_val = quantity_val + 1;
    quantity_total_elements[index].textContent = quantity_val;
    const itemId = product_id_elements[index].innerText;
    updataProduct(index, itemId, quantity_val)
};

// Put request for update given product.
const updataProduct = async (index, product, quantity) => {
    console.log("Index is thsi: ", index);
    console.log("Product is thsi: ", product);
    console.log("Quantity is thsi: ", quantity);
    const update = await fetch(`${urlis}/bahadur/v1/product/update`, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            producId: product,
            quantity,
        })
    });
    // const update_response = await update.json();
    // console.log("Update response is: ", update_response);
    console.log("Update response is: ", update);
};

// Post request for delete given product.
const deleteProduct = async (index) => {
    const itemId = product_id_elements[index].innerText;
    console.log("Delete function is: ", index);
    const deleteProductRequest = await fetch(`${urlis}/bahadur/v1/product/delete`, {
        method: "Post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            itemId
        })
    });
    const response = await deleteProductRequest.json();
    console.log("Delete response: ", response);
    // console.log("Delete response: ", deleteProductRequest);
};

// Post request for Bookmark given product.
const bookmarkProduct = async (index) => {
    const itemId = product_id_elements[index].innerText;
    console.log("Bookmark function is: ", index);
    const bookmarkProductRequest = await fetch(`${urlis}/bahadur/v1/product/bookmark`, {
        method: "Post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            itemId
        })
    });
    const response = await bookmarkProductRequest.json();
    console.log("Bookmark response: ", response);
    alert(`${response.message}`);
};

// Post request for Like given product.
const likeProduct = async (index) => {
    const itemId = product_id_elements[index].innerText;
    console.log("Like function is: ", index, itemId);
    const likeProductRequest = await fetch(`${urlis}/bahadur/v1/product/like`, {
        method: "Post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            itemId
        })
    });
    const response = await likeProductRequest.json();
    console.log("Like response: ", response);
    alert(`${response.message}`);
};