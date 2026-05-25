import { scheherazade } from "@/lib/fonts";

export default function AdhkarLayout({ children }: { children: React.ReactNode }) {
  return <div className={scheherazade.variable}>{children}</div>;
}
