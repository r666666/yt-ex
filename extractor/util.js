const https = require('https'),
sig = require('./decipher');


const YT_URL = 'https://www.youtube.com/';
const VIDEO_URL = 'https://www.youtube.com/watch?v=';
const EMBED_URL = 'https://www.youtube.com/embed/';


const YTPlayerConfigRex = new RegExp (
  `<script.+?>` +
    `.+?ytplayer.+?=.+?ytplayer.+?\\|\\|.+?.+?ytplayer.config.+?=.+?(\\{.+?\\});.+?;` +
  `<\\/script>`
);

const Html5PlayerRex = new RegExp (/<script\s+src="([^"]+)"\s+name="player_ias\/base"\s*>/);


exports.getInfo = async(id) => {
  const html = await exports.getHttpsData(VIDEO_URL + id);
  const embedHtml = await exports.getHttpsData(EMBED_URL + id);

  const playerBody = JSON.parse(YTPlayerConfigRex.exec(html)[1]);

  const info = JSON.parse(playerBody.args.player_response);
  info.html5player = YT_URL + Html5PlayerRex.exec(embedHtml)[1];
  
  info.formats = getFormats(info.streamingData);
  
  // Check if video is deciphered
  if(!info.formats[0]['url']) {
    const funcs = [];

    funcs.push(sig.signatureDecipher(info.formats, info.html5player));
    const results = await Promise.all(funcs);

    info.formats = Object.values(Object.assign({}, ...results));
  }

  return {
    videoId: info.videoDetails.videoId,
    title: info.videoDetails.title,
    length: info.videoDetails.lengthSeconds,
    thumbnail: info.videoDetails.thumbnail.thumbnails[0]['url'],
    formats: info.formats
  };
}

exports.getHttpsData = (options) => {
  return new Promise((resolve, reject) => {
    https.get(options, res => {
      let source = '';
      res.on('data', chunk => source += chunk);
      res.on('end', () => resolve(source));
    }).on('error', (err) => {
      reject(err);
    });
  });
}

exports.download = async(format, stream) => {
  await dl(format.url, stream);
}

dl = (url, stream) => {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      resolve(res.pipe(stream, true));
    }).on('error', (err) => {
      reject(err);
    });
  });
}


getFormats = (data) => {
  let formats = [];
  if (data.formats) {
    formats = formats.concat(data.formats);
  }
  if (data.adaptiveFormats) {
    formats = formats.concat(data.adaptiveFormats);
  }

  return formats;
};

