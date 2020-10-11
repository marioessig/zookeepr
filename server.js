const fs = require('fs');
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3001;
const apiRoutes = require('./routes/apiRoutes');
const htmlRoutes = require('./routes/htmlRoutes');

// in order for our server to accept incoming data the way we need it to, we need to tell our Express.js app to intercept our POST request before it gets to the callback function. First declare the app variable then parse.
const app = express();

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
app.use('/api', apiRoutes);
app.use('/', htmlRoutes);
// instruct the server to make certain files (CSS, JS, etc.) available and not to gate it behind a server endpoint
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`:: API server now on port ${PORT}`);
});