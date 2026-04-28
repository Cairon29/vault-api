// @ts-ignore
import oracledb from "oracledb";

export const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'oracle',
  connectionString: process.env.DB_CONNECTION_STRING || 'localhost:1521/XE'
};

export async function initPool() {
  await oracledb.createPool(dbConfig);
}
