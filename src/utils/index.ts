import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getSarahAvatarPath(): string {
  // Check if we're in production (GitHub Pages deployment)
  const isProduction = import.meta.env.PROD && window.location.hostname === 'dfegarido.github.io';
  return isProduction ? '/chatbot/sarah-avatar.svg' : '/sarah-avatar.svg';
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function removeThinkingBlocks(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

export function parseCodeBlocks(content: string) {
  const parts = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let matches = [];

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    matches.push({
      type: 'code',
      start: match.index,
      end: match.index + match[0].length,
      language: match[1] || 'text',
      content: match[2].trim()
    });
  }

  matches.sort((a, b) => a.start - b.start);

  for (const match of matches) {
    if (match.start > lastIndex) {
      const textContent = content.substring(lastIndex, match.start).trim();
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent
        });
      }
    }

    parts.push(match);
    lastIndex = match.end;
  }

  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex).trim();
    if (textContent) {
      parts.push({
        type: 'text',
        content: textContent
      });
    }
  }

  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: content
    });
  }

  return parts;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
