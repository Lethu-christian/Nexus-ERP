(async () => {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_NEW_KEY_HERE';
    const res = await fetch(url);
    console.log(await res.text());
})();
