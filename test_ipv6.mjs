import postgres from 'postgres';
import fs from 'fs';

const testConnection = async () => {
    const sql = postgres({
        host: '2a05:d014:1c06:4d5f:49:8fbb:8c92:fd98',
        port: 5432,
        database: 'postgres',
        username: 'postgres',
        password: '19652004199819481996',
        ssl: 'require',
        connection: { application_name: 'postgres.js' }
    });

    try {
        const res = await sql`select 1 as x`;
        console.log('Success IPv6!', res);

        // Now let's execute the setup sql
        const schema = fs.readFileSync('supabase_setup.sql', 'utf8');
        await sql.unsafe(schema);
        console.log('Successfully executed supabase_setup.sql');
    } catch (e) {
        console.error('Error IPv6:', e.message);
    } finally {
        await sql.end();
    }
};

testConnection();
