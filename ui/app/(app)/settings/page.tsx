import { Eyebrow } from "@/components/ui";
import { getSettings } from "@/lib/api";
import { SettingsForm } from "./SettingsForm";

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
      <Eyebrow className="mb-3">Dashboard</Eyebrow>
      <h1 className="text-display-sm text-ink">Settings</h1>
      <p className="mt-2 text-body-md text-body">Runtime knobs exposed by the IdemGate admin API.</p>
      {error && <p className="my-4 text-body-md text-accent-sunset">Failed to load settings: {error}</p>}
      {settings && <SettingsForm initial={settings} />}
    </>
  );
}
