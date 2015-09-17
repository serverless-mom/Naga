var Twit = require('twit')
//for debuggery. Leaving it in for now....
var util = require('util')

var config = require('./config.js')
var twit = new Twit(config)

//generate a random 'page' to view
randPage = randomInt(1,100)

//set to

twit.get('users/search', { q: 'node', page: randPage, count: 5},
function (err, data, response) {
  data.forEach(function LogUsers(user, index, array){
    console.log(user.id)
    console.log(user.name)
    twit.get('statuses/user_timeline', { id: user.id_str, count: 2, include_rts: true, include_replies: true },
      function (err, data, response){
        //console.log(data)
        data.forEach(function FaveWhatsFaved(tweet){
          //only fave things that
          if (tweet.favorite_count>2){
            console.log (tweet.id_str)
            twit.post('favorites/create', { id : tweet.id_str }, function(err, data, response){
              console.log (tweet.id_str)

              if (err)console.log ("error! "+err)
              console.log("Faved! Text was: "+tweet.text)
            })
          }
        })

      //friend that person,
      twit.post('friendships/create', { id: user.id_str }, function (err, data, response) {
        if (err)console.log ("error! "+err)
      })
    })
  })
})


function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
