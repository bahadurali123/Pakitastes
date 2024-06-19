import dotenv from "dotenv"
import connection from './backend/config/db.js'
import app from './backend/app.js'

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 7777;
// console.log('URI', process.env.DB_URI);


app.listen(PORT, () => {
    console.log(`Server serves at Port: http://localhost:${PORT}`);
})