import { SettingsForm } from "./SettingsForm";
import { getSettings } from "@/lib/api";

export default async function SettingsPage() {
  let settings;
  let error: string | null = null;
  try {
    settings = await getSettings();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-app-muted">Runtime knobs exposed by the IdemGate admin API.</p>
      {error && <p className="my-4 text-app-bad">Failed to load settings: {error}</p>}
      {settings && <SettingsForm initial={settings} />}
    </>
  );
}
