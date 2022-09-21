const express = require("express")
const app = express();

app.get('/cafes', (req, res) => {
  res.send('get cafes!');
});

app.listen(3000, () =>
  console.log('Example app listening on port 3000!'),
);