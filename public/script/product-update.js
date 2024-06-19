const name_field = document.getElementById("name");
const price_field = document.getElementById("price");
const stock_field = document.getElementById("stock");
const discription_field = document.getElementById("discription");
const category_field = document.getElementById("category");
const picture_field = document.getElementById("picture");
const save_product = document.getElementById("save_product");
// console.log(name_field);


const url = window.location.pathname;
let name, price, stockQty, discription;
let category;
const getData = async () => {
    try {
        // console.log("This is the product page!", name_field, price_field);
        const data = await fetch(`${url}/json`);
        const d = await data.json();
        const categorys = d.catg;
        const product = d.gproduct;
        // const { name, price, stockQty, discription } = product;
        // let category;
        ({ name, price, stockQty, discription } = product);
        // Find selected category
        for (const item in categorys) {
            if (categorys[item]._id === product.categoryId) {
                category = categorys[item].name;
            }
        };
        // set values to inputs
        console.log("File", picture_field, name_field);
        name_field.value = name;
        price_field.value = price;
        stock_field.value = stockQty;
        discription_field.value = discription;
        for (const item in categorys) {
            categ = categorys[item].name;
            const option = document.createElement('option');
            option.value = categ;
            option.text = categ;
            category_field.appendChild(option);
        }
        category_field.value = category;
        console.log(`Name:${name} Price:${price} StocK:${stockQty} Discip:${discription} Categ:${category}`);
        console.log("Response2 : ", d);
    } catch (error) {
        console.log("Error", error);
    }
};
const updata_product = async () => {
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
        const updateProduct = await fetch(url, {
            method: "PUT",
            body: formData,
        });
        const response = await updateProduct.text();
        console.log("Response Update: ", response);
    } catch (error) {
        console.log("Error", error);
    }
}
getData();
save_product.addEventListener("click", updata_product);