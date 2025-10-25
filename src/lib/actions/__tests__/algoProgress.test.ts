import {
	getAlgoProgress,
	getAlgoProblemProgress,
	updateAlgoProblemProgress,
	updateAlgoLessonProgress,
	addChatMessage,
	markProblemCompleted,
} from "../algoProgress";
import { prisma } from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
	prisma: {
		algoProblemProgress: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			upsert: jest.fn(),
			update: jest.fn(),
		},
		algoLessonProgress: {
			findMany: jest.fn(),
			upsert: jest.fn(),
		},
	},
}));

const mockUserId = "user-123";
const mockProblemId = "two-sum";
const mockLessonId = "hashmap-basics";

describe("AlgoProgress Actions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAlgoProgress", () => {
		it("should return user progress for problems and lessons", async () => {
			const mockProblemProgress = [
				{
					id: "progress-1",
					userId: mockUserId,
					problemId: mockProblemId,
					language: "javascript",
					status: "completed",
					currentCode: "function twoSum() {}",
					chatHistory: [],
					completedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const mockLessonProgress = [
				{
					id: "lesson-progress-1",
					userId: mockUserId,
					lessonId: mockLessonId,
					status: "completed",
					completedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			(
				prisma.algoProblemProgress.findMany as jest.Mock
			).mockResolvedValue(mockProblemProgress);
			(prisma.algoLessonProgress.findMany as jest.Mock).mockResolvedValue(
				mockLessonProgress
			);

			const result = await getAlgoProgress(mockUserId);

			expect(result.problemProgress).toHaveLength(1);
			expect(result.lessonProgress).toHaveLength(1);
			expect(result.problemProgress[0].language).toBe("javascript");
			expect(result.lessonProgress[0].status).toBe("completed");
		});
	});

	describe("getAlgoProblemProgress", () => {
		it("should return problem progress for specific problem", async () => {
			const mockProgress = {
				id: "progress-1",
				userId: mockUserId,
				problemId: mockProblemId,
				language: "javascript",
				status: "in_progress",
				currentCode: "function twoSum() {}",
				chatHistory: [],
				completedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(
				prisma.algoProblemProgress.findUnique as jest.Mock
			).mockResolvedValue(mockProgress);

			const result = await getAlgoProblemProgress(
				mockUserId,
				mockProblemId,
				"javascript"
			);

			expect(result).toBeTruthy();
			expect(result?.status).toBe("in_progress");
			expect(result?.currentCode).toBe("function twoSum() {}");
		});

		it("should return null when progress not found", async () => {
			(
				prisma.algoProblemProgress.findUnique as jest.Mock
			).mockResolvedValue(null);

			const result = await getAlgoProblemProgress(
				mockUserId,
				mockProblemId,
				"javascript"
			);

			expect(result).toBeNull();
		});
	});

	describe("updateAlgoProblemProgress", () => {
		it("should update existing problem progress", async () => {
			const mockCode = "function twoSum(nums, target) { return [0, 1]; }";
			const mockChatHistory = [
				{
					id: "1",
					role: "user",
					content: "Help me",
					timestamp: new Date(),
				},
			];

			(prisma.algoProblemProgress.upsert as jest.Mock).mockResolvedValue(
				{}
			);

			await updateAlgoProblemProgress(
				mockUserId,
				mockProblemId,
				"javascript",
				mockCode,
				mockChatHistory,
				"in_progress"
			);

			expect(prisma.algoProblemProgress.upsert).toHaveBeenCalledWith({
				where: {
					userId_problemId_language: {
						userId: mockUserId,
						problemId: mockProblemId,
						language: "javascript",
					},
				},
				update: {
					currentCode: expect.any(String), // Should be escaped
					chatHistory: mockChatHistory,
					status: "in_progress",
					updatedAt: expect.any(Date),
				},
				create: {
					userId: mockUserId,
					problemId: mockProblemId,
					language: "javascript",
					currentCode: expect.any(String),
					chatHistory: mockChatHistory,
					status: "in_progress",
				},
			});
		});

		it("should throw error for code that is too long", async () => {
			const longCode = "a".repeat(10001); // Over 10KB limit
			const mockChatHistory = [];

			await expect(
				updateAlgoProblemProgress(
					mockUserId,
					mockProblemId,
					"javascript",
					longCode,
					mockChatHistory
				)
			).rejects.toThrow("Code too long");
		});
	});

	describe("updateAlgoLessonProgress", () => {
		it("should update lesson progress", async () => {
			(prisma.algoLessonProgress.upsert as jest.Mock).mockResolvedValue(
				{}
			);

			await updateAlgoLessonProgress(
				mockUserId,
				mockLessonId,
				"completed"
			);

			expect(prisma.algoLessonProgress.upsert).toHaveBeenCalledWith({
				where: {
					userId_lessonId: {
						userId: mockUserId,
						lessonId: mockLessonId,
					},
				},
				update: {
					status: "completed",
					completedAt: expect.any(Date),
					updatedAt: expect.any(Date),
				},
				create: {
					userId: mockUserId,
					lessonId: mockLessonId,
					status: "completed",
					completedAt: expect.any(Date),
				},
			});
		});
	});

	describe("addChatMessage", () => {
		it("should add message to existing chat history", async () => {
			const existingProgress = {
				id: "progress-1",
				userId: mockUserId,
				problemId: mockProblemId,
				language: "javascript",
				status: "in_progress",
				currentCode: "function twoSum() {}",
				chatHistory: [
					{
						id: "1",
						role: "user",
						content: "Hello",
						timestamp: new Date(),
					},
				],
				completedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const newMessage = {
				id: "2",
				role: "assistant" as const,
				content: "I can help!",
				timestamp: new Date(),
			};

			(
				prisma.algoProblemProgress.findUnique as jest.Mock
			).mockResolvedValue(existingProgress);
			(prisma.algoProblemProgress.update as jest.Mock).mockResolvedValue(
				{}
			);

			await addChatMessage(
				mockUserId,
				mockProblemId,
				"javascript",
				newMessage
			);

			expect(prisma.algoProblemProgress.update).toHaveBeenCalledWith({
				where: {
					userId_problemId_language: {
						userId: mockUserId,
						problemId: mockProblemId,
						language: "javascript",
					},
				},
				data: {
					chatHistory: [existingProgress.chatHistory[0], newMessage],
					updatedAt: expect.any(Date),
				},
			});
		});

		it("should throw error when progress not found", async () => {
			(
				prisma.algoProblemProgress.findUnique as jest.Mock
			).mockResolvedValue(null);

			const newMessage = {
				id: "2",
				role: "assistant" as const,
				content: "I can help!",
				timestamp: new Date(),
			};

			await expect(
				addChatMessage(
					mockUserId,
					mockProblemId,
					"javascript",
					newMessage
				)
			).rejects.toThrow("Problem progress not found");
		});
	});

	describe("markProblemCompleted", () => {
		it("should mark problem as completed", async () => {
			(prisma.algoProblemProgress.update as jest.Mock).mockResolvedValue(
				{}
			);

			await markProblemCompleted(mockUserId, mockProblemId, "javascript");

			expect(prisma.algoProblemProgress.update).toHaveBeenCalledWith({
				where: {
					userId_problemId_language: {
						userId: mockUserId,
						problemId: mockProblemId,
						language: "javascript",
					},
				},
				data: {
					status: "completed",
					completedAt: expect.any(Date),
					updatedAt: expect.any(Date),
				},
			});
		});
	});
});
