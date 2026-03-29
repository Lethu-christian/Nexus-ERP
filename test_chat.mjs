const url = 'https://rcwjksiubkuhmwxxupsp.supabase.co/functions/v1/chat-ai';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjd2prc2l1Ymt1aG13eHh1cHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTM3NjUsImV4cCI6MjA4ODI4OTc2NX0.tAZLHUYvL4CQQxaW908XbNN9hu2TSPJBDIFTD5mW9W0';

async function test() {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
}

test();
