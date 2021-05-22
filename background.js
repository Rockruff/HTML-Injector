class StorageWrapper {
	constructor(storage) {
		this.queue = Promise.resolve();
		this.storage = storage;
	}
	pushTask(executor) {
		let result = this.queue
			.then(executor) // onFulfilled
			.catch(console.error); // onRejected
		this.queue = result;
		return result;
	}
	export() {
		return this.batchGet(null).then((object) => {
			let text = JSON.stringify(object);
			console.log(text);
			return object;
		});
	}
	clear() {
		let executor = () => this.storage.clear();
		return this.pushTask(executor);
	}
	batchGet(keys) {
		let executor = () => this.storage.get(keys);
		return this.pushTask(executor);
	}
	batchSet(keys) {
		let executor = () => this.storage.set(keys);
		return this.pushTask(executor);
	}
	batchRemove(keys) {
		let executor = () => this.storage.remove(keys);
		return this.pushTask(executor);
	}
	get(key) {
		return this.batchGet([key]).then((keys) => keys[key]);
	}
	set(key, value) {
		return this.batchSet({ [key]: value });
	}
	remove(key) {
		return this.batchRemove([key]);
	}
}

const extensionStorage = new StorageWrapper(browser.storage.local);

browser.runtime.onMessage.addListener(({ hostname, code }) => {
	// get code
	if (typeof code !== "string") {
		return extensionStorage.get(hostname);
	}

	// set code
	if (code !== "") extensionStorage.set(hostname, code);
	else extensionStorage.remove(hostname);

	// notify relative tabs about code change
	browser.tabs
		.query({ url: [`https://${hostname}/*`, `http://${hostname}/*`] })
		.then((tabs) => {
			for (let { id } of tabs) {
				browser.tabs.sendMessage(id, code);
			}
		});
});
