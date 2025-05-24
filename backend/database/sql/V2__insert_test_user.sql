INSERT INTO public.users
("userID", username, "name", surname, email, "password")
VALUES(1, 'tester1', 'test', 'testUser', 'test.user@handsup.co.za', 'somesortofhashedpassword');

INSERT INTO public.learn
("userID", "lessonsCompleted", "signsLearned", streak, "currentLevel")
VALUES(1, 6, 23, 14, 'Silver'::public."levelType");
