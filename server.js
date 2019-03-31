const express = require('express');
const app = express();
const path = require('path');

app.use('/dist', express.static('dist', {
  setHeaders: function(res, path) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
    res.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  }
}));

console.log('serve')

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.listen(process.env.PORT||9000);
