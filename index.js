var Twit = require('twit')
var fs = require("fs")
var sqlite3 = require("sqlite3").verbose()
var config = require('./config.js')
var twit = new Twit(config)
var strftime = require('strftime')

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
            // twit.post('favorites/create', { id : tweet.id_str }, function(err, data, response){
            //   if (err){
            //     console.log ("error! while faving! "+err)
            //     return
            //   }
            //   //console.log("Faved! Text was: "+tweet.text)
            // })
          }
        })
      //follow that person
      // twit.post('friendships/create', { id: user.id_str }, function (err, data, response) {
      //   if (err){
      //     console.log ("error while trying to add friend! "+err)
      //     return
      //   }
      // })

    })
  })
  //SaveAutofollows(usersData)
  UnfollowTraitors()
  db.close()
})

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}



function SaveAutofollows(userData){
  //log the people we just autofollowed
  db.serialize(function() {
    var stmt = db.prepare("INSERT INTO autofollows (name, twitterUserID, followDate) VALUES (?,?,?)")

    userData.forEach(function SaveToDB(user){
      var now = Date.now()
      console.log(now)
      stmt.run([user.name, user.id_str, now])
    })

    stmt.finalize();
    db.each("SELECT rowid AS id, name, followDate FROM Autofollows", function(err, row) {
      if(err)console.log ("hit an error! it was "+err)
      var readableDate = new Date (row.followDate)
      console.log(row.id + ": " + row.name + " followed on: "+readableDate)

    });



  })
}

function UnfollowTraitors(){
  oldIDs = []
  traitorIDs = []
  var today = new Date()
  db.serialize(function() {
  db.each("SELECT twitterUserID AS id, name, followDate FROM Autofollows", function(err, row) {
    if(err)console.log ("hit an error! it was "+err)
    var readableDate = new Date (row.followDate)
    if (((today - row.followDate)/1000/60/60/24)>2){
      //console.log ("Found a traitor! "+row.id + ": " + row.name + " followed on: "+readableDate)
      oldIDs.push(row.id)
    }
  }, function IdentifyNonFollowers(){
    var oldIdsString = oldIDs.join()
    //console.log (oldIdsString)
    twit.get('friendships/lookup', { user_id : oldIdsString}, function (err, friendships, response) {
      if (err){
        console.log ("error while trying to query friends! "+err)
        return
      }
      var numberOfFriendships = friendships.length
      var i = 0;
      friendships.forEach(function (user){
        i ++
        if(!!user.connections.followed_by == false){
          traitorIDs.push(user.id_str)
          twit.post('friendships/destroy', { id: user.id_str }, function (err, data, response) {
            if (err){
              console.log ("error while trying to add friend! "+err)
              return
            }
            console.log ("unfollowed "+user.name)
          })
        }
        if (i == numberOfFriendships){
          console.log (traitorIDs)
          id = traitorIDs [0]
          db.run("DELETE FROM table_name WHERE twitterUserID=?", id)
        }
      })
    })
  })
})
}
