const name_field = document.getElementById("name");
const email_field = document.getElementById("email");
// const discription_field = document.getElementById("discription");
const file_field = document.getElementById("file");
const update_btn = document.getElementById("update-btn");

console.log("This is testing");
const url = window.location.pathname;
// const url = "/bahadur/v1/store/update";

const update_user = async () => {
    try {
        const name = name_field.value;
        const email = email_field.value;
        // const description = discription_field.value;
        const picture = file_field.files[0];

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        // formData.append('description', description);
        formData.append('picture', picture);

        const createUser = await fetch(url, {
            method: "PUT",
            body: formData,
        });
        const response = await createUser.json();
        console.log("User result is: ", response);
    } catch (error) {
        console.log("Error", error);
    }
};

update_btn.addEventListener("click", update_user);