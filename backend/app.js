import express from "express"
import cookieParser from "cookie-parser";
// import { Template } from "ejs";
import ejs from "ejs";

const app = express();


app.use(express.static("public")); //used to serve static files
app.use(express.json()); //Its parse the incoming request bodies with JSON payloads. When a client sends a POST, PUT, PATCH, or DELETE request
app.use(cookieParser()); //its handle the cookies
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

// import routes
import route from './routes/routes.js'

// declare routes
app.use('/bahadur/v1',route);

export default app;