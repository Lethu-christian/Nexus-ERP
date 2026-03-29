import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://rcwjksiubkuhmwxxupsp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjd2prc2l1Ymt1aG13eHh1cHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTM3NjUsImV4cCI6MjA4ODI4OTc2NX0.tAZLHUYvL4CQQxaW908XbNN9hu2TSPJBDIFTD5mW9W0'
);

async function check() {
    const { data: txs, error: txError } = await supabase.from('financial_transactions').select('id').limit(1);
    const { data: analysis, error: anError } = await supabase.from('financial_analysis').select('id').limit(1);
    const { data: uploads, error: upError } = await supabase
        .from('financial_uploads')
        .select('id, status, error_message, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('--- DATA CHECK ---');
    console.log('Transactions:', txs?.length || 0, txError?.message || '');
    console.log('Analysis:', analysis?.length || 0, anError?.message || '');
    console.log('Uploads:', JSON.stringify(uploads, null, 2), upError?.message || '');
}

check();
