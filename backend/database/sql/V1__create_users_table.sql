-- Create the enum type for current_level
CREATE TYPE level_type AS ENUM ('gold', 'silver', 'bronze');

-- Create the users table
CREATE TABLE public.users (
    "userID" SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the learn table
CREATE TABLE public.learn (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    lessons_completed INTEGER DEFAULT 0,
    signs_learned INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    current_level level_type DEFAULT 'bronze',
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES public.users("userID")
        ON DELETE CASCADE
);
