var Twit = require('twit')

var twit = new Twit({
    consumer_key: '5TPBcByMWyyEjORB6of9X3O5U'
  , consumer_secret: 'wfE5YR1KlBKbszEEhSbAig9w5hvLLjjWdeED2JbaDY6pK0mgEI'
  , access_token: '62817785-C56Y2VqkWCLjHzn5S72uCuRpt9Rv1h2tvWmv93iDS'
  , access_token_secret: 'dJ1AhrICKHjkhvmUaVmTqd0M2ucTdtMqLpffOTjR6ucSX'
})

//generate a random 'page' to view
randPage = randomInt(1,33);

//set to
twit.get('users/search', { q: 'node', page: randPage, count: 2 },
function (err, data, response) {
  console.log(data)
})



function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
