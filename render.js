import pg from 'pg';

// Replace with your Render PostgreSQL database connection details
const connectionString = 'postgresql://posts_qpwl_user:mKSezXDXMot261lGn1m5D5zSvAx7UeZU@dpg-cptv1j88fa8c738reee0-a.frankfurt-postgres.render.com/posts_qpwl';
const db = new pg.Client({ connectionString });

async function createTable() {
  try {
    await db.connect();
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        author TEXT
      );
    `);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await db.end();
  }
}

createTable();
