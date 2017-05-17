# CSVFROMURLTOJSON

### description

根据URL获取CSV文件并转为JSON数据，目前支持的CSV文件格式为UTF-8，GBK，ANSI

### simple demo
```js
'use strict';

let co = require('co');
let Csvfromurltojson = require('./index');
let url = 'https://www.abc.com/xxxxxxxxx';
let headers = ['aa', 'bb', 'cc', 'dd', 'ee'];

co(function* () {
  let csvfromurltojson = new Csvfromurltojson();
  return yield csvfromurltojson.translate(url, headers);
}).then(function (data) {
  console.log(data);
},function (err) {
  if (err) {
    console.log(err);
  }
});

```
###API

* translate
      * url CSV文件的URL
      * headers CSV文件头，请注意此参数一定要与CSV文件的文件头相同

### Run Test (请在test.js文件中传入正确的URL和文件头之后再跑test)

```
npm test
```