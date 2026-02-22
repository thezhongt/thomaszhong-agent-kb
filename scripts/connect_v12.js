const http = require('http');
const crypto = require('crypto');

console.log('--- Vesper Official Relay (v12 - Protocol Match) ---');

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
    res.end(JSON.stringify({ ok: true, service: 'openclaw-relay', status: 'ready' }));
});

server.on('upgrade', (req, socket, head) => {
    console.log('Brave extension connecting...');
    const key = req.headers['sec-websocket-key'];
    const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    
    // 1. Establish remote tunnel FIRST
    const remote = http.request({
        host: host.trim(), port: parseInt(port), path: '/rpc/extension', method: 'GET',
        headers: {
            'Upgrade': 'websocket', 'Connection': 'Upgrade', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13',
            'Authorization': `Bearer ${token.trim()}`, 'X-OpenClaw-Relay-Target': 'extension'
        }
    });

    remote.on('upgrade', (res, remoteSocket, remoteHead) => {
        console.log('>>> TUNNEL ACTIVE.');
        
        // 2. ONLY now tell Brave the connection is valid
        socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
        
        // 3. Bidirectional pipe
        remoteSocket.pipe(socket);
        socket.pipe(remoteSocket);
        
        const cleanup = () => {
            console.log('Cleaning up connection.');
            socket.destroy();
            remoteSocket.destroy();
        };

        socket.on('error', cleanup);
        remoteSocket.on('error', cleanup);
        socket.on('end', cleanup);
        remoteSocket.on('end', cleanup);
    });

    remote.on('error', (e) => {
        console.error('REMOTE ERROR:', e.message);
        socket.destroy();
    });

    remote.end();
});

server.listen(18792, '127.0.0.1', () => {
    console.log('v12 Bridge listening on 18792...');
});
