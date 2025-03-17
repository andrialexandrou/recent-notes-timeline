import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import RecentNotesTimelinePlugin from './main';

export const VIEW_TYPE_TIMELINE = 'recent-notes-timeline-view';

interface NoteInfo {
  file: TFile;
  timestamp: number;
  isCreated: boolean; // true if creation date is more recent than modification date
}

export class TimelineView extends ItemView {
  private plugin: RecentNotesTimelinePlugin;
  private contentEl: HTMLElement;
  private refreshInterval: number;

  constructor(leaf: WorkspaceLeaf, plugin: RecentNotesTimelinePlugin) {
    super(leaf);
    this.plugin = plugin;
    this.refreshInterval = -1;
  }

  getViewType(): string {
    return VIEW_TYPE_TIMELINE;
  }

  getDisplayText(): string {
    return 'Recent Notes Timeline';
  }

  async onOpen() {
    // Create container for the timeline
    const container = this.contentEl.createDiv({ cls: 'recent-notes-timeline' });
    
    // Create a header with a refresh button
    const header = container.createDiv({ cls: 'timeline-header' });
    const title = header.createEl('h3', { text: 'Recent Notes Timeline' });
    
    const refreshButton = header.createEl('button', {
      cls: 'timeline-refresh-button',
      attr: { 'aria-label': 'Refresh timeline' }
    });
    refreshButton.innerHTML = '↻';
    refreshButton.addEventListener('click', () => this.refreshTimeline());

    // Create the timeline content container
    this.contentEl = container.createDiv({ cls: 'timeline-content' });
    
    // Load the initial timeline data
    await this.refreshTimeline();
    
    // Set up auto-refresh every 5 minutes
    this.refreshInterval = window.setInterval(() => {
      this.refreshTimeline();
    }, 5 * 60 * 1000);
  }

  async onClose() {
    // Clear the auto-refresh interval when the view is closed
    if (this.refreshInterval !== -1) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = -1;
    }
  }

  async refreshTimeline() {
    // Clear the current content
    this.contentEl.empty();
    
    // Get all notes from the vault
    const notes = this.getNoteInfos();
    
    if (notes.length === 0) {
      this.contentEl.createEl('p', { 
        text: 'No recent notes found.',
        cls: 'timeline-empty-message'
      });
      return;
    }
    
    // Build the timeline UI
    this.buildTimelineUI(notes);
  }

  private getNoteInfos(): NoteInfo[] {
    const notes: NoteInfo[] = [];
    
    // Get all markdown files from the vault
    const files = this.app.vault.getMarkdownFiles();
    
    for (const file of files) {
      const createdTime = file.stat.ctime;
      const modifiedTime = file.stat.mtime;
      
      // Use the most recent timestamp (created or modified)
      const timestamp = Math.max(createdTime, modifiedTime);
      const isCreated = createdTime >= modifiedTime;
      
      notes.push({
        file,
        timestamp,
        isCreated
      });
    }
    
    // Sort by timestamp in descending order (newest first)
    return notes.sort((a, b) => b.timestamp - a.timestamp);
  }

  private buildTimelineUI(notes: NoteInfo[]) {
    let currentDate = '';
    
    for (const note of notes) {
      const date = new Date(note.timestamp);
      const dateString = date.toLocaleDateString();
      
      // Add date separator if we've moved to a new date
      if (dateString !== currentDate) {
        currentDate = dateString;
        
        this.contentEl.createEl('div', {
          cls: 'timeline-date-separator',
          text: currentDate
        });
      }
      
      // Create the timeline entry
      const entry = this.contentEl.createDiv({ cls: 'timeline-entry' });
      
      // Create the note info section
      const infoSection = entry.createDiv({ cls: 'timeline-entry-info' });
      
      // Add file name as a link
      const titleEl = infoSection.createEl('a', {
        cls: 'timeline-entry-title',
        text: note.file.basename,
        attr: {
          'data-path': note.file.path,
          'aria-label': `Open note: ${note.file.basename}`
        }
      });
      
      // Open the note when clicked
      titleEl.addEventListener('click', (event) => {
        event.preventDefault();
        this.app.workspace.openLinkText(note.file.path, '', false);
      });
      
      // Add a timestamp
      const timeEl = infoSection.createEl('span', {
        cls: 'timeline-entry-time',
        text: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      // Add action indicator (created or modified)
      const actionEl = infoSection.createEl('span', {
        cls: 'timeline-entry-action',
        text: note.isCreated ? 'Created' : 'Modified'
      });
      
      // Add a preview of the content (optional, could be heavy)
      // For now, we'll just show the file path
      const pathEl = entry.createEl('div', {
        cls: 'timeline-entry-path',
        text: note.file.path
      });
    }
  }
}