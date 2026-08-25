export function NoiseOverlay() {
	return (
		<div
			className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03] dark:opacity-[0.05]"
			aria-hidden="true"
		>
			<svg className="size-full">
				<title>Background noise texture</title>
				<filter id="noise">
					<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
				</filter>
				<rect width="100%" height="100%" filter="url(#noise)" />
			</svg>
		</div>
	);
}
