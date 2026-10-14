import { AppShell } from "@/components/layout/AppShell";
import { NotFoundClient } from "@/components/errors/NotFoundClient";

export default function NotFound() {
  return (
    <AppShell>
      <NotFoundClient />
    </AppShell>
  );
}
