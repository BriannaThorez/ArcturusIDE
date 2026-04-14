import { useState, useEffect } from 'react';
import defaultSettings from '../usersettings.json';

export type UserSettings = typeof defaultSettings;

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('arcturus_usersettings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse user settings', e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('arcturus_usersettings', JSON.stringify(settings));
  }, [settings]);

  const updateLayout = (key: keyof UserSettings['layout'], value: number) => {
    setSettings(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: value
      }
    }));
  };

  const updatePanel = (panel: keyof UserSettings['panels'], content: string) => {
    setSettings(prev => ({
      ...prev,
      panels: {
        ...prev.panels,
        [panel]: content
      }
    }));
  };

  return { settings, updateLayout, updatePanel };
}
