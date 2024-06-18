// import { log } from "console";
//import fs from "fs";
import express  from "express";
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import cors from "cors";
import {fileURLToPath}  from 'url';
import {dirname} from 'path';


//Roytes
import categoriesRoutes from "./routes/categorys.js";
import productsRoutes from "./routes/products.js";
import usersRoutes from "./routes/users.js";
import ordersRoutes from "./routes/orders.js"
import messagesRoutes from './routes/messages.js';
import authJwt from "./helpers/jwt.js";
import errorHandler from "./helpers/jwt.js";

dotenv.config() ;
const app = express();
const PORT = 9000;
const api = process.env.API_URL 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//middeware
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.options('*',cors())
app.use(authJwt())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler())

app.use(`${api}/categorys`, categoriesRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/orders`, ordersRoutes)
app.use(`${api}/messages`, messagesRoutes);


mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,  
    useUnifiedTopology: true,
    dbName: 'I-SHOP' 
})
.then(() => {
    console.log('Database connection is ready...');
})
.catch((err) => { 
    console.log(err);
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})