Simple export tool for Free Code Camp's data
=======================

Free Code Camp (FCC) is an open-source community where you learn to code and help nonprofits.
This tool exports data to a CSV file from the FCC database to be loaded in the database for the leaderboard.


Run info:
-----------

Download this repo (git clone  or  download zip)

> cd fccexport
> npm install

Make sure the url is pointing to the right running MongoDB instance, var url = 'mongodb://localhost:27017/freecodecamp'
The file will be created in the project folder. Adjust the path variable to another folder if necessary.

> node export

