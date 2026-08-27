"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const statuses = [
	{ value: "reading", label: "Reading" },
	{ value: "plan_to_read", label: "Plan to Read" },
	{ value: "completed", label: "Completed" },
	{ value: "on_hold", label: "On Hold" },
	{ value: "dropped", label: "Dropped" },
];

interface StatusSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	disabled?: boolean;
	size?: "sm" | "default";
}

export function StatusSelect({ value, onValueChange, disabled, size = "default" }: StatusSelectProps) {
	return (
		<Select value={value} onValueChange={(v) => v && onValueChange(v)} disabled={disabled}>
			<SelectTrigger
				className={size === "sm" ? "h-7 cursor-pointer text-xs" : "cursor-pointer"}
				onClick={(e) => e.preventDefault()}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{statuses.map((s) => (
					<SelectItem key={s.value} value={s.value} className="cursor-pointer">
						{s.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export { statuses };
