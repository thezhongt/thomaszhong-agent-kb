const http = require('http');
const crypto = require('crypto');

console.log('--- Vesper Tailscale Bridge (v9) ---');

const host = process.argv.includes('--host') ? process.argv[process.argv.indexOf('--host') + 1] : null;
const port = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : null;
const token = process.argv.includes('--token') ? process.argv[process.argv.indexOf('--token') + 1] : null;

if (!host || !port || !token) {
    console.error('Usage: node connect.js --host <tailscale_ip> --port <port> --token <token>');
    process.exit(1);
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'openclaw-relay', status: 'ready' }));
});

server.on('upgrade', (req, socket, head) => {
    console.log('Handshaking Brave...');
    const key = req.headers['sec-websocket-key'];
    const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');

    const remote = http.request({
        host: host.trim(), port: parseInt(port), path: '/rpc/extension', method: 'GET',
        headers: {
            'Upgrade': 'websocket',
            'Connection': 'Upgrade',
            'Sec-WebSocket-Key': key,
            'Sec-WebSocket-Version': '13',
            'Authorization': `Bearer ${token.trim()}`,
            'X-OpenClaw-Relay-Target': 'extension'
        }
    });

    remote.on('upgrade', (res, remoteSocket, remoteHead) => {
        console.log('>>> LINK ACTIVE.');
        socket.write(Buffer.from([0x81, 0x02, 0x7b, 0x7d])); // Extension ACK
        socket.pipe(remoteSocket); remoteSocket.pipe(socket);
        socket.on('error', () => { socket.destroy(); remoteSocket.destroy(); });
        remoteSocket.on('error', () => { socket.destroy(); remoteSocket.destroy(); });
    });

    remote.on('error', (e) => { console.error('FAILED TO REACH VESPER:', e.message); socket.destroy(); });
    remote.end();
});

server.listen(18792, '127.0.0.1', () => {
    console.log('v9 Ready. Listening on local port 18792.');
});
