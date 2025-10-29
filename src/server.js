const express = require('express');
const dotenv = require('dotenv');
const compression = require('compression');
const connectDB = require('./config/db');

const swaggerUi = require('swagger-ui-express');
const specs = require('./docs/swagger');


dotenv.config();
connectDB();

const app = express();
app.use(compression()); // gzip responses
app.use(express.json({ limit: '10mb' }));
app.use(require('cors')());
app.use(require('helmet')());
app.use(require('morgan')('dev'));
// Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});