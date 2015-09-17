var Twit = require('twit')

var config = require('./config.js')
var twit = new Twit(config)
var keyword = 'node'
//generate a random 'page' to view
randPage = randomInt(1,100)



twit.get('users/search', { q: keyword, page: randPage, count: 2},
function (err, data, response) {
  if (err){
    console.log ("Hit an error trying to get users in a search! "+err)
    return
  }

  data.forEach(function FaveAndFollow(user, index, array){
    twit.get('statuses/user_timeline', //don't forget to always use 'id_str'!!
    { id: user.id_str, count: 9, include_rts: true, include_replies: true },
      function (err, data, response){
        data.forEach(function FaveWhatsFaved(tweet){
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
      twit.post('friendships/create', { id: user.id_str }, function (err, data, response) {
        if (err){
          console.log ("error while trying to add friend! "+err)
          return
        }
        console.log(user.id_str)
        console.log("trying to follow "+user.name)
      })
    })
  })
})

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
