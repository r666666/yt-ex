const miniget = require('miniget'),
urllib = require('url'),
sig = require('./decipher');


const VIDEO_URL = 'https://www.youtube.com/watch?v=';


exports.parseUrl = async(id) => {
  const params = 'hl=en';
  const watchPageURL = `${VIDEO_URL + id}&${params}&bpctr=${Math.ceil(Date.now() / 1000)}`;
  const jsonEndpointURL = `${watchPageURL}&pbj=1`;

  const reqOptions = {
    headers: {
      'x-youtube-client-name': '1',
      'x-youtube-client-version': '2.20200529.02.01',
      'x-youtube-identity-token': ''
    }
  };

  const body = await miniget(jsonEndpointURL, reqOptions).text();
  
  let parsedBody = JSON.parse(body);
  parsedBody = parsedBody.reduce((part, curr) => Object.assign(curr, part), {});

  let info = JSON.parse(parsedBody.player.args.player_response);
  info.html5player = urllib.resolve(VIDEO_URL, parsedBody.player.assets.js);

  return info;
};

exports.getInfo = async(id) => {
  let info = await exports.parseUrl(id);
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

getFormats = data => {
  let formats = [];

  if (data.formats) {
    formats = formats.concat(data.formats);
  }
  if (data.adaptiveFormats) {
    formats = formats.concat(data.adaptiveFormats);
  }

  return formats;
};

