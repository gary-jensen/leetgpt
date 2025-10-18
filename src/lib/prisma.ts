// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as {
// 	prisma: PrismaClient | undefined;
// };

// export const prisma =
// 	globalForPrisma.prisma ??
// 	new PrismaClient({
// 		log:
// 			process.env.NODE_ENV === "development"
// 				? ["error", "warn"]
// 				: ["error"],
// 		datasources: {
// 			db: {
// 				url: process.env.DATABASE_URL,
// 			},
// 		},
// 	});

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient();
} else {
	let globalWithPrisma = global as typeof globalThis & {
		prisma: PrismaClient;
	};
	if (!globalWithPrisma.prisma) {
		globalWithPrisma.prisma = new PrismaClient();
	}
	prisma = globalWithPrisma.prisma;
}

export default prisma;
