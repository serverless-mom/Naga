var fs = require("fs")
var file = "test.db"
var exists = fs.existsSync(file)
var sqlite3 = require("sqlite3").verbose()
var db = new sqlite3.Database(file)

if(!exists) {
  console.log("Creating DB file.")
  fs.openSync(file, "w")
}

var sqlite3 = require("sqlite3").verbose()
var db = new sqlite3.Database(file)

db.serialize(function() {
  if(!exists) {
    //sure hope these data types work...
    db.run("CREATE TABLE autofollows (name TEXT, twitterUserID TEXT, followDate INTEGER")
  }

stmt.finalize();

})

db.close()
