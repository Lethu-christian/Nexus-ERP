import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const run = async () => {
    const client = new Client({
        connectionString: 'postgresql://postgres:19652004199819481996@db.rcwjksiubkuhmwxxupsp.supabase.co:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected via pg!');
        const schema = fs.readFileSync('supabase_setup.sql', 'utf8');
        await client.query(schema);
        console.log('Successfully executed schema!');
    } catch (e) {
        console.error('Error pg:', e.message);
    } finally {
        await client.end();
    }
};

run();
