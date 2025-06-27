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
  1.2 psql -U DB_USER -d DB_NAME (check the drive-> SPRINT 2->DB passwords for DB_USER and DB_NAME)
  1.3 SELECT setval(pg_get_serial_sequence('public.users', 'userID'), (SELECT MAX("userID") FROM public.users));
  1.4 exit
  1.5 exit

### FOR SSL Certificates
## Open powershell as administrator and run the following commands
      1. Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
      2. choco install mkcert
      3. mkcert -install
      4. mkcert localhost 127.0.0.1 ::1
## Then move the certificate files(you can find them in the file explorer in same folder as the one in powershell) to the frontend and backend api directory of your project.
