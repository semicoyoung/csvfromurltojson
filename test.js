'use strict';
let Csvfromurltojson = require('./index');
let co = require('co');

let url = 'https://www.abc.com';
let headers = ['aa', 'bb', 'cc', 'dd', 'ee'];

co(function* () {
  let csvfromurltojson = new Csvfromurltojson();
  return yield csvfromurltojson.translate(url, headers);
}).then(function (data) {
  console.log(data);
}, function(err) {
  if (err) {
    console.log(err);
  }
});
