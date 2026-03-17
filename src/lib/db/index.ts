import { SQL } from 'bun';

export const sql = new SQL(process.env.SQL_URL!);
