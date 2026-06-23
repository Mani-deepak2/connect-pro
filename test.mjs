import http from 'http';

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Look for Next.js error title or message
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    console.log("STATUS:", res.statusCode);
    console.log("TITLE:", titleMatch ? titleMatch[1] : "No title found");
    // Often the actual error is in a JSON script tag or a specific div
    const errMatch = data.match(/data-nextjs-dialog-header="([^"]*)"/);
    if (errMatch) console.log("HEADER:", errMatch[1]);
    
    // Dump first 1000 chars of body just in case
    console.log("BODY_START:", data.substring(0, 1000));
  });
}).on('error', (err) => {
  console.log("FETCH ERROR:", err.message);
});
