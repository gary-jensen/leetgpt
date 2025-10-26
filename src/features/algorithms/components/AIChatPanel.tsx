import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";

interface AIChatPanelProps {
	chatMessages: any[];
	onSendMessage: (message: string) => void;
}

export function AIChatPanel({ chatMessages, onSendMessage }: AIChatPanelProps) {
	return (
		<ResizablePanel
			defaultSize={25}
			minSize={15}
			maxSize={50}
			className="flex flex-col"
		>
			<div className="bg-background flex flex-col rounded-2xl border-[#2f2f2f] border-1 overflow-hidden h-full">
				<div className="flex items-center justify-between p-3 border-b border-border">
					<h3 className="font-medium">AI Mentor</h3>
				</div>

				<div className="flex-1">
					<div className="h-full flex flex-col">
						<div className="flex-1 overflow-auto p-4 space-y-3">
							{chatMessages.length === 0 ? (
								<div className="text-center text-muted-foreground py-8">
									<Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p>Ask me anything about this problem!</p>
									<p className="text-sm">
										I can help you understand the approach
										or debug your code.
									</p>
								</div>
							) : (
								chatMessages.map((message, index) => (
									<div
										key={index}
										className={`p-3 rounded-lg ${
											message.role === "user"
												? "bg-blue-100 ml-8"
												: "bg-gray-100 mr-8"
										}`}
									>
										<p className="text-sm">
											{message.content}
										</p>
									</div>
								))
							)}
						</div>

						<div className="p-4 border-t border-border">
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="Ask a question..."
									className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											onSendMessage(
												e.currentTarget.value
											);
											e.currentTarget.value = "";
										}
									}}
								/>
								<Button
									size="sm"
									onClick={() => {
										const input = document.querySelector(
											'input[placeholder="Ask a question..."]'
										) as HTMLInputElement;
										if (input.value) {
											onSendMessage(input.value);
											input.value = "";
										}
									}}
								>
									Send
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ResizablePanel>
	);
}
