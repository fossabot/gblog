/* global XMLHttpRequest */

// Our main function
const main = () => {
	// Get our needed elements
	const inviteButton = document.querySelector('input[name=invite-generator]');
	const codesBlock = document.querySelector('p.invite-codes');

	inviteButton.addEventListener('click', () => {
		const inviteCode = Math.random().toString(36).substring(2);

		const request = new XMLHttpRequest();
		request.open('POST', window.location.href, true);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify({ inviteCode }));
		request.onload = () => {
			if (request.status >= 200 && request.status < 400) {
				if (codesBlock.innerHTML === '') codesBlock.innerHTML = '<strong>Invite Codes</strong><br />';
				codesBlock.innerHTML += '<span>' + inviteCode + '</span><br />';
			}
		};
	});
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
