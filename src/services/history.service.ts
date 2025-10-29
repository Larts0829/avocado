export interface HistoryItem {
  id: string;
  type: 'Disease' | 'Pest';
  label: string;
  confidence: number;
  modelType: 'leaf' | 'fruit' | 'tree';
  imageData: string;
  date: string;
  time: string;
  description: string;
  recommendations: string[];
}

class HistoryService {
  private readonly HISTORY_KEY = 'snapocado_history';
  private readonly MAX_ITEMS = 20; // Limit to 20 items

  async saveToHistory(item: Omit<HistoryItem, 'id' | 'date' | 'time'>): Promise<void> {
    try {
      let history = await this.getHistory();
      
      const now = new Date();
      const newItem: HistoryItem = {
        ...item,
        id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      };

      history.unshift(newItem); // Add to beginning
      
      // Keep only the most recent MAX_ITEMS
      if (history.length > this.MAX_ITEMS) {
        history = history.slice(0, this.MAX_ITEMS);
      }
      
      try {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      } catch (storageError: any) {
        // If still quota exceeded, remove oldest items and retry
        if (storageError.name === 'QuotaExceededError') {
          console.warn('Storage quota exceeded, removing old items...');
          history = history.slice(0, 10); // Keep only 10 most recent
          localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error('Failed to save to history:', error);
      throw error;
    }
  }

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const value = localStorage.getItem(this.HISTORY_KEY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  async getFilteredHistory(filter: 'all' | 'Disease' | 'Pest'): Promise<HistoryItem[]> {
    const history = await this.getHistory();
    if (filter === 'all') return history;
    return history.filter(item => item.type === filter);
  }

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete history item:', error);
      throw error;
    }
  }

  async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  }

  async getHistoryStats(): Promise<{ total: number; showing: number }> {
    const history = await this.getHistory();
    return {
      total: history.length,
      showing: history.length
    };
  }
}

export const historyService = new HistoryService();
