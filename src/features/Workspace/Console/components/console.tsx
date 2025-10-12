"use client";

import { Button } from "@/components/ui/button";
import { SquareChevronRightIcon } from "lucide-react";
import { useRef } from "react";

const Console = ({
	iframeRef,
	handleRun,
}: {
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	handleRun: () => void;
}) => {
	return (
		<div className="w-full h-[400px] bg-background borderf-t border-border flex flex-col pb-4 rounded-2xl border-1">
			<div className="w-full hf-[40px] flex items-center gap-2 cursor-pointer justify-between px-3 border-b-1 py-3.5">
				{/* <Image src="/js.svg" alt="js" width={24} height={24} /> */}
				<div className="flex items-center gap-2">
					<SquareChevronRightIcon size={20} />
					Console
				</div>
				{/* <Button onClick={handleRun}>Run</Button> */}
			</div>

			{/* Console Output */}
			<div className="flex-1 bg-transparent px-3">
				<iframe
					ref={iframeRef}
					sandbox="allow-scripts"
					style={{
						width: "100%",
						height: "100%",
						background: "transparent",
						border: "none",
					}}
					className="bg-transparent"
				/>
			</div>
		</div>
	);
};
export default Console;
