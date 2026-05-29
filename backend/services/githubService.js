const axios = require('axios');

async function getRepoZip(owner, repo, branch = 'main') {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: headers,
      timeout: 30000
    });
    return Buffer.from(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) throw new Error("Repository not found or private.");
    throw new Error(`GitHub fetch failed: ${error.message}`);
  }
}

module.exports = { getRepoZip };
