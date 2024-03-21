import express from "express";
const app = express();
import cors from "cors";

import { createPool } from 'mysql2/promise';
import { createClient } from 'redis'

const client = createClient({ url: process.env.REDISCLOUD_URL })
await client.connect();
console.log(client.isReady);

const PORT = 3306;
import bp from "body-parser";
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors())

const pool = createPool({
  host: process.env.JAWS_HOST_URL,
  user: process.env.JAWS_USER,
  password: process.env.JAWS_PWRD,
  database: process.env.JAWS_DB,
});
// client.set('foo', 'bar');
// const data = await client.get('foo');
// if(data !== null) {
//   console.log('Retrieving data from Redis');
//   console.log(data);
// } else {
//   console.log('Retrieving data from MySQL');
// }
app.get("/api/getdata", async (req, res) => {
  const data = await client.get('codesnippets');
  if(data !== null) {
    console.log('Retrieving data from Redis');
    res.json(JSON.parse(data));
  }
   else {
      try {
        const data = await pool.query('SELECT * FROM codesnippets');
        client.setEx('codesnippets', 600,JSON.stringify(data[0]));
        res.json(data[0]);
      } catch (error) {
        console.error('Error retrieving data from MySQL:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
});


app.post("/api/senddata", async (req, res) => {
  try {
    const { username, code_language, source_code, language_id } = req.body;
    const submission_timestamp = new Date();
    if (!username) {
      return res.status(400).json({ error: 'Username cannot be null' });
    }

    const stdin = req.body.stdin !== undefined ? req.body.stdin : null;


    await pool.query(
      'INSERT INTO codesnippets (username, code_language, stdin, source_code, langid, submission_timestamp) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE code_language = VALUES(code_language), stdin = VALUES(stdin), source_code = VALUES(source_code);',
      [username, code_language, stdin, source_code, language_id, submission_timestamp]
    );

    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error inserting data into MySQL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
