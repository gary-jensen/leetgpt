"use server";

import prisma from "../prisma";
import { requireAuth } from "../auth";
import { revalidatePath } from "next/cache";

export async function updateEmailNotifications(enabled: boolean) {
	try {
		const session = await requireAuth();

		await prisma.user.update({
			where: { id: session.id },
			data: { emailNotifications: enabled },
		});

		revalidatePath("/learn");
		return { success: true };
	} catch (error) {
		console.error("Failed to update email notifications:", error);
		return {
			success: false,
			error: "Failed to update email notification preferences",
		};
	}
}

export async function getEmailNotificationStatus() {
	try {
		const session = await requireAuth();

		const user = await prisma.user.findUnique({
			where: { id: session.id },
			select: { emailNotifications: true },
		});

		return {
			success: true,
			emailNotifications: user?.emailNotifications ?? false,
		};
	} catch (error) {
		console.error("Failed to get email notification status:", error);
		return {
			success: false,
			error: "Failed to get email notification status",
			emailNotifications: false,
		};
	}
}
