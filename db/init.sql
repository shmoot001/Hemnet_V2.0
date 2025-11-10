CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    size INTEGER,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO listings (title, location, price, size, image_url)
VALUES
    ('Modern two-bedroom apartment', 'Stockholm', 5250000, 72, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'),
    ('Cozy countryside cottage', 'Dalarna', 1850000, 95, 'https://images.unsplash.com/photo-1472220625704-91e1462799b2'),
    ('Minimalist studio with city view', 'Gothenburg', 2650000, 38, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511')
ON CONFLICT DO NOTHING;
