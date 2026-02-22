const http = require('http');
const crypto = require('crypto');

console.log('--- Vesper Official Node Bridge (v7.1) ---');

const host = process.argv.includes('--host') ? process.argv[process.argv.indexOf('--host') + 1] : null;
const port = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : null;
const token = process.argv.includes('--token') ? process.argv[process.argv.indexOf('--token') + 1] : null;

if (!host || !port || !token) {
    console.error('Usage: node connect.js --host <ip> --port <port> --token <token>');
    process.exit(1);
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, version: '2026.2.1', service: 'openclaw-relay', status: 'ready' }));
});

server.on('upgrade', (req, socket, head) => {
    const key = req.headers['sec-websocket-key'];
    const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');

    const remote = http.request({
        host: host.trim(), port: parseInt(port), path: '/rpc', method: 'GET',
        headers: {
            'Upgrade': 'websocket', 'Connection': 'Upgrade', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13',
            'Authorization': `Bearer ${token.trim()}`
        }
    });

    remote.on('upgrade', (res, remoteSocket, remoteHead) => {
        console.log('>>> Connection established.');

        const hello = JSON.stringify({
            jsonrpc: "2.0", method: "node.hello",
            params: {
                id: "thomas-laptop", name: "Thomas Laptop",
                claims: { browser: true, browserProfile: "chrome" }
            }
        });

        const msg = Buffer.from(hello);
        let frame;
        if (msg.length <= 125) {
            frame = Buffer.alloc(msg.length + 2);
            frame[0] = 0x81; frame[1] = msg.length; msg.copy(frame, 2);
        } else {
            frame = Buffer.alloc(msg.length + 4);
            frame[0] = 0x81; frame[1] = 126;
            frame.writeUInt16BE(msg.length, 2); msg.copy(frame, 4);
        }
        
        remoteSocket.write(frame);
        console.log('>>> Node registered with Gateway.');

        socket.pipe(remoteSocket);
        remoteSocket.pipe(socket);
        socket.on('error', () => { socket.destroy(); remoteSocket.destroy(); });
        remoteSocket.on('error', () => { socket.destroy(); remoteSocket.destroy(); });
    });

    remote.on('error', (e) => { console.error('FAILED:', e.message); socket.destroy(); });
    remote.end();
});

server.listen(18792, '127.0.0.1', () => { console.log('Ready. Toggle the Brave icon.'); });
