import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loadEnvConfig, type AppConfig } from '@/lib/config';

export type SettingsState = AppConfig & {
	set: (partial: Partial<AppConfig>) => void;
	resetToEnv: () => void;
};

const initial = loadEnvConfig();

export const useSettings = create<SettingsState>()(
	persist(
		(set, get) => ({
			...initial,
			set: (partial) => set({ ...get(), ...partial }),
			resetToEnv: () => set(loadEnvConfig()),
		}),
		{ name: 'panoramablock.settings' }
	)
);
