const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/images', express.static('images'));
// Initialize Elasticsearch client
const esClient = new Client({
  node: 'enter endpoint',
  auth: {
    username: 'elastic',
    password: 'enterpassword'
  }
});

// Pass esClient to routes
app.locals.esClient = esClient;

// Import routes
const listingsRoutes = require('./routes/listings');
app.use('/listings', listingsRoutes);
const userRoutes = require('./routes/userRoutes'); // Import user routes
app.use('/users', userRoutes); // Add the user routes at /api/users
const reservationsRoutes = require('./routes/reservationsRoutes');
app.use('/reservations', reservationsRoutes);




// Test route
app.get('/', (req, res) => {
  res.send('Airbnb Clone API');
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
