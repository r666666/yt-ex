const PassThrough = require('stream').PassThrough,
util = require('./util');


const ytEx = {};
module.exports = ytEx;

ytEx.getInfo = util.getInfo;
ytEx.download = (format) => {
  const stream = new PassThrough();
  util.download(format, stream);

  return stream;
};