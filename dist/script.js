const convertBtn = document.getElementById('convert-btn');
const videoURL = document.getElementById('URL-input');
const content = document.getElementById('content-wrap');
const downloadBtn = document.getElementById('download-btn');

let selectedVideos = [];

const serverURL = 'http://localhost:4200';

convertBtn.addEventListener('click', () => {
	convert(videoURL.value);
});

async function convert(query) {
  const res = await fetch(`${serverURL}/convert?url=${query}`);

	if(res.status == 200) {
		var a = document.createElement('a');
  		a.href = `${serverURL}/convert?url=${query}`;
  		a.setAttribute('download', '');
		a.click();
	} else if(res.status == 400) {
		alert('Invalid url');
	}
}
