import { cn } from "@/lib/utils";

const SkillTree = ({ showSkillTree }: { showSkillTree: boolean }) => {
	return (
		<div
			className={cn(
				"absolute left-[10%] top-4 w-[150px] h-[40px] bg-[#111111]/70 z-1000 pointer-events-none opacity-0 rounded-lg transition-all duration-300 ease-out px-4 py-3",
				showSkillTree &&
					"opacity-100 left-[15%] top-20 w-[600px] h-[400px] bfg-red-500 pointer-events-auto"
			)}
		>
			hey
		</div>
	);
};
export default SkillTree;
