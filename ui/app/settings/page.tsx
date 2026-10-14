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
      <h1>Settings</h1>
      <p className="muted">Runtime knobs exposed by the IdemGate admin API.</p>
      {error && <p className="error">Failed to load settings: {error}</p>}
      {settings && <SettingsForm initial={settings} />}
    </>
  );
}
