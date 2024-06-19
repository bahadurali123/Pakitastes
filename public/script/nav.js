    // for active page
    console.log("this is the cart page")
    var url = window.location.href;
    var path = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/') + 1);
    var files = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('?'));
    // var links = document.querySelectorAll('nav a');
    var links = document.querySelectorAll('#hed_section_2 a');
    // console.log("Url",url)
    // console.log("Path",path)
    // console.log("File", files)
    // console.log("Links", links)
    
    links.forEach(key => {
        // console.log("links", key.href.includes(`${path}`))
        if (key.href.includes(`${path}`)) {
            // console.log("Bahadur", key.pathname)
            // console.log("Value", key.pathname===`/${filename}`)
            if (key.pathname === `${path}`) {
            // if (key.pathname === `/${filename}`) {
                // console.log("links", key.pathname)
                key.classList.add('active');
            }
            if (key.pathname === `/${files}`) {
                // console.log("links 2", key.pathname)
                key.classList.add('active');
            }
        }
    });