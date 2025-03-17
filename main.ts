import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TimelineView, VIEW_TYPE_TIMELINE } from './view';

export default class RecentNotesTimelinePlugin extends Plugin {
  async onload() {
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
    
    // Set as a default view when no other tabs are open
    this.app.workspace.onLayoutReady(() => {
      // If there are no open leaf tabs, open the timeline
      if (this.app.workspace.getLeavesOfType('markdown').length === 0) {
        this.activateView();
      }
    });
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