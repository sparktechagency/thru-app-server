const { getJson } = require('serpapi');

const apiKey = 'e74740bff8983d1075208116348d3acbc330e4df17ed65be0acb4d64bf566fe1';

async function test() {
    try {
        const response = await getJson({
            engine: 'google_events',
            q: 'Jazz',
            location: 'Austin, TX',
            api_key: apiKey,
        });

        const fs = require('fs');
        fs.writeFileSync('serpapi-full-response.json', JSON.stringify(response, null, 2));
        console.log('Saved to serpapi-full-response.json');
    } catch (error) {
        console.error(error);
    }
}

test();
