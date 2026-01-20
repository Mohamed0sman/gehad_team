import { PlanProvider } from "@/lib/contexts/PlanContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanProvider hasProPlan={true} hasEnterprisePlan={true}>
      {children}
    </PlanProvider>
  );
}
