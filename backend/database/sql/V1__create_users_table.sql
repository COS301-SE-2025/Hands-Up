-- Create the enum type for current_level
CREATE TYPE "levelType" AS ENUM ('Gold', 'Silver', 'Bronze','Platinum', 'Diamond','Ruby');

-- Create the users table
CREATE TABLE public.users (
    "userID" SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatarurl VARCHAR(255) DEFAULT NULL
);

-- Create the learn table
CREATE TABLE public.learn (
    "userID" INTEGER NOT NULL,
    "lessonsCompleted" INTEGER DEFAULT 0,
    "signsLearned" INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    "currentLevel" "levelType" DEFAULT 'Bronze',
    CONSTRAINT fk_user
        FOREIGN KEY ("userID")
        REFERENCES public.users("userID")
        ON DELETE CASCADE
);
