var Twit = require('twit')
var fs = require("fs")
var sqlite3 = require("sqlite3").verbose()
var auth = require('./config.js')
var twit = new Twit(auth)
var file = "test.db"
var exists = fs.existsSync(file)
var sqlite3 = require("sqlite3").verbose()
var db = new sqlite3.Database(file)
var bunyan = require('bunyan');

//keyword with which to find peeps to follow
var keyword = 'node'
// selects a random page of users from search results
var randPage = RandomInt (1, 100)
// How many days to people have to follow us back before we unfollow?
var followDays = 3

if(!exists) {
  console.log("Creating DB file.")
  fs.openSync(file, "w")
}

var log = bunyan.createLogger({
    name: 'naga',
    streams: [{
        path: 'naga.log',
        // `type: 'file'` is implied
    }]
});

twit.get('users/search', { q: keyword, page: randPage, count: 2},
function (err, usersData, response) {
  if (err){
    console.log ("Hit an error trying to get users in a search! "+err)
    return
  }
  usersData.forEach(function FaveAndFollow(user, index, array){
    twit.get('statuses/user_timeline', //don't forget to always use 'id_str'!!
    { id: user.id_str, count: 10, include_rts: true, include_replies: true },
      function (err, userTweets, response){
        console.log (userTweets)
        userTweets.forEach(function FaveWhatsFaved(tweet){
        //only fave things that at least two others have faved.
        //To protect from faving 'hey guys my grandma died'
          if (tweet.favorite_count>2)Fave(tweet)
        })
      //follow that person
      Follow(user)
    })
  })
  SaveAutofollows(usersData)
  UnfollowTraitors()
})

function RandomInt (low, high) {
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
    if (((today - row.followDate)/1000/60/60/24)>followDays){
      console.log ("Found a traitor! "+row.id + ": " + row.name + " followed on: "+readableDate)
      oldIDs.push(row.id)
    }
  }, function IdentifyNonFollowers(){
    var oldIdsString = oldIDs.join()
    console.log (oldIdsString)
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
          UnFollow(user.id_str)
        }
        if (i == numberOfFriendships){
          console.log ("trying to delete these traitors from the DB " + traitorIDs)
          traitorIDs.forEach(function(id){
            db.run("DELETE FROM Autofollows WHERE twitterUserID=?", id)
          }, function(){db.close()})
        }
      })
    })
  })
})
}

function TableDump(){
  db.each("SELECT rowid AS id, name, followDate FROM Autofollows", function(err, row) {
    if(err)console.log ("hit an error! it was "+err)
    var readableDate = new Date (row.followDate)
    console.log("added to DB: "+row.id + ": " + row.name + " followed on: "+readableDate)
  })
}

function UnFollow(user_id_str){
  twit.post('friendships/destroy', { id: user_id_str }, function (err, data, response) {
    if (err){
      console.log ("error while trying to add friend! "+err)
      return
    }
    console.log ("unfollowed "+user.name)
  })
}

function Fave(tweet){
  twit.post('favorites/create', { id : tweet.id_str }, function(err, data, response){
    if (err){
      console.log ("error! while faving! "+err)
      return
    }
    console.log("Faved! Text was: "+tweet.text+" ID is "+tweet.id_str)
  })
}

function Follow(user){
  twit.post('friendships/create', { id: user.id_str }, function (err, data, response) {
    if (err){
      console.log ("error while trying to add friend! "+err)
      return
    }
  })
}
