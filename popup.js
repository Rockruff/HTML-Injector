window.onload = async () => {
	// create editor instance
	const editor = ace.edit("Editor", {
		cursorStyle: "slim",
		enableMultiselect: false,
		highlightActiveLine: false,
		highlightGutterLine: false,
		mode: "ace/mode/html",
		newLineMode: "unix",
		scrollPastEnd: 0,
		selectionStyle: "text",
		showPrintMargin: false,
		theme: "ace/theme/tomorrow_night_eighties",
		useSoftTabs: false,
		useWorker: false,
	});

	// enable format action
	document.getElementById("Format").onclick = () => {
		let raw = editor.getValue();
		for (let parser of ["babel", "postcss", "html"]) {
			try {
				let formatted = prettier.format(raw, {
					parser,
					plugins: prettierPlugins,
					printWidth: 120,
					useTabs: true,
				});
				if (formatted !== raw) {
					editor.setValue(formatted, -1);
				}
				break;
			} catch {}
		}
	};

	// get hostname for current tab
	let [tab] = await browser.tabs.query({
		active: true,
		currentWindow: true,
		url: ["https://*/*", "http://*/*"],
	});

	// exit if current tab is not valid
	if (typeof tab !== "object") {
		const template = "<!--\n\tProtocol is not supported.\n-->";
		editor.setValue(template, -1);
		return;
	}

	// enable save and delete action
	const { hostname } = new URL(tab.url);

	document.getElementById("Save").onclick = () => {
		let code = editor.getValue();
		browser.runtime.sendMessage({ hostname, code });
	};
	document.getElementById("Delete").onclick = () => {
		const template = "";
		editor.setValue(template);
		browser.runtime.sendMessage({ hostname, template });
	};

	// load code from background
	let code = await browser.runtime.sendMessage({ hostname });
	const template = '<script>\n\tconsole.log("Hello world!");\n</script>\n';
	editor.setValue(typeof code === "string" ? code : template, -1);
};
