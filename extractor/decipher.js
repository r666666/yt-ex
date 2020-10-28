const querystring = require('querystring'),
util = require('./util');


const funcRegexp = new RegExp (
  `function\\(\\w\\)\\{` +
    `\\w=\\w\\.split\\((?:''|"")\\);` +
    `(\\w*).\\w*\\(a,\\d*\\);` +
    `(.+)` +
    `return \\w\\.join\\((?:''|"")\\)` +
  `\\}`);

const objStr = '\\{([\\w\\W]+?)\\};';


exports.signatureDecipher = async(formats, html5player) => {
  const playerBody = await util.getHttpsData(html5player);
  const decipheredFormats = [];

  formats.forEach(format => {
    Object.assign(format, querystring.parse(format.signatureCipher || format.cipher));

    const signature = execute(playerBody, format.s);
    format.url = `${format.url}&sig=${signature}`;

    decipheredFormats.push(format);
  });
  
  return decipheredFormats;
};

/*
  Get methods form player body to decrypt signature

  Function example: 
  function(a) { 
    a = a.split("");
    pv.Xk(a, 1);
    pv.nU(a, 45);
    pv.hL(a, 59);
    pv.Xk(a, 3);
    pv.hL(a, 26);
    pv.Xk(a,1);
    pv.nU(a, 50);
    pv.Xk(a, 1);
    pv.hL(a, 9);
    return a.join("")
  }

  Object example:
  var pv = {
    hL: function(a) { a.reverse() },
    nU: function(a, b) {
      var c = a[0];
      a[0] = a[b%a.length];
      a[b%a.length] = c
    },
    Xk: function(a, b) { a.splice(0, b) }
  };
*/
execute = (playerBody, signature) => {
  const funcBody = funcRegexp.exec(playerBody)[0].replace('function(a)', 'function actions(a)');
  const objName = funcRegexp.exec(playerBody)[1];

  const objRegexp = new RegExp(`var ${objName}=${objStr}`);
  const objBody = objRegexp.exec(playerBody)[0];

  eval(objBody);
  eval(funcBody);

  return actions(signature);
}
