## How to run the database and use migrations
There might be mistakes, please do do some research, this is what I found to work.

### Prerequisites
1. Download DBeaver and install to view and manage the database
2. Run docker desktop
3. In VS code run:

```
    cd backend/database
    docker-compose up --build 
```
(can just use docker-compose up in future if there are no   changes or "docker-compose down -v" to remove the container and saved volumes then build again)

### In DBeaver
1. Create new connection
2. Set database name to HandsUp
3. Port: 5432
4. Username: tmkdt
5. Password: handsUpProject1.0

### How to create migrations
1. Use DBeaver’s “Generate SQL” feature to copy the SQL statements of your schema changes (avoid copying those that were already in earlier migrations)
    - 1.1. If it is a data entry, right click on the row and find Generate SQL->INSERT
    - 1.2. For new tables or changes to tables rather add it directly in the sql V1 file
    - 1.3 You can also manually change the sql files for data entry

2. Create a new Flyway migration file (V{number}__your_change_description.sql) in your migrations folder with that SQL. (see V2__insert_test_user.sql)

3. When someone runs docker-compose, the migrations will be applied

