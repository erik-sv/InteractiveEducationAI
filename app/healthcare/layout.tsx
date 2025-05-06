import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Assistant | AI Education Platform',
  description: 'Your Personal Healthcare Assistant powered by AI',
};

export default function HealthcareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
