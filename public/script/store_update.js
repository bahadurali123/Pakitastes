const name_field = document.getElementById("name");
const email_field = document.getElementById("email");
const discription_field = document.getElementById("discription");
const file_logo = document.getElementById("filelogo");
const file_banner = document.getElementById("filebanner");
const update_btn = document.getElementById("update-btn");
const message = document.getElementById("message");

console.log("This is testing");
console.log("logo: ", file_logo, "Banner: ", file_banner);
// const url = window.location.pathname;
const url = "/bahadur/v1/store/update";
let name, email, description;
const getData = async () => {
    try {
        const response = await fetch(`${url}/json`);
        console.log("Data: ", response);
        const d = await response.json();
        const store = d.data;

        ({ name, email, description } = store);

        // set values to inputs
        name_field.value = name;
        email_field.value = email;
        discription_field.value = description;
        console.log(`Name:${name} Email:${email} Discip:${description}`);
    } catch (error) {
        console.log("Error", error);
    }
};

const update_store = async () => {
    try {
        const name = name_field.value;
        const email = email_field.value;
        const description = discription_field.value;
        const logo = file_logo.files[0];
        const banner = file_banner.files[0];

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('description', description);
        formData.append('logo', logo);
        formData.append('banner', banner);

        const createStore = await fetch(url, {
            method: "PUT",
            body: formData,
        });
        const response = await createStore.json();
        message.innerText = response.message;
    } catch (error) {
        console.log("Error", error);
    }
};
getData();
update_btn.addEventListener("click", update_store);