# Social Circles WebGame

## Prerequisites

* Node.js (v22)
* MySQL (v8.0+)

## Clone the repository

## Install dependencies

```
npm install  
```

## Command line database setup using the social\_circles\_database\_dump.sql file

* Open the command prompt

### Check that you have mysql installed

```
mysql --version  
```

* Clone the database using the database dump file and enter your local root password

```
mysql -u root -p < social_circles_database_dump.sql  
```

* Verify you have cloned the database

```
mysql -u root -p -e "SHOW DATABASES LIKE 'social_circles_database';"  
mysql -u root -p -D social_circles_database -e "SELECT COUNT(*) FROM user_information;"  
```

### If you want to removed

```
mysql -u root -p -e "DROP DATABASE social_circles_database;"  
```

## MySQL Workbench setup

* Open MySQL Workbench.
* Create the new connection you want to clone the database in
* In the top-left Navigator panel, expand Management.
* Click Data Import/Restore.
* import Options -> select “Import from Self-Contained File”.
* Browse and pick social\_circles\_database\_dump.sql.
* Default Target Schema: Leave empty
* Use “Dump Structure and Data”
* Click Start Import.

### Verify

* In the Navigator -> Schemas panel, click the refresh icon.
* Expand social\_circles\_database -> Tables,  you should see user\_information and friendships.
* Right-click each table -> Select Rows -> Limit 1000 to view imported data (hashed passwords, sample friendships, etc.).

## Create the .env file in the main directory of the project (Session\_Secret can be any string)

```
DATABASE_HOST=127.0.0.1  
DATABASE_USER=[Your SQL username]  
DATABASE_PASSWORD=[Your SQL password]  
DATABASE_NAME=social_circles_database  
SESSION_SECRET=[Your Session Secret]  
```

## In public\js\home.js go to line 639

* Comment out `“const url = "https://drhorn.online/score";`
* Remove comments on `//const url = "http://localhost:3000/score";`
* *Note for any pull requests, switch the line back*

## Start web app with

```
node app.js  
```
