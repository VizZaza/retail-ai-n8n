import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './lib/env.js';
import { authRequired } from './middleware/authRequired.js';

import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { inventoryRouter } from './routes/inventory.js';
import { salesRouter } from './routes/sales.js';
import { reportsRouter } from './routes/reports.js';
import { aiRouter } from './routes/ai.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.use(healthRouter);
app.use(authRouter);

// protected
app.use(authRequired);
app.use(productsRouter);
app.use(inventoryRouter);
app.use(salesRouter);
app.use(reportsRouter);
app.use(aiRouter);

app.listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`);
});
