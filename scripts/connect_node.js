const http = require('http');
const crypto = require('crypto');

console.log('--- Vesper Official Relay (v14 - Keepalive) ---');

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
    
    // Immediate response to browser to prevent timeout
    socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
    );

    const remote = http.request({
        host: host.trim(),
        port: parseInt(port),
        path: '/rpc', // Using generic /rpc but with specific headers
        method: 'GET',
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
        console.log('>>> TUNNEL ACTIVE.');
        
        // Protocol Handshake Frame
        socket.write(Buffer.from([0x81, 0x02, 0x7b, 0x7d])); 

        remoteSocket.pipe(socket);
        socket.pipe(remoteSocket);
        
        const cleanup = (side) => {
            console.log(`Link closed by ${side}.`);
            socket.destroy();
            remoteSocket.destroy();
        };

        socket.on('error', (e) => cleanup('Brave Error: ' + e.message));
        remoteSocket.on('error', (e) => cleanup('Remote Error: ' + e.message));
        socket.on('end', () => cleanup('Brave End'));
        remoteSocket.on('end', () => cleanup('Remote End'));
        
        // Keepalive ping to Vesper every 15s
        const pingInterval = setInterval(() => {
            if (remoteSocket.writable) {
                remoteSocket.write(Buffer.from([0x89, 0x00])); // WebSocket Ping
            } else {
                clearInterval(pingInterval);
            }
        }, 15000);
    });

    remote.on('error', (e) => {
        console.error('REMOTE CONNECTION FAILED:', e.message);
        socket.destroy();
    });

    remote.end();
});

server.listen(18792, '127.0.0.1', () => {
    console.log('v14 Bridge listening on 18792. Click Brave icon.');
});
