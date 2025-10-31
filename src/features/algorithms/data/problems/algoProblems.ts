import { AlgoProblemDetail } from "@/types/algorithm-types";
import { algoProblems1to10 } from "./algoProblems1-10";
import { algoProblems11to20 } from "./algoProblems11-20";
import { algoProblems21to30 } from "./algoProblems21-30";
import { algoProblems31to40 } from "./algoProblems31-40";
import { algoProblems41to50 } from "./algoProblems41-50";

export const algoProblems: AlgoProblemDetail[] = [
	...algoProblems1to10,
	...algoProblems11to20,
	...algoProblems21to30,
	...algoProblems31to40,
	...algoProblems41to50,
];
