const convertBtn = document.getElementById('convert-btn');
const videoURL = document.getElementById('URL-input');
const pageBody = document.getElementById('page');

const serverURL = 'http://localhost:4200';

convertBtn.addEventListener('click', () => {
	convert(videoURL.value);
});

async function convert(query) {
  const res = await fetch(`${serverURL}/convert?url=${query}`);

  if(res.status === 200) {
		res.json().then((result) => {
			renderData(result);
		});
	} else if(res.status === 400) {
		alert('Enter valid url');
	}
}

function renderData(data) {
	console.log(data);

	let div = document.createElement('div');
	div.setAttribute('class', 'video-info');

	let img = document.createElement('img');
	img.setAttribute('src', data.thumbnail);
	div.appendChild(img);

	let span = document.createElement('span');
	span.innerHTML = data.title;
	div.appendChild(span);

	let a = document.createElement('a');
	a.innerHTML = 'download';
	a.setAttribute('href', data.formats[0]['url']);
	a.setAttribute('class', 'downloadBtn');

	div.appendChild(a);

	pageBody.appendChild(div);
}