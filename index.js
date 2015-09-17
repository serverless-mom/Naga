var Twit = require('twit')
var fs = require("fs")
var sqlite3 = require("sqlite3").verbose()
var config = require('./config.js')
var twit = new Twit(config)

var keyword = 'node'
//generate a random 'page' to view
var randPage = randomInt(1,100)
var file = "test.db"
var exists = fs.existsSync(file)
var db = new sqlite3.Database(file)

if(!exists) {
  console.log("Creating DB file.")
  fs.openSync(file, "w")
}

var sqlite3 = require("sqlite3").verbose()


twit.get('users/search', { q: keyword, page: randPage, count: 2},
function (err, usersData, response) {
  if (err){
    console.log ("Hit an error trying to get users in a search! "+err)
    return
  }

  usersData.forEach(function FaveAndFollow(user, index, array){
    twit.get('statuses/user_timeline', //don't forget to always use 'id_str'!!
    { id: user.id_str, count: 9, include_rts: true, include_replies: true },
      function (err, userTweets, response){
        userTweets.forEach(function FaveWhatsFaved(tweet){
          //only fave things that at least two others have faved. To protect from faving 'hey guys my grandma died'
          if (tweet.favorite_count>2){
            twit.post('favorites/create', { id : tweet.id_str }, function(err, data, response){
              if (err){
                console.log ("error! while faving! "+err)
                return
              }
              console.log("Faved! Text was: "+tweet.text)
            })
          }
        })
      //follow that person,
      // twit.post('friendships/create', { id: user.id_str }, function (err, data, response) {
      //   if (err){
      //     console.log ("error while trying to add friend! "+err)
      //     return
      //   }
      //   //console.log(user.id_str)
      //   //console.log("trying to follow "+user.name)
      // })

    })
  })
  SaveAutofollows(usersData)
})

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


//TODO: make this work.
function SaveAutofollows(userData){
  //log the people we just autofollowed
  db.serialize(function() {
    var stmt = db.prepare("INSERT INTO autofollows VALUES (?)")


    userData.forEach(function SaveToDB(user){
      stmt.run()
    })

    stmt.finalize();

  })
  db.close()
}
