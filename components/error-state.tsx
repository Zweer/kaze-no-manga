import { Button } from "@/components/ui/button";

interface ErrorStateProps {
	message: string;
	onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center gap-3 py-12">
			<p className="text-sm text-destructive">{message}</p>
			{onRetry && (
				<Button variant="outline" size="sm" onClick={onRetry} className="cursor-pointer">
					Try again
				</Button>
			)}
		</div>
	);
}
