const name_field = document.getElementById("name");
const price_field = document.getElementById("price");
const stock_field = document.getElementById("stock");
const discription_field = document.getElementById("discription");
const category_field = document.getElementById("category");
const picture_field = document.getElementById("picture");
const save_product = document.getElementById("save_product");
// console.log(name_field);


// const url = window.location.pathname;
const url = "/bahadur/v1/store/product/create";

const create_product = async () => {
    try {
        const name = name_field.value;
        const price = price_field.value;
        const stockQty = stock_field.value;
        const discription = discription_field.value;
        const category = category_field.value;
        const image = picture_field.files[0];

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('stockQty', stockQty);
        formData.append('discription', discription);
        formData.append('category', category);
        formData.append('image', image);

        console.log("Url: ", image);
        console.log("Form daata is :", formData);

        const createProduct = await fetch(url, {
            method: "POST",
            body: formData,
        });
        const response = await createProduct.json();
        if (response.message === 'Successfully create product!') {
            window.location.pathname = '/bahadur/v1/store/your/products';
        }
        console.log("Response create2 : ", response);
    } catch (error) {
        console.log("Error", error);
    }
};

save_product.addEventListener("click", create_product);