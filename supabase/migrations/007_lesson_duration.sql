-- ============================================================
-- Migration 007: Add duration_seconds to lessons
-- Run this in the Supabase SQL editor
-- ============================================================

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
