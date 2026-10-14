import { Global, Module } from '@nestjs/common';
import { Database } from './database';
import { PostgresDatabase } from './postgres';
import { SqliteDatabase } from './sqlite';

/** .env-д DATABASE_URL байвал PostgreSQL, эс бөгөөс SQLite (data/ub.sqlite) */
function openDatabase(): Database {
  const url = process.env.DATABASE_URL;
  if (url) {
    console.log('  🐘 Өгөгдлийн сан: PostgreSQL');
    return new PostgresDatabase(url);
  }
  const db = new SqliteDatabase();
  console.log('  🗄  Өгөгдлийн сан: SQLite (' + db.file + ')');
  return db;
}

@Global()
@Module({
  providers: [{ provide: Database, useFactory: openDatabase }],
  exports: [Database],
})
export class DatabaseModule {}
