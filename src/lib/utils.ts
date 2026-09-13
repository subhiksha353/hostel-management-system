import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTrackingId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CV-${randomStr}`;
}

export function generateAnonymousStudentId(): string {
  const hex = Math.random().toString(16).substring(2, 7).toUpperCase();
  return `Anonymous Student #${hex}`;
}

export function generateStudentHash(studentIdOrEmail: string): string {
  let hash = 0;
  for (let i = 0; i < studentIdOrEmail.length; i++) {
    const char = studentIdOrEmail.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function formatDateRelative(dateStr: string | Date): string {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function formatDateFull(dateStr: string | Date): string {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return format(date, 'MMM dd, yyyy • hh:mm a');
  } catch {
    return '';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
