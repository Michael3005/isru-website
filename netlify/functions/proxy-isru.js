const https = require('https');
const http = require('http');

exports.handler = async (event) => {
    // Enable CORS for your domain
    const headers = {
        'Access-Control-Allow-Origin': 'https://isrudaily.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { username } = JSON.parse(event.body);
        
        if (!username) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Username is required' })
            };
        }

        // Your Resi proxy credentials
        const proxyOptions = {
            host: 'resi.thexyzstore.com',
            port: 8000,
            path: `https://isrucamp.com/api/users/users/profile/${username}/`,
            method: 'GET',
            headers: {
                'Proxy-Authorization': 'Basic ' + Buffer.from('0xpuppetxyz:m3r2i6lu-country-US-session-s3ap5lzh-duration-60').toString('base64'),
                'User-Agent': 'ISRU-Daily-App/1.0'
            }
        };

        // Make request through Resi proxy
        const proxyData = await new Promise((resolve, reject) => {
            const req = http.request(proxyOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`Proxy request failed: ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });

        // Parse and return the data
        const userData = JSON.parse(proxyData);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userData)
        };

    } catch (error) {
        console.error('Proxy function error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to fetch user data',
                details: error.message 
            });
        };
    }
};
