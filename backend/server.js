const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// mount contacts route
app.use('/api/contacts', require('./routes/contact'));

// connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	})
	.catch(err => {
		console.error('MongoDB connection error:', err);
		process.exit(1);
	});