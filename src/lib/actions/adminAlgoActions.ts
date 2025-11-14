"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import { revalidatePath, revalidateTag } from "next/cache";
import { AlgoLesson, AlgoProblemDetail } from "@/types/algorithm-types";

interface AlgoProblemData {
	slug: string;
	title: string;
	statementMd: string;
	examplesAndConstraintsMd?: string | null;
	topics: string[];
	difficulty: string;
	languages: string[];
	rubric: { optimal_time: string; acceptable_time: string[] };
	parameters?: { name: string; type: string }[];
	returnType?: string;
	functionName?: string;
	judge?: any;
	tests: { input: any[]; output: any }[];
	startingCode: { [key: string]: string };
	passingCode: { [key: string]: string };
	order: number;
}

interface AlgoLessonData {
	slug: string;
	title: string;
	summary: string;
	topics: string[];
	difficulty: string;
	readingMinutes: number;
	bodyMd: string;
}

// AlgoProblem Actions
export async function createAlgoProblem(data: AlgoProblemData) {
	try {
		requireAdmin();

		// Process markdown to HTML
		const statementHtml = await processMarkdown(data.statementMd);
		const examplesAndConstraintsHtml = data.examplesAndConstraintsMd
			? await processMarkdown(data.examplesAndConstraintsMd)
			: null;

		// Create problem with both markdown and HTML
		const problem = await prisma.algoProblem.create({
			data: {
				...data,
				parameters: data.parameters || undefined,
				returnType: data.returnType || undefined,
				functionName: data.functionName || undefined,
				judge: data.judge || undefined,
				statementHtml,
				examplesAndConstraintsMd: data.examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml,
			},
		});

		// Revalidate algorithm pages
		revalidatePath("/algorithms");
		revalidatePath("/problems");

		return { success: true, data: problem };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateAlgoProblem(id: string, data: AlgoProblemData) {
	try {
		requireAdmin();

		// Process markdown to HTML
		const statementHtml = await processMarkdown(data.statementMd);
		const examplesAndConstraintsHtml = data.examplesAndConstraintsMd
			? await processMarkdown(data.examplesAndConstraintsMd)
			: null;

		// Update problem with both markdown and HTML
		const problem = await prisma.algoProblem.update({
			where: { id },
			data: {
				...data,
				parameters: data.parameters || undefined,
				returnType: data.returnType || undefined,
				functionName: data.functionName || undefined,
				judge: data.judge || undefined,
				statementHtml,
				examplesAndConstraintsMd: data.examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml,
			},
		});

		// Revalidate algorithm pages
		revalidatePath("/algorithms");
		revalidatePath("/problems");
		revalidateTag("algo:problems");

		return { success: true, data: problem };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteAlgoProblem(id: string) {
	try {
		requireAdmin();

		await prisma.algoProblem.delete({
			where: { id },
		});

		// Revalidate algorithm pages
		revalidatePath("/algorithms");
		revalidatePath("/problems");

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getAlgoProblem(slug: string) {
	try {
		const problem = await prisma.algoProblem.findUnique({
			where: { slug },
		});

		return { success: true, data: problem };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getAllAlgoProblems() {
	try {
		const problems = await prisma.algoProblem.findMany({
			orderBy: { createdAt: "desc" },
		});

		return problems;
	} catch (error) {
		return null;
	}
}

// AlgoLesson Actions
export async function createAlgoLesson(data: AlgoLessonData) {
	try {
		requireAdmin();

		// Process markdown to HTML
		const bodyHtml = await processMarkdown(data.bodyMd);

		// Create lesson with both markdown and HTML
		const lesson = await prisma.algoLesson.create({
			data: {
				...data,
				bodyHtml,
			},
		});

		// Revalidate algorithm pages
		revalidatePath("/algorithms");
		revalidatePath("/algorithms/lessons");

		return { success: true, data: lesson };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateAlgoLesson(id: string, data: AlgoLessonData) {
	try {
		requireAdmin();

		// Process markdown to HTML
		const bodyHtml = await processMarkdown(data.bodyMd);

		// Update lesson with both markdown and HTML
		const lesson = await prisma.algoLesson.update({
			where: { id },
			data: {
				...data,
				bodyHtml,
			},
		});

		// Revalidate algorithm pages
		revalidatePath("/algorithms");
		revalidatePath("/algorithms/lessons");

		return { success: true, data: lesson };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteAlgoLesson(id: string) {
	try {
		requireAdmin();

		await prisma.algoLesson.delete({
			where: { id },
		});

		// Revalidate algorithm pages
		revalidatePath("/algorithms");
		revalidatePath("/algorithms/lessons");

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getAlgoLesson(slug: string) {
	try {
		const lesson = await prisma.algoLesson.findUnique({
			where: { slug },
		});

		return { success: true, data: lesson };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getAllAlgoLessons() {
	try {
		const lessons = await prisma.algoLesson.findMany({
			orderBy: { createdAt: "desc" },
		});

		return lessons;
	} catch (error) {
		return null;
	}
}

export async function updateProblemPublishedStatus(
	id: string,
	published: boolean
) {
	try {
		requireAdmin();

		await prisma.algoProblem.update({
			where: { id },
			data: { published },
		});

		// Revalidate algorithm pages
		revalidatePath("/admin/problems");
		revalidatePath("/algorithms");
		revalidatePath("/problems");

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
