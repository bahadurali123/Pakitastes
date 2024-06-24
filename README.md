# [Pakitastes](https://pakitastes.vercel.app/bahadur/v1/commerce)



Welcome to Pakitastes, where we bring the rich flavors of traditional Pakistani cuisine right to your table.
Pakitastes is a e-commerce platform showcasing traditional Pakistani cuisine. It offers a robust and scalable solution that integrates various technologies to ensure a seamless shopping experience.

### Key Features
**Tech Stack:** Built using Node.js and Express for the backend, MongoDB for database management, and EJS as a template engine for server-side rendering.

**Authentication:** By integrating Google Authentication and bcrypt, we have ensured a high level of security for user data.

**Payment Gateway:** Integrates secure payment gateways for safe transactions.

**Optimal Image Handling:** Cloudinary integration has improved the way we manage and serve images, providing faster load times and better user engagement.

**Reliable Communication:** Nodemailer has enabled us to implement robust email functionalities for user verification and notifications.

## Public API Documentation

For detailed information about the API endpoints, request parameters, and responses, please visit the [Pakitastes Postman Documentation](https://documenter.getpostman.com/view/34344601/2sA3XY6J2W).

## Project Setup

### Prerequisites

- Node.js
- npm

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/bahadurali123/Pakitastes.git
    cd pakitastes
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Create a `.env` file in the root directory and add the following environment variables:**
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    CLOUDINARY_URL=your_cloudinary_url
    JWT_SECRET=your_jwt_secret
    ```

4. **Start the server:**
    ```bash
    npm start
    ```

5. **Access the API:**
    Use the provided endpoints to interact with the Pakitastes application. Refer to the [public API documentation](https://documenter.getpostman.com/view/34344601/2sA3XY6J2W) for details on available endpoints and usage.


