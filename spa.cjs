const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'dist');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  // SPA: 정적 파일이 아니면 항상 index.html
  const ext = path.extname(p);
  if (ext && fs.existsSync(path.join(ROOT, p))) {
    const fp = path.join(ROOT, p);
    const data = fs.readFileSync(fp);
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
    return;
  }
  const data = fs.readFileSync(path.join(ROOT, 'index.html'));
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(data);
}).listen(8097, () => console.log('SPA fallback on 8097'));
