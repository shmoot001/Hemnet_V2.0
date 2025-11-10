import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hemnet-dev-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  })
);

const enableKeycloak = process.env.ENABLE_KEYCLOAK === 'true';
let keycloak;
let protect = (_req, _res, next) => next();

if (enableKeycloak) {
  keycloak = new Keycloak({ store: memoryStore }, {
    'auth-server-url': process.env.KEYCLOAK_SERVER_URL || 'http://keycloak:8080/auth',
    realm: process.env.KEYCLOAK_REALM || 'hemnet',
    resource: process.env.KEYCLOAK_CLIENT_ID || 'hemnet-backend',
    'bearer-only': true,
    'confidential-port': 0,
    'ssl-required': process.env.KEYCLOAK_SSL_REQUIRED || 'none'
  });

  protect = keycloak.protect();
  app.use(keycloak.middleware());
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.get('/listings', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT id, title, location, price, size, image_url FROM listings ORDER BY created_at DESC LIMIT 20');
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch listings', error);
    res.status(500).json({ message: 'Unable to load listings' });
  }
});

app.post('/listings', protect, async (req, res) => {
  const { title, location, price, size, imageUrl } = req.body;

  if (!title || !location || !price) {
    return res.status(400).json({ message: 'title, location, and price are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings (title, location, price, size, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, location, price, size, image_url`,
      [title, location, price, size || null, imageUrl || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create listing', error);
    res.status(500).json({ message: 'Unable to create listing' });
  }
});

app.listen(port, () => {
  console.log(`Hemnet backend listening on port ${port}`);
});
