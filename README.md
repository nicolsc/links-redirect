#Links redirect

##Purpose

Redirects a given domain/path to an URL, stored in database. 
Target can be updated. Bad thing i know, but i've got a use case where its mandatory


##Usage
Deploy anywhere, with a running mongo instance.

Call http://www.example.com/:code.

##Register short links

http://localhost:17009/admin/links

##View Stats
http://localhost:17009/admin/hits

##Technology

* nodeJS
* express
* mongodb

##To do

###Login ( Register ?)

To restrict admin access

###Avoid duplicate entries

###Validity dates ?