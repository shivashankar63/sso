import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Authentication disabled - dashboard accessible without login
export default function Index() {
  return (
    <ErrorBoundary>
      <DashboardPageClient />
    </ErrorBoundary>
  );
}
