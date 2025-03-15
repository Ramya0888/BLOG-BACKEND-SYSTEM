const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Import authentication routes
const authRoutes = require('./routes/auth');  // Add this line
app.use('/auth', authRoutes);  // Add this line

const blogRoutes = require('./routes/blog');  
app.use('/blog', blogRoutes);  


app.get('/', (req, res) => {
    res.send('Welcome to the Blog Backend API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
