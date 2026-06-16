import { DuckDBInstance } from '@duckdb/node-api';

const instance = await DuckDBInstance.create(':memory:'); // メモリ上のDB
const conn = await instance.connect();

// ファイルパスをテーブルの位置に書く（これがAthenaに近い）
const reader = await conn.runAndReadAll("SELECT count(*) AS rows FROM 'data/watch_logs.csv'");
console.log(reader.getRows());