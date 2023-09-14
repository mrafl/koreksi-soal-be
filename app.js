import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import router from "./App/Routes/Index.js";
import connection from "./App/Configs/Database.js";

const app = express();
const env = dotenv.config().parsed;
const port = env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
     extended: false
}));

const corsOptions = {
     origin: ['http://localhost:5556'],
};
app.use(cors(corsOptions));

app.use(env.PATH, express.static("."));
app.use(env.PATH, router);

// catch 404
app.use((req, res, next) => {
     res.status(404).json({
          message: "404_NOT_FOUND"
     });
});

// error handler
app.use((req, res, next) => {
     if (env.STATUS == 'PRODUCTION') {
          res.status(500).json({
               message: 'REQUEST_FAILED'
          });
     } else {
          next();
     }
});

connection();

app.listen(port, () => {
     console.log(`App berjalan pada port ${port}`);
});