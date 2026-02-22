const http = require('http');
const crypto = require('crypto');

console.log('--- Vesper Official Relay (v11 - Sticky Bridge) ---');

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
    console.log('Brave extension requesting link...');
    const key = req.headers['sec-websocket-key'];
    const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    
    const remote = http.request({
        host: host.trim(), port: parseInt(port), path: '/rpc/extension', method: 'GET',
        headers: {
            'Upgrade': 'websocket', 'Connection': 'Upgrade', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13',
            'Authorization': `Bearer ${token.trim()}`, 'X-OpenClaw-Relay-Target': 'extension'
        }
    });

    remote.on('upgrade', (res, remoteSocket, remoteHead) => {
        console.log('>>> TUNNEL ESTABLISHED.');
        
        socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
        
        // Protocol ACK frame
        socket.write(Buffer.from([0x81, 0x02, 0x7b, 0x7d])); 

        socket.pipe(remoteSocket);
        remoteSocket.pipe(socket);
        
        socket.on('error', (e) => { console.log('Local side error:', e.message); socket.destroy(); remoteSocket.destroy(); });
        remoteSocket.on('error', (e) => { console.log('Remote side error:', e.message); socket.destroy(); remoteSocket.destroy(); });
        socket.on('close', () => { console.log('Brave disconnected.'); remoteSocket.destroy(); });
        remoteSocket.on('close', () => { console.log('Vesper closed tunnel.'); socket.destroy(); });
    });

    remote.on('error', (e) => {
        console.error('FAILED TO REACH VESPER:', e.message);
        socket.destroy();
    });

    remote.end();
});

server.listen(18792, '127.0.0.1', () => {
    console.log('v11 sticky bridge listening on 18792...');
});
