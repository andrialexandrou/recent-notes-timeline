import { App, PluginSettingTab, Setting } from 'obsidian';
import RecentNotesTimelinePlugin from './main';

export interface TimelineSettings {
    replaceEmptyState: boolean;
}

export const DEFAULT_SETTINGS: TimelineSettings = {
    replaceEmptyState: true
};

export class TimelineSettingTab extends PluginSettingTab {
    plugin: RecentNotesTimelinePlugin;

    constructor(app: App, plugin: RecentNotesTimelinePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Recent Notes Timeline Settings' });

        new Setting(containerEl)
            .setName('Replace empty state')
            .setDesc('Show timeline when no file is open (replaces "No file is open" view)')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.replaceEmptyState)
                .onChange(async (value) => {
                    this.plugin.settings.replaceEmptyState = value;
                    await this.plugin.saveSettings();
                }));
    }
}