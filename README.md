# Dstate Backend repository
This is the backend repository of the DState project, a platform for real estate tokenization.
## How to run
- Create a new ```.env``` file and copy the content of the ```.env.example``` in it
- run ```npm install``` from your command line
- Create a new mongo db cluster and paste the db user and password you get from mongo db into the ```MONGO_DB_USER```, ```MONGO_DB_PS``` and ```DB_NAME``` variables inside the ```.env``` file
- Follow [this](https://www.freecodecamp.org/news/use-nodemailer-to-send-emails-from-your-node-js-server/) guide to get the ```EMAIL_USER```,
  ```EMAIL_PASS```,
  ```EMAIL_CLIENTID```,
  ```EMAIL_SECRET```,
  ```EMAIL_REFRESH``` variables
- generate a secret key for the sessison and a secret key for passport and put them as the ```PASSPORT_SECRET``` and ```SESSION_SECRET``` variables
- run ```npm start```
