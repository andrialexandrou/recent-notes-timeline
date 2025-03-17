import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TimelineView, VIEW_TYPE_TIMELINE } from './view';
import { TimelineSettings, DEFAULT_SETTINGS, TimelineSettingTab } from './settings';

export default class RecentNotesTimelinePlugin extends Plugin {
  settings: TimelineSettings;

  async onload() {
    // Load settings
    await this.loadSettings();
    
    // Add settings tab
    this.addSettingTab(new TimelineSettingTab(this.app, this));

    // Register the custom view type
    this.registerView(
      VIEW_TYPE_TIMELINE,
      (leaf) => new TimelineView(leaf, this)
    );

    // Add a ribbon icon to open the timeline in a new tab
    this.addRibbonIcon('clock', 'Recent Notes Timeline', () => {
      this.activateView();
    });

    // Add a command to show the timeline
    this.addCommand({
      id: 'show-recent-notes-timeline',
      name: 'Show Recent Notes Timeline',
      callback: () => {
        this.activateView();
      },
    });
    
    // Override the default empty state view if enabled
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        if (this.settings.replaceEmptyState) {
          this.checkForEmptyState();
        }
      })
    );
    
    // Initial check if enabled
    if (this.settings.replaceEmptyState) {
      setTimeout(() => {
        this.checkForEmptyState();
      }, 500);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  checkForEmptyState() {
    // Get the active leaf
    const activeLeaf = this.app.workspace.activeLeaf;
    
    if (!activeLeaf) return;
    
    // Check if we're showing the empty state
    const viewState = activeLeaf.getViewState();
    
    // Look for the empty state view type or check if the view is empty
    if (viewState.type === 'empty') {
      // Replace with our timeline view
      activeLeaf.setViewState({
        type: VIEW_TYPE_TIMELINE,
        active: true
      });
    }
  }

  async onunload() {
    // Unload the plugin and close any open views
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMELINE);
  }

  async activateView() {
    // If the view is already open in the workspace, show that instance
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMELINE);
    if (existing.length) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }

    // Create a new leaf in the main editor area
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.setViewState({
      type: VIEW_TYPE_TIMELINE,
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }
}