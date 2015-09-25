var Twit = require('twit')
var fs = require("fs")
var sqlite3 = require("sqlite3").verbose()
var auth = require('./config.js')
var twit = new Twit(auth)
var strftime = require('strftime')
//keyword with which to find peeps to follow
var keyword = 'node'
//generate a random 'page' to view
var file = "test.db"
var exists = fs.existsSync(file)
var db = new sqlite3.Database(file)
var util = require('util');


if(!exists) {
  console.log("Creating DB file.")
  fs.openSync(file, "w")
}
var sqlite3 = require("sqlite3").verbose()

Fave('628763676476993536')

function Fave(tweetid){
  twit.post('favorites/create', { id : tweetid }, function(err, data, response){
    if (err){
      console.log ("error! while faving! "+err)
      return
    }
    console.log(util.inspect(data, false, null))

  })
}
