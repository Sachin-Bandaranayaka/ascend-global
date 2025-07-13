import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GeneralSettings() {
  const [settings, setSettings] = useState({ company_name: '', default_currency: 'LKR', default_country: 'Sri Lanka' });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*').in('key', ['company_name', 'default_currency', 'default_country']);
    const settingsMap = data ? data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}) : {};
    setSettings(settingsMap);
  }

  async function saveSettings() {
    await Promise.all(Object.entries(settings).map(([key, value]) => 
      supabase.from('settings').upsert({ key, value })
    ));
  }

  return (
    <div>
      <h1>General Settings</h1>
      <form onSubmit={saveSettings}>
        <input value={settings.company_name} onChange={e => setSettings({ ...settings, company_name: e.target.value })} placeholder="Company Name" />
        <select value={settings.default_currency} onChange={e => setSettings({ ...settings, default_currency: e.target.value })}>
          <option>LKR</option>
          <option>USD</option>
        </select>
        {/* More fields */}
        <button type="submit">Save</button>
      </form>
    </div>
  );
} 