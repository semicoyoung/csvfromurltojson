'use strict';

let https = require('https');
let http = require('http');
let Converter=require("csvtojson").Converter;
let encoding = require('encoding');
let thunkify = require('thunkify-wrap');

let csvfromurltojson = function () {};

csvfromurltojson.prototype.translate = function* (url, headers) {
  if (!url || !url.length) {
    throw new Error('请传入正确的URL');
  }
  if (!headers || !headers.length) {
    throw new Error('请传入文件头');
  }
  let protocol = url.toLowerCase().split('\:\/\/')[0];
  if (protocol != 'http' && protocol != 'https') {
    throw new Error('请传入以http或者https为开头的URL, 其他协议的URL不支持');
  }

  let buffer = null;
  switch (protocol) {
    case 'http':
      buffer = yield thunkify(readRemoteFileHttp)(url);
      break;
    case 'https':
      buffer = yield thunkify(readRemoteFileHttps)(url);
      break;
    default:
      break;
  }

  if (!buffer || !buffer.toString()) {
    throw new Error('数据为空, 请将URL放在浏览器地址栏并回车以检查文件是否存在或URL是否正确');
  }

  let tranData = yield translateFileFormat(buffer, headers);
  
  return tranData;
}

var readRemoteFileHttp = function(url, cb) {
  var callback = function () {
    // 回调函数，避免重复调用
    callback = function () {};
    cb.apply(null, arguments);
  };

  var req = http.get(url, function (res) {
    var b = [];
    res.on('data', function (c) {
      b.push(c);
    });
    res.on('end', function () {
      callback(null, Buffer.concat(b));
    });
    res.on('error', callback);
  });
  req.on('error', callback);
};

var readRemoteFileHttps = function(url, cb) {
  var callback = function () {
    //回调函数，避免重复调用
    callback = function () {};
    cb.apply(null, arguments);
  };
  var req = https.get(url, function (res) {
    var b = [];
    res.on('data', function (c) {
      b.push(c);
    });
    res.on('end', function () {
      callback(null, Buffer.concat(b));
    });
    res.on('error', callback);
  });
  req.on('error', callback);
};


var translateFileFormat = function* (buffer,headers) {
  let tempBuffer = buffer;
  let result = null;
  let headerObj = {};
  for (let i = 0, len = headers.length; i < len; i++) {
    headerObj[headers[i]] = headers[i];
  }
  let formats = ['GBK', 'UTF-8', 'ANSI'];
  for (let  i = 0, len = formats.length; i < len; i++) {
    tempBuffer = encoding.convert(buffer, "UTF-8", formats[i]);
    let stringData = tempBuffer.toString();
    let tranData = yield translateData(stringData);
    //判断文件头是否相等
    let fileHeader = Object.keys(tranData[0]);
    if (fileHeader.length != headers.length && fileHeader[0].split('\t').length == headers.length) {
      fileHeader = fileHeader[0].split('\t');
    } else if (fileHeader.length != headers.length && fileHeader[0].split('\t').length != headers.length) {
      throw new Error('传进的文件头字段与通过URL获取到的文件的文件头不相同');
    }
    let flag = true;
    for (let j = 0, jLen = fileHeader.length; j < jLen; j++) {
      if (!headerObj[fileHeader[j]]) {
        flag = false;
        break;
      }
    }
    if (flag == true) {
      result = tranData;
      break;
    }
  }

  if (!result) {
    throw new Error('获取不到匹配数据，请检查文件格式是否是GBK，UTF-8或者ANSI三种格式之一，或者文件头是否匹配');
  }
  return result;
}

let translateData = function* (strData) {
  if (!strData) {
    throw new Error('数据为空，请检查文件是否存在');
  }

  let dataArray = yield thunkify(function (strData,next) {
    let dataArray = [];
    var csvConverter=new Converter();
    csvConverter.fromString(strData, function (err, jsonObj) {
      if (err) {
        console.log(err);
        throw new Error('转换成JSON时发生错误');
      }

      dataArray = jsonObj;
    });

    csvConverter.on('end_parsed', function (jsonObj) {
      next(null, dataArray);
    });
  })(strData);

  if (!dataArray || !dataArray.length) {
    throw new Error('数据为空');
  }

  return dataArray;
};


module.exports = csvfromurltojson;