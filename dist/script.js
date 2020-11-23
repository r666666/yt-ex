const convertBtn = document.getElementById('convert-btn');
const videoURL = document.getElementById('URL-input');
const content = document.getElementById('content-wrap');
const contentWrap = document.getElementById('content-wrap');
const downloadBtn = document.getElementById('download-btn');

let selectedVideos = [];

const serverURL = 'http://localhost:4200';

convertBtn.addEventListener('click', () => {
	convert(videoURL.value);
});
downloadBtn.addEventListener('click', () => {
	download(selectedVideos);
});

async function convert(query) {
  if (query.includes('playlist?list=')) {
		const res = await fetch(`${serverURL}/convertPlaylist?url=${query}`);

		if(res.status === 200) {
			res.json().then((result) => {
				renderPlaylistData(result);
			});
		} else if(res.status === 400) {
			alert('Enter valid url');
		}
	} else {
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
}

function renderPlaylistData(dataArray) {
	console.log(dataArray);
	selectedVideos = dataArray;

	dataArray.forEach(data => {
		let container = document.createElement('div');
		container.setAttribute('class', 'video-info');

		let select = document.createElement('input');
		select.setAttribute('type', 'checkbox');
		select.setAttribute('id', 'check-' + data.index.simpleText - 1);
		select.setAttribute('checked', '');
		container.appendChild(select);

		let img = document.createElement('img');
		img.setAttribute('class', 'video-thumbnail');
		img.setAttribute('src', data.thumbnail.thumbnails[0].url);
		container.appendChild(img);

		const textWrap = document.createElement('div');
		textWrap.setAttribute('class', 'text-wrap');
	
		let titleSpan = document.createElement('span');
		titleSpan.innerHTML = data.title.runs[0].text;
		textWrap.appendChild(titleSpan);

		let lengthSpan = document.createElement('span');
		lengthSpan.innerHTML = data.lengthText.simpleText;
		textWrap.appendChild(lengthSpan);

		container.appendChild(textWrap);
		contentWrap.appendChild(container);
	});
}

async function download(dataArray) {
	Array.prototype.slice.call(contentWrap.children).forEach((element, i) => {
		if (element.children[0].checked) {
			var a = document.createElement('a');
				a.href = `${serverURL}/convert?url=${'https://www.youtube.com/watch?v=' + dataArray[i].videoId}`;
				a.setAttribute('download', '');
			a.click();
		}
	});
}
