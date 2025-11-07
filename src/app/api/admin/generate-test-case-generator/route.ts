import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { generateTestCaseGeneratorFunction } from "@/lib/actions/adminProblemGenerationActions";
import { TestCase } from "@/types/algorithm-types";

export async function POST(req: NextRequest) {
	try {
		const session = await getSession();
		if (!session?.user?.id) {
			return new Response(
				JSON.stringify({ error: "Authentication required" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		if (session.user.role !== "ADMIN") {
			return new Response(
				JSON.stringify({ error: "Admin access required" }),
				{ status: 403, headers: { "Content-Type": "application/json" } }
			);
		}

		const body = await req.json();
		const { problemData, existingTests, previousError } = body;

		if (!problemData) {
			return new Response(
				JSON.stringify({ error: "problemData is required" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const result = await generateTestCaseGeneratorFunction(
			problemData as any, // ProblemGenerationData type is internal
			(existingTests || []) as TestCase[],
			previousError
		);

		return new Response(JSON.stringify(result), {
			status: result.success ? 200 : 500,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
