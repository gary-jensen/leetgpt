"use client";

import { Editor } from "@monaco-editor/react";
import { handleEditorMount, monacoOptions } from "./monacoUtils";

import { editor } from "monaco-editor";
import { useEffect, useRef, useCallback } from "react";
import "./editor.css";
import { cn } from "@/lib/utils";

interface EditorWrapper {
	code: string;
	setCode: (code: string) => void;
	className?: string;
	defaultLanguage?: string;
	triggerFormat?: boolean;
	focusOnLoad?: boolean;
	readOnly?: boolean;
}

const EditorWrapper = ({
	code,
	setCode,
	className = "",
	defaultLanguage = "javascript",
	triggerFormat = false,
	focusOnLoad = true,
	readOnly = false,
}: EditorWrapper) => {
	// Create a ref to store the latest handleCtrlR
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	// Callback ref for proper cleanup
	const setEditorRef = useCallback(
		(editor: editor.IStandaloneCodeEditor | null) => {
			// Dispose of the previous editor if it exists
			if (editorRef.current && editorRef.current !== editor) {
				editorRef.current.dispose();
			}
			editorRef.current = editor;
		},
		[]
	);

	useEffect(() => {
		return () => {
			if (editorRef.current) {
				editorRef.current.dispose();
				editorRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (triggerFormat) {
			editorRef?.current
				?.getAction("editor.action.formatDocument")
				?.run();
		}
	}, [triggerFormat]);

	return (
		<div
			className={cn(
				"flex-1 w-[500px] bg-[var(--card)] text-[var(--card-foreground)] shadow-none flex flex-col",
				className
			)}
		>
			<Editor
				loading={false}
				className="editor shadow-insfet inset-shadow-black/30 inset-shadow-sm bg-muted/0 pt-1 rounded-lg flex flex-col flex-1"
				theme="vs-dark"
				height="100%"
				onMount={(editor, monaco) => {
					handleEditorMount(
						editor,
						monaco,
						undefined,
						setEditorRef,
						focusOnLoad
					);
				}}
				onChange={(value) => {
					if (value !== undefined) setCode(value);
				}}
				value={code}
				defaultLanguage={defaultLanguage}
				options={{ ...monacoOptions, readOnly }}
			/>
		</div>
	);
};
export default EditorWrapper;
