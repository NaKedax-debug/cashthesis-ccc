import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cashthesis.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL NOT NULL DEFAULT 0,
      endpoint TEXT NOT NULL,
      trend_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS trends_cache (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      subreddit TEXT,
      extra TEXT,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_scores (
      trend_id TEXT PRIMARY KEY,
      virality INTEGER NOT NULL DEFAULT 0,
      niche_fit INTEGER NOT NULL DEFAULT 0,
      content_potential INTEGER NOT NULL DEFAULT 0,
      content_value INTEGER NOT NULL DEFAULT 0,
      suggested_format TEXT,
      hook_idea TEXT,
      suggested_angle TEXT,
      reject INTEGER NOT NULL DEFAULT 0,
      scored_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trend_id) REFERENCES trends_cache(id)
    );

    CREATE TABLE IF NOT EXISTS trend_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trend_id TEXT NOT NULL,
      content_value INTEGER NOT NULL DEFAULT 0,
      niche_fit INTEGER NOT NULL DEFAULT 0,
      hook_potential INTEGER NOT NULL DEFAULT 0,
      actionability INTEGER NOT NULL DEFAULT 0,
      combined_score INTEGER NOT NULL DEFAULT 0,
      reject INTEGER NOT NULL DEFAULT 0,
      suggested_angle TEXT,
      content_format TEXT,
      emotional_trigger TEXT DEFAULT 'none',
      cross_platform_score INTEGER NOT NULL DEFAULT 20,
      cross_platform_topic TEXT,
      cross_platform_sources TEXT,
      scored_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trend_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trend_id TEXT NOT NULL,
      source TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      snapshot_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_trends (
      trend_id TEXT PRIMARY KEY,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trend_id) REFERENCES trends_cache(id)
    );

    CREATE TABLE IF NOT EXISTS content_plans (
      id TEXT PRIMARY KEY,
      trend_id TEXT NOT NULL,
      trend_title TEXT NOT NULL,
      trend_source TEXT NOT NULL,
      platforms TEXT NOT NULL,
      seo_keywords TEXT NOT NULL DEFAULT '[]',
      hook_variants TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
    CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage(provider);
    CREATE INDEX IF NOT EXISTS idx_trends_cache_source ON trends_cache(source);
    CREATE INDEX IF NOT EXISTS idx_trends_cache_fetched ON trends_cache(fetched_at);
    CREATE INDEX IF NOT EXISTS idx_content_plans_trend ON content_plans(trend_id);
    CREATE INDEX IF NOT EXISTS idx_content_plans_status ON content_plans(status);

    CREATE TABLE IF NOT EXISTS affiliate_links (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      niche TEXT NOT NULL,
      commission TEXT NOT NULL DEFAULT '',
      signup_url TEXT NOT NULL DEFAULT '',
      tracking_url TEXT NOT NULL DEFAULT '',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS funnels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content_plan_id TEXT,
      steps TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_trend_scores_trend ON trend_scores(trend_id);
    CREATE INDEX IF NOT EXISTS idx_trend_snapshots_trend ON trend_snapshots(trend_id);
    CREATE INDEX IF NOT EXISTS idx_trend_snapshots_at ON trend_snapshots(snapshot_at);

    CREATE INDEX IF NOT EXISTS idx_affiliate_links_niche ON affiliate_links(niche);
    CREATE INDEX IF NOT EXISTS idx_funnels_plan ON funnels(content_plan_id);
  `);
}
