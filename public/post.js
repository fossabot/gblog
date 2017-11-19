/* global marked */
/* global XMLHttpRequest */

// Our main function
const main = () => {
	// Grab our needed elements
	const editWindow = document.querySelector('div.post-wrapper textarea');
	const displayWindow = document.querySelector('div.post-wrapper div.post-content');
	const editButton = document.querySelector('header span.editButton');
	const saveButton = document.querySelector('header span.saveButton');

	editButton.addEventListener('click', () => {
		editButton.classList.add('hide');
		saveButton.classList.remove('hide');
		editWindow.classList.remove('hide');
	});

	saveButton.addEventListener('click', () => {
		saveButton.classList.add('hide');
		editButton.classList.remove('hide');
		editWindow.classList.add('hide');
		updatePost();
	});

	// Our post function
	const updatePost = () => {
		const request = new XMLHttpRequest();
		request.open('POST', window.location.href, true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send('newContent=' + editWindow.value);
	};

	// Our render function
	const renderContent = () => {
		displayWindow.innerHTML = marked(editWindow.value);
	};
	renderContent();

	// Attach the render function to the textarea
	editWindow.addEventListener('keyup', renderContent);
};

// Do this when the page is done loading
const ready = (fn) => {
	if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
};

ready(main);
