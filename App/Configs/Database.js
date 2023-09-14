import dotenv from "dotenv";
import mongoose from "mongoose";

const env = dotenv.config().parsed;

mongoose.set("strictQuery", true);

let dbName = {};
env.STATUS == 'PRODUCTION' ? dbName = 'KOREKSISOAL' : dbName = 'KOREKSISOAL-DEV';

const connection = () => {
  mongoose.connect(env.DB_URL, {
    dbName
  });

  const con = mongoose.connection;
  con.on("error", console.error.bind(console, "connection error :"));
  con.once("open", () => {
    console.log(`Connect to MongoDB`);
  });
};

export default connection;
