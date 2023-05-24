/**
 * This file sets up a PostgreSQL database client using the 'pg' library. 
 * The client is configured with a connection string that includes the credentials for connecting to a remote ElephantSQL database. 
 * The custom client is then connected to the database and exported, so it can be imported and used by other modules, such as the controller.js file.
 */
const { Client } = require('pg');

const customClient = new Client({
  connectionString: 'postgres://gbugoyro:oH5QSnOST81pevgHQALtHe1Pig7yZTHk@dumbo.db.elephantsql.com:5432/gbugoyro',
  //connectionString : 'postgres://netbook:netbook@localhost:5432/db_prog_web'
});

customClient.connect();

module.exports = customClient;
