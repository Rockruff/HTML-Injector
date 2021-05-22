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

document.getElementById("Format").onclick = function () {
	let raw = editor.getValue();
	for (let parser in prettierPlugins) {
		try {
			let formatted = prettier.format(raw, {
				parser,
				plugins: prettierPlugins,
				printWidth: 120,
				useTabs: true,
			});
			if (formatted !== raw) editor.setValue(formatted, -1);
			break;
		} catch {}
	}
};

browser.tabs.query(
	{
		active: true,
		currentWindow: true,
		url: ["https://*/*", "http://*/*"],
	},
	function ([tab]) {
		// exit if current tab is not valid
		if (typeof tab !== "object") {
			editor.setValue("<!--\n\tHTML injection is not supported for current protocol.\n-->", -1);
			return;
		}

		// get hostname for current tab
		const { hostname } = new URL(tab.url);

		// load code from background
		browser.runtime.sendMessage({ hostname }, function (code) {
			const template = '<script>\n\tconsole.log("Hello world!");\n</script>\n';
			editor.setValue(typeof code === "string" ? code : template, -1);
		});

		// enable Save and Delete button
		document.getElementById("Save").onclick = function () {
			let code = editor.getValue();
			browser.runtime.sendMessage({ hostname, code });
		};
		document.getElementById("Delete").onclick = function () {
			const code = "";
			editor.setValue(code);
			browser.runtime.sendMessage({ hostname, code });
		};
	}
);
