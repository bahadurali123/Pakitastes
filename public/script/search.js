// Get references to DOM elements
const searchSection = document.getElementById("search-section");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// Function to handle the search logic
const performSearch = async (input) => {
    try {
        const response = await fetch(`/bahadur/v1/search/${input}`);

        if (!response.ok) {
            console.error('Network response was not ok');
        }

        if (response.ok) {
            console.log("In res");
            window.location.href = `/bahadur/v1/search/${input}`;
        }
        // const searchData = await response.text();
        // // const searchData = await response.json();
        // console.log("Search Data:", searchData);
    } catch (error) {
        console.error("Error during fetch:", error);
    }
};

// Event handler for keyup events in the search section
const handleKeyUp = async (event) => {
    // console.log("Key:", event.key);
    if (event.key === "Enter") {
        const input = searchInput.value;
        await performSearch(input);
    }
};

// Event handler for the search button click event
const handleSearchClick = async () => {
    const input = searchInput.value;
    await performSearch(input);
};

// Add event listeners
searchSection.addEventListener("keyup", handleKeyUp);
searchBtn.addEventListener("click", handleSearchClick);
