// import { FileSystem } from "@/lib/useFileSystem";
import { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { RefObject } from "react";

export const setTheme = (monaco: Monaco) => {
	// monaco.languages.registerCompletionItemProvider("html", {
	// 	triggerCharacters: ["!"],
	// 	provideCompletionItems: (model, position) => {
	// 		const word = model.getWordUntilPosition(position);
	// 		const range = {
	// 			startLineNumber: position.lineNumber,
	// 			endLineNumber: position.lineNumber,
	// 			startColumn: word.startColumn - 1,
	// 			endColumn: word.endColumn,
	// 		};
	// 		return {
	// 			suggestions: [
	// 				{
	// 					label: "!",
	// 					kind: monaco.languages.CompletionItemKind.Snippet,
	// 					insertTextRules:
	// 						monaco.languages.CompletionItemInsertTextRule
	// 							.InsertAsSnippet,
	// 					documentation: "HTML Starting document",
	// 					range,
	// 					insertText: htmlStartingDoc,
	// 				},
	// 			],
	// 		};
	// 	},
	// });

	monaco.editor.defineTheme("my-theme", {
		base: "vs-dark",
		inherit: true,
		...monacoTheme,
	});

	monaco.editor.setTheme("my-theme");
};

export const addCommands = (
	editor: editor.IStandaloneCodeEditor,
	monaco: Monaco,
	editorRef?: RefObject<any>
) => {
	editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
		// Prevent monaco keybind for MOD+Space
	});

	// Prevent monaco keybind for MOD+Shift+R, allow default browser hard refresh
	editor.onKeyDown((e) => {
		if (e.ctrlKey && e.shiftKey && e.keyCode === monaco.KeyCode.KeyR) {
			// Do nothing, let the browser handle the event
			e.stopPropagation(); // Optional: Prevent Monaco from processing further
			// Browser's default behavior (hard refresh) will occur
		}
	});

	// Format editor
	editor.addCommand(
		monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
		() => {
			if (editorRef) {
				handleFormatEditor(editorRef);
			}
		}
	);
};

export const handleFormatEditor = (editorRef: RefObject<any>) => {
	if (editorRef?.current) {
		editorRef.current.getAction("editor.action.formatDocument")?.run();
	}
};

export const handleEditorMount = (
	editor: editor.IStandaloneCodeEditor,
	monaco: Monaco,
	editorRef?: React.RefObject<editor.IStandaloneCodeEditor | null>,
	setEditorRef?: (editor: editor.IStandaloneCodeEditor | null) => void,
	focusOnLoad: boolean = true
) => {
	// Use callback ref if provided, otherwise use direct ref assignment
	if (setEditorRef) {
		setEditorRef(editor);
	} else if (editorRef) {
		editorRef.current = editor;
	}

	// Adds Run and Submit commands, removes others
	addCommands(editor, monaco, editorRef);
	setTheme(monaco);
	// Focus editor
	// if (focusOnLoad || (window && window.innerWidth >= 980)) {
	if (focusOnLoad) {
		editor.focus();
	}
};

export const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
	stickyScroll: { enabled: false },
	showDeprecated: false,
	hover: { enabled: false },
	fontSize: 15,
	minimap: { enabled: false },
	matchBrackets: "never",
	wordWrap: "on",
	contextmenu: false,
	fontFamily:
		"'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', 'Liberation Mono', 'DejaVu Sans Mono','Courier New', monospace",
	occurrencesHighlight: "singleFile",
	selectionHighlight: false,
	screenReaderAnnounceInlineSuggestion: false,
	snippetSuggestions: "none",
	inlineSuggest: undefined,

	acceptSuggestionOnCommitCharacter: false, // Prevent accepting suggestions on commit characters
	acceptSuggestionOnEnter: "off", // Disable accepting suggestions with Enter
	suggestOnTriggerCharacters: false,
	quickSuggestions: false,
	wordBasedSuggestions: "off",
	parameterHints: { enabled: false },
	suggest: {
		preview: false,

		snippetsPreventQuickSuggestions: false,
		showIcons: false,
		showMethods: false,
		showFunctions: false,
		showConstructors: false,
		showFields: false,
		showVariables: false,
		showClasses: false,
		showStructs: false,
		showInterfaces: false,
		showModules: false,
		showProperties: false,
		showEvents: false,
		showOperators: false,
		showUnits: false,
		showValues: false,
		showConstants: false,
		showEnums: false,
		showEnumMembers: false,
		showKeywords: false,
		showDeprecated: false,
		showStatusBar: false,
		showInlineDetails: false,
		showWords: false,
		showColors: false,
		showFiles: false,
		showReferences: false,
		showFolders: false,
		showTypeParameters: false,
		showSnippets: false,
		showUsers: false,
		showIssues: false,
	},
};

export const monacoTheme = {
	rules: [
		{ token: "tag", foreground: "ff4271" },
		{ token: "attribute.name", foreground: "98e948" },
		{ token: "number", foreground: "44fffa" },
		// { token: "number", foreground: "a564d6" },
		{ token: "color", foreground: "a564d6" },
		{
			token: "delimiter.html",
			foreground: "ffffff",
		},
		{
			token: "delimiter.bracket",
			foreground: "ffc100",
			// foreground: "ffda4c",
		},
		{
			token: "attribute.value",
			foreground: "ffc100",
			// foreground: "ffda4c",
		},
		{
			token: "string",
			foreground: "ffda4c",
		},
		{ token: "regexp", foreground: "ffda4c" },
		{
			token: "delimiter.parenthesis",
			// foreground: "ffda4c",
			foreground: "ffc100",
		},
		{
			token: "keyword",
			// foreground: "68e7ff",
			foreground: "8aff00",
			// #44fffa
			//#ffc100
		},
		{
			token: "identifier",
			foreground: "ffffff",
		},
		{
			token: "identifier.parameter",
			foreground: "00ff00",
		},
		{
			token: "variable.parameter",
			foreground: "00ff00",
		},
		{
			token: "type.identifier",
			foreground: "ffffff",
		},
		{
			token: "comment",
			foreground: "aaaaaa",
		},
		{ token: "parameter", foreground: "ff0000" },
	],

	colors: {
		"editorBracketHighlight.foreground1": "#ffc100",
		"editorBracketHighlight.foreground2": "#44fffa",
		"editorBracketHighlight.foreground3": "#831dff",
		"editor.background": "#00000000",
		"editor.wordHighlightBackground": "#cccccc22",
		"editor.wordHighlightStrongBackground": "#cccccc22",
	},
};

const htmlStartingDoc = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    \$\{1\}
</body>
</html>`;
