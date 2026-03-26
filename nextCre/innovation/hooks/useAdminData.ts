'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChapterData } from '@/data/types';
import { chapterList, getChapterData } from '@/data';

const ADMIN_STORAGE_KEY = 'admin_data';

interface AdminStorageData {
  chapters: Record<number, ChapterData>;
  // Store a flag if a chapter is completely custom (added by admin) or just overriding defaults
  customChapterIds: number[];
}

const defaultAdminData: AdminStorageData = {
  chapters: {},
  customChapterIds: [],
};

export function useAdminData() {
  const [adminData, setAdminData] = useState<AdminStorageData>(defaultAdminData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        setAdminData(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse admin data', e);
    }
    setIsLoaded(true);
  }, []);

  const saveAdminDataState = useCallback((newData: AdminStorageData) => {
    setAdminData(newData);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(newData));
  }, []);

  // Return the merged chapter data (default + admin override)
  const getMergedChapterData = useCallback((id: number): ChapterData | null => {
    const adminChapter = adminData.chapters[id];
    const defaultChapter = getChapterData(id);

    if (adminChapter) return adminChapter;
    if (defaultChapter) return defaultChapter;
    return null; // Not found anywhere
  }, [adminData]);

  // Save an edited or new chapter
  const saveChapterData = useCallback((id: number, data: ChapterData) => {
    const newData = { ...adminData };
    newData.chapters[id] = data;
    
    // If it's a completely new chapter ID not in default list, add it to customIds
    if (!getChapterData(id) && !newData.customChapterIds.includes(id)) {
      newData.customChapterIds.push(id);
    }
    
    saveAdminDataState(newData);
  }, [adminData, saveAdminDataState]);

  // Delete a local custom chapter or reset an overridden default chapter
  const resetChapterData = useCallback((id: number) => {
    const newData = { ...adminData };
    delete newData.chapters[id];
    
    newData.customChapterIds = newData.customChapterIds.filter(customId => customId !== id);
    
    saveAdminDataState(newData);
  }, [adminData, saveAdminDataState]);

  // Get a list of all chapters (defaults + custom admin ones)
  // Maps to ChapterListItem structure for easy UI rendering
  const getAllChaptersList = useCallback(() => {
    // Start with defaults
    const list = [...chapterList];
    
    // Override titles for defaults if edited
    const mergedList = list.map(ch => {
      const override = adminData.chapters[ch.id];
      if (override) {
        return {
          ...ch,
          titleZh: override.titleZh,
          titleTh: override.titleTh,
          colorClass: ch.colorClass // keep default color or add color logic later
        };
      }
      return ch;
    });

    // Add completely custom chapters
    adminData.customChapterIds.forEach(id => {
      const customCh = adminData.chapters[id];
      if (customCh) {
        mergedList.push({
          id: customCh.chapterNum,
          titleZh: customCh.titleZh,
          titleTh: customCh.titleTh,
          colorClass: 'ch-custom' // assign a default class
        });
      }
    });

    // Sort by chapter ID/num
    return mergedList.sort((a, b) => a.id - b.id);
  }, [adminData]);

  return {
    isLoaded,
    adminData,
    getMergedChapterData,
    saveChapterData,
    resetChapterData,
    getAllChaptersList
  };
}
