### Loading DB Connection details

1. Create a .env file in the database directory with 
    DB_NAME=
    DB_USER=
    DB_PASS=

the values can be found on the drive-> SPRINT 2-> DB Passwords

2. Do the same thing in the api directory

3. Add the following to the .env file in the api directory
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

the values for SMTP_USER, SMTP_PASS and SMTP_FROM can be found on the drive-> SPRINT 2-> DB Passwords

#### For userID issues:
1.In the database directory
  1.1 docker exec -it HandsUp_DB bash
  1.2 psql -U DB_USER -d DB_NAME (check the drive-> SPRINT 2->DB passwords for DB_USER and DB_NAME)
  1.3 SELECT setval(pg_get_serial_sequence('public.users', 'userID'), (SELECT MAX("userID") FROM public.users));
  1.4 exit
  1.5 exit


## How to run the models
2 models the need to be run:
1) Go navigate to api/controllers/ readme for steps
2) go to the api readme for steps 

