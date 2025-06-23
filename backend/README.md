### Loading DB Connection details

1. Create a .env file in the database directory with 
    DB_NAME=
    DB_USER=
    DB_PASS=

the values can be found on the drive-> SPRINT 2-> DB Passwords

2. Do the same thing in the api directory


#### For userID issues:
1.In the database directory
  1.1 docker exec -it HandsUp_DB bash
  1.2 psql -U DB_USER -d DB_HOST (check the drive-> SPRINT 2->DB passwords for DB_USER and DB_HOST)
  1.3 SELECT setval(pg_get_serial_sequence('public.users', 'userID'), (SELECT MAX("userID") FROM public.users));
  1.4 exit
  1.5 exit