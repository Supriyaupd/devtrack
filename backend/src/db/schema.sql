CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.applications (
    id SERIAL PRIMARY KEY,
    company VARCHAR(100) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    applied_date DATE,
    user_id INTEGER NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
