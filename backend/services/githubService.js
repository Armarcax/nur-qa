const axios = require('axios');

/**
 * Fetches repository content as a ZIP buffer from GitHub
 */
async function getRepoZip(owner, repo, branch = 'main') {
  try {
    console.log(`Fetching ZIP for ${owner}/${repo} from branch ${branch}...`);
    
    // GitHub API endpoint to download ZIP
    const url = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };

    // If token exists, add it for higher rate limits
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer', // Important for binary data
      headers: headers,
      timeout: 30000 // 30 seconds timeout
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error("GitHub API Error:", error.message);
    if (error.response && error.response.status === 404) {
      throw new Error("Repository not found or is private.");
    }
    throw new Error(`Failed to fetch repository: ${error.message}`);
  }
}

module.exports = {
  getRepoZip
};