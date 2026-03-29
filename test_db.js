const postgres = require('postgres');

const testConnection = async () => {
    const url5432 = 'postgresql://postgres.rcwjksiubkuhmwxxupsp:19652004199819481996@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';
    const sql5432 = postgres(url5432, { ssl: 'require' });

    try {
        const res = await sql5432`select 1 as x`;
        console.log('Success 5432!', res);
    } catch (e) {
        console.error('Error 5432:', e.message);
    } finally {
        await sql5432.end();
    }

    const url6543 = 'postgresql://postgres.rcwjksiubkuhmwxxupsp:19652004199819481996@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
    const sql6543 = postgres(url6543, { ssl: 'require' });

    try {
        const res2 = await sql6543`select 1 as x`;
        console.log('Success 6543!', res2);
    } catch (e) {
        console.error('Error 6543:', e.message);
    } finally {
        await sql6543.end();
    }
};

testConnection();
