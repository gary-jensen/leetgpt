/* Generate by @shikijs/codegen */
import type {
	DynamicImportLanguageRegistration,
	DynamicImportThemeRegistration,
	HighlighterGeneric,
} from "@shikijs/types";
import {
	createSingletonShorthands,
	createdBundledHighlighter,
} from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

type BundledLanguage =
	| "javascript"
	| "js"
	| "typescript"
	| "ts"
	| "html"
	| "css"
	| "json";
type BundledTheme = "light-plus" | "dark-plus";
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const bundledLanguages = {
	javascript: () => import("@shikijs/langs-precompiled/javascript"),
	js: () => import("@shikijs/langs-precompiled/javascript"),
	typescript: () => import("@shikijs/langs-precompiled/typescript"),
	ts: () => import("@shikijs/langs-precompiled/typescript"),
	html: () => import("@shikijs/langs-precompiled/html"),
	css: () => import("@shikijs/langs-precompiled/css"),
	json: () => import("@shikijs/langs-precompiled/json"),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>;

const bundledThemes = {
	"light-plus": () => import("@shikijs/themes/light-plus"),
	"dark-plus": () => import("@shikijs/themes/dark-plus"),
} as Record<BundledTheme, DynamicImportThemeRegistration>;

const createHighlighter = /* @__PURE__ */ createdBundledHighlighter<
	BundledLanguage,
	BundledTheme
>({
	langs: bundledLanguages,
	themes: bundledThemes,
	engine: () => createJavaScriptRegexEngine(),
});

const {
	codeToHtml,
	codeToHast,
	codeToTokensBase,
	codeToTokens,
	codeToTokensWithThemes,
	getSingletonHighlighter,
	getLastGrammarState,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
	createHighlighter
);

export {
	bundledLanguages,
	bundledThemes,
	codeToHast,
	codeToHtml,
	codeToTokens,
	codeToTokensBase,
	codeToTokensWithThemes,
	createHighlighter,
	getLastGrammarState,
	getSingletonHighlighter,
};
export type { BundledLanguage, BundledTheme, Highlighter };
