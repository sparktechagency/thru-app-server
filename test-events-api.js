// Test script for Events API
const https = require('https');
const http = require('http');

// Configuration
const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

// Test without authentication first to see the error
console.log('Testing Events API...\n');

const testEndpoint = (path, description) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log(`\n📍 ${description}`);
        console.log(`   GET http://${HOST}:${PORT}${path}`);

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`   Status: ${res.statusCode}`);
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`   Response:`, JSON.stringify(jsonData, null, 2));
                } catch (e) {
                    console.log(`   Response:`, data);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`   Error: ${error.message}`);
            reject(error);
        });

        req.end();
    });
};

// Run tests
(async () => {
    try {
        // Test 1: Basic events query (will fail without auth, but shows endpoint is working)
        await testEndpoint('/api/events?location=Austin, TX', 'Test 1: Basic Events Query');

        // Test 2: With category (eventType)
        await testEndpoint('/api/events?location=New York&eventType=Music', 'Test 2: Events with Category (Music)');

        // Test 3: With date range
        await testEndpoint('/api/events?location=Austin&dateFilter=range&startDate=2026-01-01&endDate=2026-01-31', 'Test 3: Events with Date Range');

        // Test 4: With rating filter
        await testEndpoint('/api/events?location=Austin&rating=4', 'Test 4: Events with Minimum Rating (4)');

        // Test 5: Events with search term
        await testEndpoint('/api/events?location=Austin&searchTerm=Jazz', 'Test 5: Events with Search Term (Jazz)');

        // Test 6: Database only endpoint with filters
        await testEndpoint('/api/events/db?location=Austin&eventType=Music', 'Test 6: Database Only Query with Category');

        console.log('\n✅ Tests completed!');
        console.log('\n📝 Note: You need to provide a valid JWT token in the Authorization header to access these endpoints.');
        console.log('   Example: Authorization: Bearer YOUR_JWT_TOKEN');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
})();
