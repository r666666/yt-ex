const express = require('express'),
path = require('path'),
cors = require('cors'),
bodyParser = require('body-parser'),
ytEx = require('./extractor/index');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, './dist')));

const port = process.env.PORT || 4200;

const server = app.listen(port, function(){
  console.log('Listening on port ' + port);
});

app.get('/convert', async (req, res, next) => {
	try {
		// Get video id
		const id = req.query.url.split('=')[1];
		const info = await ytEx.getInfo(id);

		res.json(info);
	} catch (err) {
		console.error(err);
	}
});
