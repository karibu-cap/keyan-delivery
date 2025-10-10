import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import urlSlug from 'url-slug'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function normalizeFileName(fileName: string): string {
  // random number.
  const number = Math.floor(Math.random() * 1000)
  return fileName
    .normalize('NFD') // Normalize Unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[^\w\s.-]/g, '') // Remove special characters except . and -
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[-]+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^[-]+|[-]+$/g, '') // Remove leading/trailing hyphens
    .replace(/\((\d+)\)/g, '') // Remove parenthetical numbers
    .toLowerCase()
    .trim()
}


export function generateSlug(title: string): string {
  return urlSlug(title)
}
