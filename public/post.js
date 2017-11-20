/* global marked */
/* global XMLHttpRequest */

// Our main function
const main = () => {
	// Grab our needed elements
	const editWindow = document.querySelector('div.post-wrapper textarea');
	const displayWindow = document.querySelector('div.post-wrapper div.post-content');
	const editButton = document.querySelector('header span.editButton');
	const saveButton = document.querySelector('header span.saveButton');
	const cancelButton = document.querySelector('header span.cancelButton');
	const postID = document.querySelector('span#post-id') ? document.querySelector('#post-id').innerHTML : null;

	// Save the original post content in case user cancels edits
	const originalContent = editWindow.value;

	// Our view changing functions
	const changeToState = {
		view: () => {
			editButton.classList.remove('hide');
			saveButton.classList.add('hide');
			cancelButton.classList.add('hide');
			editWindow.classList.add('hide');
		},
		edit: () => {
			editButton.classList.add('hide');
			saveButton.classList.remove('hide');
			cancelButton.classList.remove('hide');
			editWindow.classList.remove('hide');
		}
	};

	if (editButton) {
		editButton.addEventListener('click', changeToState.edit);
	}

	if (saveButton) {
		saveButton.addEventListener('click', () => {
			if (/\/post\/new\/?$/.test(window.location.href)) {
				// It's a new post, so we don't show the edit button and send a POST request
				const post = {
					title: displayWindow.querySelector('h1:first-of-type').innerHTML,
					slug: slugify(displayWindow.querySelector('h1:first-of-type').innerHTML),
					content: editWindow.value,
					date: Date.now()
				};
				saveButton.innerHTML = 'Saving...';
				sendRequest('POST', post, () => {
					// Redirect the user to the new post
					window.location = window.location.hostname + '/post/' + post.slug;
				});
			} else {
				const data = {
					_id: postID,
					title: displayWindow.querySelector('h1:first-of-type').innerHTML,
					slug: slugify(displayWindow.querySelector('h1:first-of-type').innerHTML),
					content: editWindow.value
				};
				saveButton.innerHTML = 'Saving...';
				sendRequest('PUT', data, () => {
					saveButton.innerHTML = 'Save';
					changeToState.view();
				});
			}
		});
	}

	if (cancelButton) {
		cancelButton.addEventListener('click', () => {
			changeToState.view();
			editWindow.value = originalContent;
			renderContent();
		});
	}

	// Our ajax function
	const sendRequest = (method, data, callback) => {
		const request = new XMLHttpRequest();
		request.open(method, window.location.href, true);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(data));
		// If a callback function is passed in, we'll execute it once the request
		// has completed
		if (callback) {
			request.onreadystatechange = () => {
				if (this.readyState === 4 && this.status === 200) {
					callback();
				}
			};
		};
	};

	// Our slug generator function
	const slugify = (string) => string.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ /g, '-');

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
