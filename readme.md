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



## milestones:

* ~~Make an app that can authenticate and send command to the Twitter api~~

* ~~get some search results of users/tweets~~

* Gulp to test this

* turn those search results into a nice orderly array of ID's
follow those ID's

* store what was followed (liteweight Redis?, just plaintext?)
