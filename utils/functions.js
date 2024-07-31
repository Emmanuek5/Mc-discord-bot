function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to find the command with the closest name
function findClosestCommand(typedCommand) {
  let minDistance = Infinity;
  let closestCommand = null;
  for (const cmd of commands) {
    let distance = levenshteinDistance(typedCommand, cmd.name);
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        let aliasDistance = levenshteinDistance(typedCommand, alias);
        if (aliasDistance < distance) {
          distance = aliasDistance;
        }
      }
    }
    if (distance < minDistance) {
      minDistance = distance;
      closestCommand = cmd;
    }
  }
  return closestCommand;
}

// Function to calculate Levenshtein distance
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  let dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

module.exports = { sleep, findClosestCommand };
