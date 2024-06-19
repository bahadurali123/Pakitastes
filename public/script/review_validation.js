document.getElementById('message').textContent = 'Make sure you are logged in before leaving a review!';

document.getElementById('reviewForm').addEventListener('submit', function(event) {
    // Prevent form submission
    event.preventDefault();
  
  
    // Get form values
    // const name = document.getElementById('name').value.trim();
    // const email = document.getElementById('email').value.trim();
    // const image = document.getElementById('image').files[0];
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value.trim();
  
    // Validate form fields
    let valid = true;
    let message;
    // // Name validation
    // if (name === '') {
    //   message = 'Name is required.';
    //   valid = false;
    // }
  
    // // Email validation
    // if (email === '') {
    //   message = 'Email is required.';
    //   valid = false;
    // } else if (!validateEmail(email)) {
    //   message = 'Invalid email format.';
    //   valid = false;
    // }
  
    // Rating validation
    if (rating === '') {
      message = 'Rating is required.';
      valid = false;
    }
  
    // Review validation
    if (review === '') {
      message = 'Review text is required.';
      valid = false;
    }
  
//     // Image validation
//     if (!image) {
//       message = 'Image is required.';
//       valid = false;
//     } else if (!validateImage(image)) {
//     message = 'Invalid image format.';
//     valid = false;
// }

// If the form is valid, submit it (this is where you would normally send the data to the server)
if (valid) {
    // alert('Form submitted successfully!');
    document.getElementById('message').textContent = 'Form submitted successfully!';
    // Normally you would submit the form here, for example:
    document.getElementById('reviewForm').submit();
}else {
          document.getElementById('message').textContent = message;
    }
  });
  
  // // Function to validate email format
  // function validateEmail(email) {
  //   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return re.test(email);
  // }
  
  // // Function to validate image file type
  // function validateImage(image) {
  //   const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  //   return validImageTypes.includes(image.type);
  // }
  