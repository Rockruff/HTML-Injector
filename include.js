// initialize injected root element
const injectedRoot = document.createElement("aside");
injectedRoot.id = "InjectedRoot";
injectedRoot.style.display = "none";

// inject handler
const injectHTML = function (code) {
	// remove from document and apply injected code
	injectedRoot.remove();
	if (!code) return;
	injectedRoot.innerHTML = code;

	// activate script tags
	for (let oldElement of injectedRoot.querySelectorAll("script")) {
		let newElement = document.createElement("script");
		for (let { name, value } of oldElement.attributes) {
			newElement.setAttribute(name, value);
		}
		newElement.innerHTML = oldElement.innerHTML;
		oldElement.replaceWith(newElement);
	}

	// append to document again
	document.body.appendChild(injectedRoot);
};

// load code from background
browser.runtime.sendMessage({ hostname: location.hostname }).then(injectHTML);

// listen to code changes from background
browser.runtime.onMessage.addListener(injectHTML);
