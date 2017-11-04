var Twit = require('twit')
var fs = require("fs")
if (process.env.ACCESS_TOKEN) {
  auth = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  }

} else {
  var auth = require('./config.js')
}

var twit = new Twit(auth)

var bunyan = require('bunyan');

//keyword with which to find peeps to follow
var keywords = ['node', 'vaporwave', 'robotics', 'javascript', 'alterconf',
  'emberjs', 'ayo.js', '3dprinting', 'makerbot', 'enabling the future',
  'prosthetics'
]
var keyword = keywords[RandomInt(0, keywords.length)]
  // selects a random page of users from search results
var randPage = RandomInt(1, 100)
  // How many days to people have to follow us back before we unfollow?
  // var followDays = 5

var followedCount = 0
var unfollowedCount = 0

// if (!exists) {
//   console.log("Creating DB file.")
//   fs.openSync(file, "w")
// }

var log = bunyan.createLogger({
  name: 'naga',
  streams: [{
    path: 'naga.log',
    // `type: 'file'` is implied
  }]
});

twit.get('users/search', {
    q: keyword,
    page: randPage,
    count: 10
  },
  function(err, usersData, response) {
    if (err) {
      log.error("Hit an error trying to get users in a search! " + err)
      return
    }
    usersData.forEach(function FaveAndFollow(user, index, array) {
      twit.get('statuses/user_timeline', //don't forget to always use 'id_str'!!
        {
          id: user.id_str,
          count: 10,
          include_rts: true,
          include_replies: true
        },
        function(err, userTweets, response) {
          //log.info(userTweets)
          if (userTweets.constructor === Array) {
            userTweets.forEach(function FaveWhatsFaved(tweet) {
              //only fave things that at least two others have faved.
              //To protect from faving 'hey guys my grandma died'
              if (tweet.favorite_count > 2) Fave(tweet)
            })
          }
          //follow that person
          followedCount++
          Follow(user)
        })
    })

  });

function RandomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

twit.get('friends/ids', {
  screen_name: "tobyfee",
  count: 40
}, function(err, followers, response) {
  if (err) {
    log.error("error while trying to query friends! " + err)
    return
  }
  var recentFriends = followers.ids.slice(20).join();
  twit.get('friendships/lookup', {
      user_id: recentFriends
    })
    .catch(function(err) {
      log.error('caught error', err.stack)
    })
    .then(function(result) {
      UnfollowNonFollowers(result.data);
    })
});

function UnfollowNonFollowers(friendArray) {
  friendArray.forEach(function(friend) {
    if (friend.connections.indexOf('followed_by') < 0) {
      Unfollow(friend);
    }
  })
}

// function TableDump() {
//   db.each("SELECT rowid AS id, name, followDate FROM Autofollows", function(
//     err,
//     row) {
//     if (err) log.error("hit an error! it was " + err)
//     var readableDate = new Date(row.followDate)
//     log.info("added to DB: " + row.id + ": " + row.name +
//       " followed on: " +
//       readableDate)
//   })
// }

function Unfollow(user) {
  twit.post('friendships/destroy', {
    user_id: user.id_str
  }, function(err, data, response) {
    if (err) {
      log.error("error while trying to remove friend! " + err)
      return
    }
    log.info("unfollowed " + user.name)
  })
}

function Fave(tweet) {
  twit.post('favorites/create', {
    id: tweet.id_str
  }, function(err, data, response) {
    if (err) {
      log.error("error! while faving! " + err)
      return
    }
    log.info("Faved! Text was: " + tweet.text + " ID is " + tweet.id_str)
  })
}

function Follow(user) {
  twit.post('friendships/create', {
    id: user.id_str
  }, function(err, data, response) {
    if (err) {
      log.error("error while trying to add friend! " + err)
      return
    }
  })
}
