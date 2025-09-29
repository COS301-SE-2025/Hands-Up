CREATE TYPE "levelType" AS ENUM ('Gold', 'Silver', 'Bronze','Platinum', 'Diamond','Ruby');

CREATE TABLE public.users (
    "userID" SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatarurl VARCHAR(255) DEFAULT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

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

CREATE TABLE public.learn_details (
    "detailID" SERIAL PRIMARY KEY,
    "userID" INTEGER NOT NULL REFERENCES users("userID") ON DELETE CASCADE,
    "learnedSigns" TEXT DEFAULT '[]', 
    "learnedPhrases" TEXT DEFAULT '[]', 
    "unlockedCategories" TEXT DEFAULT '["alphabets"]', 
    "placementTestCompleted" BOOLEAN DEFAULT FALSE,
    "placementResults" TEXT DEFAULT NULL, 
    "quizzesCompleted" INTEGER DEFAULT 0,
    "alphabetsQuizCompleted" BOOLEAN DEFAULT FALSE,
    "numbersQuizCompleted" BOOLEAN DEFAULT FALSE,
    "introduceQuizCompleted" BOOLEAN DEFAULT FALSE,
    "coloursQuizCompleted" BOOLEAN DEFAULT FALSE,
    "familyQuizCompleted" BOOLEAN DEFAULT FALSE,
    "feelingsQuizCompleted" BOOLEAN DEFAULT FALSE,
    "actionsQuizCompleted" BOOLEAN DEFAULT FALSE,
    "questionsQuizCompleted" BOOLEAN DEFAULT FALSE,
    "timeQuizCompleted" BOOLEAN DEFAULT FALSE,
    "foodQuizCompleted" BOOLEAN DEFAULT FALSE,
    "thingsQuizCompleted" BOOLEAN DEFAULT FALSE,
    "animalsQuizCompleted" BOOLEAN DEFAULT FALSE,
    "seasonsQuizCompleted" BOOLEAN DEFAULT FALSE,
    "phrasesQuizCompleted" BOOLEAN DEFAULT FALSE,
    "hasSeenWelcome" BOOLEAN DEFAULT FALSE,
    "hasSeenCategoryHelp" TEXT DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userID") 
);

CREATE INDEX idx_learn_details_user ON learn_details("userID");

CREATE OR REPLACE FUNCTION update_learn_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_learn_details_updated_at
    BEFORE UPDATE ON learn_details
    FOR EACH ROW
    EXECUTE FUNCTION update_learn_details_updated_at();