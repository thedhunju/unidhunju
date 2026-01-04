// db.js
const mysql = require('mysql2');//import mysql2, a Node.js module that acts as an interpreter
require('dotenv').config();/**node has a built in object called process.env where the environment variables live
the function Loads everything inside the .env file and put it into process.env 
require func loads the object and .config parses KEY=VALUE lines into process.env. so my code can use it.
 */
/**Pool: Buses are already running → these are pre-open MySQL connections.

Passengers (your API requests) hop onto any free bus.

When the ride is done, the bus returns to the stand.

No creating, no tearing down, no waiting. */
const pool = mysql.createPool({ //mysql.createPool(): creates a pool of connections to the database,by default 10 connections
  host: process.env.DB_HOST, //After loading dotenv, you can access your .env variables
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

module.exports = pool.promise(); //This lets you use the database connection in other files and allows using promises:
