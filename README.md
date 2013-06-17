#Links redirect

##Purpose

Redirects a given domain/path to an URL, stored in database. 
Target can be updated. Bad thing i know, but i've got a use case where its mandatory

##Technology

* nodeJS
* express
* mongodb

##Run

$ node app.js

##Init db

You'll need to insert at least one user, to able to log in on /admin & set up links

Just run $ node add_user.js

##Usage
Deploy anywhere, with a running mongo instance.

Call http://www.example.com/:code.

##Register short links

http://localhost:17009/admin/links

##View Stats
http://localhost:17009/admin/hits



##To do

###Login ( Register ?)

To restrict admin access

###Avoid duplicate entries

###Validity dates ?