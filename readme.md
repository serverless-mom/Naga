I'm trying to automate some Twitter things. Again. Sorry.
# Naga: the follow builder bot

## features:
can find 10 accounts not currently followed, and follow them
with a follow, fave 1 recent tweet, especially something that is already faved by others
after a few days, unfollows those accounts if they haven't followed you back

Reach goals:
can automatically figure out who might be related to your account.
finds 10 good-looking targets, rejecting anyone with a follwing/follower ratio of less than .5
faves tweets more distantly in the past.

## Installation:

Create a 'config.js' file at the root of the install with the following:

```
module.exports = {
        consumer_key: ''
      , consumer_secret: ''
      , access_token: ''
      , access_token_secret: ''
}

```

However often you want to run `node index.js` and see your following count climb. Run five or so days later to trim those who didn't follow you back, the traitors. 
