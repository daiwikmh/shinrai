import { SuiProvider } from "@/providers/sui-provider";

export default function SuiLayout({ children }: { children: React.ReactNode }) {
  return <SuiProvider>{children}</SuiProvider>;
}
