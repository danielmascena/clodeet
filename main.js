#!/usr/bin/env node

import { request } from "node:https";
import { mkdir, writeFile } from 'node:fs/promises';

const mapProgExt = {
  'javascript': 'js',
  'typescript': 'ts',
  'python': 'py',
  'java': 'java',
  'ruby': 'rb',
  'php': 'php',
  'kotlin': 'kt',
  'cpp': 'cpp',
}
var progLanguage = process.argv[2] || 'javascript';

const req = request({
  hostname: 'leetcode.com',   // just the domain, no protocol
  path: '/graphql',           // path goes here
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, async res => {
  let data = '';

  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${res.headers}`);

  if (res.statusCode === 200) {

    for await (const chunk of res) {
      data += chunk;
    }
  }
  try {
    const { data: { activeDailyCodingChallengeQuestion: { question: { title, titleSlug, codeSnippets, exampleTestcases, content, difficulty } } } } = JSON.parse(data);
    console.log(title);
    console.log(codeSnippets)
    console.log(exampleTestcases)

    for (const { langSlug, code } of codeSnippets) {
      if (langSlug === progLanguage) {
        try {
          const dir = titleSlug.slice(0, 10);
          await mkdir(dir);
          await writeFile(`${dir}/code.${mapProgExt[progLanguage]}`, code);
          await writeFile(`./${dir}/testcases.txt`, exampleTestcases);
          await writeFile(`./${dir}/description.html`,
            `
              <head>
                <title>Leetcode daily problem</title>
              <head>
              <body>
                <header>
                  <h1>${title}</h1>
                </header>
                <main>
                  <p>${difficulty}</p>
                  ${content}
                </main>
              </body>`
          );
        } catch (e) {
          console.error("Some error occurred during the file/directory creation", e);
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse the response/JSON', e);
    console.error(data.slice(0, 500))
  }
});

req.write(JSON.stringify({
  query: `{ activeDailyCodingChallengeQuestion { question { title titleSlug codeSnippets { lang langSlug code } difficulty content topicTags { name } exampleTestcases } } }`
}));

req.end();
