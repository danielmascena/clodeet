const https = require('https');

const req = https.request({
  hostname: 'leetcode.com',   // just the domain, no protocol
  path: '/graphql',           // path goes here
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const { data: { activeDailyCodingChallengeQuestion: { question } } } = JSON.parse(data);
    console.log(question);
  });
});

req.write(JSON.stringify({
  query: `{ activeDailyCodingChallengeQuestion { question { title codeSnippets { lang langSlug code } } } }`
}));

req.end();
