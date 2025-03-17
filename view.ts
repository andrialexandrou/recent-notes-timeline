import { ItemView, TFile, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import RecentNotesTimelinePlugin from './main';
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
  
  // This icon will be shown in the tab header
  icon = 'clock';

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
    // Use the entire container for the content
    const container = this.containerEl.children[1];
    container.empty();
    
    // Add the timeline class to the main container
    container.addClass('recent-notes-timeline');
    
    // Create a content wrapper with proper width constraints
    const contentWrapper = container.createDiv({ cls: 'timeline-wrapper' });
    
    // Create a header with a refresh button
    const header = contentWrapper.createDiv({ cls: 'timeline-header' });
    
    // Add a title
    const titleContainer = header.createDiv({ cls: 'timeline-title-container' });
    const title = titleContainer.createEl('h2', { 
      cls: 'timeline-title',
      text: 'Recent Notes Timeline' 
    });
    const subtitle = titleContainer.createEl('p', { 
      cls: 'timeline-subtitle',
      text: 'Your latest updates and creations' 
    });
    
    // Add stats container
    const statsContainer = header.createDiv({ cls: 'timeline-stats' });
    
    // Add refresh button
    const refreshButton = header.createEl('button', {
      cls: 'timeline-refresh-button',
      attr: { 'aria-label': 'Refresh timeline' }
    });
    refreshButton.innerHTML = '↻';
    refreshButton.addEventListener('click', () => this.refreshTimeline());

    // Create the timeline content container
    this.contentEl = contentWrapper.createDiv({ cls: 'timeline-content' });
    
    // Load the initial timeline data
    await this.refreshTimeline();
    
    // Update stats after loading data
    this.updateStats(statsContainer);
    
    // Set up auto-refresh every 5 minutes
    this.refreshInterval = window.setInterval(() => {
      this.refreshTimeline().then(() => {
        this.updateStats(statsContainer);
      });
    }, 5 * 60 * 1000);
    
    // Register an event handler to refresh when files change
    this.registerEvent(
      this.app.vault.on('modify', () => {
        this.refreshTimeline().then(() => {
          this.updateStats(statsContainer);
        });
      })
    );
    
    this.registerEvent(
      this.app.vault.on('create', () => {
        this.refreshTimeline().then(() => {
          this.updateStats(statsContainer);
        });
      })
    );
  }
  
  private updateStats(container: HTMLElement) {
    container.empty();
    
    const files = this.app.vault.getMarkdownFiles();
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    // Count files modified in the last day, week, and month
    const lastDay = files.filter(file => (now - file.stat.mtime) < dayInMs).length;
    const lastWeek = files.filter(file => (now - file.stat.mtime) < 7 * dayInMs).length;
    const lastMonth = files.filter(file => (now - file.stat.mtime) < 30 * dayInMs).length;
    
    const daySpan = container.createSpan({ cls: 'timeline-stat' });
    daySpan.createSpan({ cls: 'timeline-stat-value', text: lastDay.toString() });
    daySpan.createSpan({ cls: 'timeline-stat-label', text: ' today' });
    
    const weekSpan = container.createSpan({ cls: 'timeline-stat' });
    weekSpan.createSpan({ cls: 'timeline-stat-value', text: lastWeek.toString() });
    weekSpan.createSpan({ cls: 'timeline-stat-label', text: ' this week' });
    
    const monthSpan = container.createSpan({ cls: 'timeline-stat' });
    monthSpan.createSpan({ cls: 'timeline-stat-value', text: lastMonth.toString() });
    monthSpan.createSpan({ cls: 'timeline-stat-label', text: ' this month' });
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
    const currentYear = new Date().getFullYear();
    
    for (const note of notes) {
      const date = new Date(note.timestamp);
      
      // Format the date as "Month Day" or "Month Day, Year" if not current year
      const month = date.toLocaleString('en-US', { month: 'long' });
      const day = date.getDate();
      const year = date.getFullYear();
      
      let dateString = `${month} ${day}`;
      if (year !== currentYear) {
        dateString += `, ${year}`;
      }
      
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
      
      // Add main content container
      const contentSection = infoSection.createDiv({ cls: 'timeline-entry-content' });
      
      // Add file name as a link
      const titleEl = contentSection.createEl('a', {
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
      
      // Add action indicator and timestamp
      const metaInfo = contentSection.createDiv({ cls: 'timeline-entry-meta' });
      
      // Action text
      const actionEl = metaInfo.createEl('span', {
        cls: 'timeline-entry-action',
        text: note.isCreated ? 'Created' : 'Modified'
      });
      
      // Add a timestamp
      const timeEl = metaInfo.createEl('span', {
        cls: 'timeline-entry-time',
        text: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      // Try to get a preview of the content
      this.getFilePreview(note.file).then(preview => {
        if (preview) {
          const previewEl = entry.createDiv({
            cls: 'timeline-entry-preview'
          });
          
          // Use Obsidian's Markdown renderer
          MarkdownRenderer.renderMarkdown(
            preview,
            previewEl,
            note.file.path,
            this
          );
        }
      });
      
      // We're removing the file path display as requested
      
      // Open button removed as requested
    }
  }
  
  // Helper method to get a preview of the file content for markdown rendering
  private async getFilePreview(file: TFile): Promise<string | null> {
    try {
      // Read the entire file content
      const content = await this.app.vault.read(file);
      
      // Get the lines of content (up to 7 lines)
      const lines = content.split('\n').slice(0, 7);
      
      // Join the lines back together
      let preview = lines.join('\n');
      
      // If there are more lines, add an indicator
      if (content.split('\n').length > 7) {
        preview += '\n\n*...*';
      }
      
      return preview;
    } catch (error) {
      return null;
    }
  }
}