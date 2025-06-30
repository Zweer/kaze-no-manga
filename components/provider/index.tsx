import { SessionProvider } from '@/components/provider/SessionProvider';
import { ThemeProvider } from '@/components/provider/ThemeProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        // disableTransitionOnChange // Optional: improve performance during theme change
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
