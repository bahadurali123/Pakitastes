const name_field = document.getElementById("name");
const email_field = document.getElementById("email");
const discription_field = document.getElementById("discription");
const file_logo = document.getElementById("filelogo");
const file_banner = document.getElementById("filebanner");
const save_store = document.getElementById("create-btn");
const message = document.getElementById("message");

// const url = "/bahadur/v1/store/create";
const url = "/bahadur/v1/store/createstore";

const create_store = async () => {
    try {
        const mess = document.getElementById("message");

        event.preventDefault();
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

        console.log("Url: ", logo);
        console.log("Url banner: ", banner);
        console.log("Form daata is :", formData);
        console.log("Message getter: ", message);
        console.log("Mess getter: ", mess);

        const createStore = await fetch(url, {
            method: "POST",
            body: formData,
        });

        const response = await createStore.json();
        mess.innerText = response.message;
        message.innerText = response.message;
        console.log("Response Create store: ", response);
        if (response.message === 'Store ceation successfuly complete!') {
            window.location.pathname = '/bahadur/v1/store';
        }
    } catch (error) {
        console.log("Error", error);
    }
};

save_store.addEventListener("click", create_store);