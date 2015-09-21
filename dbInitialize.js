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
    db.run("CREATE TABLE Autofollows (name TEXT, twitterUserID TEXT, followDate INTEGER)")
  }

  var stmt = db.prepare("INSERT INTO Autofollows (name, twitterUserID, followDate) VALUES (?, ?, ?)");

  //create records that are 3 days in the past
  var rightNow = new Date()
  rightNow.setDate(3)
  stmt.run(["steve", "982734987239847897", rightNow]);

  stmt.finalize();
  db.each("SELECT rowid AS id, name, followDate FROM Autofollows", function(err, row) {
    var readableDate = new Date (row.followDate)
    console.log(row.id + ": " + row.name + " Followed on: " + readableDate);
  });
});



db.close()
