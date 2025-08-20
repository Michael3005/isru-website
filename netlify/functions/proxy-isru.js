const https = require('https');

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

        // Make direct HTTPS request to ISRU API
        const targetUrl = `https://isrucamp.com/api/users/users/profile/${username}/`;
        
        const response = await new Promise((resolve, reject) => {
            const req = https.get(targetUrl, {
                headers: {
                    'User-Agent': 'ISRU-Daily-App/1.0',
                    'Accept': 'application/json'
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`API request failed: ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });

        // Parse and return the data
        const userData = JSON.parse(response);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userData)
        };

    } catch (error) {
        console.error('Function error:', error);
        
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
