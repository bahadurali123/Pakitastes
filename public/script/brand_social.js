const bookmark = document.getElementById("bookmark");
const like = document.getElementById("like");

bookmark.addEventListener("click", async () => {
    const brandId = document.querySelector("#brand-is").innerText;
    // const itemId = product_id_elements[index].innerText;
    console.log("Bookmark function is: ", brandId);
    const bookmarkBrandRequest = await fetch("/bahadur/v1/brand/bookmark", {
        method: "Post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            brandId
        })
    });
    const response = await bookmarkBrandRequest.json();
    console.log("Bookmark response: ", response);
    alert(`${response.message}`);
    location.reload();
    // console.log("Click on Bookmark btn");
});

like.addEventListener("click", async () => {
    const brandId = document.querySelector("#brand-is").innerText;
    console.log("Like function is: ", brandId);

    const likeProductRequest = await fetch("/bahadur/v1/brand/like", {
        method: "Post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            brandId
        })
    });
    const response = await likeProductRequest.json();
    console.log("Like response: ", response);
    alert(`${response.message}`);
    location.reload();
    // console.log("Click on Like btn");
});