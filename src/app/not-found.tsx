import { AppShell } from "@/components/layout/AppShell";
import { NotFoundClient } from "@/components/errors/NotFoundClient";

export const instant = false;

export default function NotFound() {
  return (
    <AppShell>
      <NotFoundClient />
    </AppShell>
  );
}
