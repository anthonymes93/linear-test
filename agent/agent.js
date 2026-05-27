require("dotenv").config();
const axios = require("axios");
const { execSync } = require("child_process");

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_KEY = process.env.LINEAR_TEAM_KEY;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(cmd, cwd = "..") {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd, shell: "powershell.exe" });
}

function output(cmd, cwd = "..") {
  return execSync(cmd, {
    cwd,
    encoding: "utf8",
    shell: "powershell.exe",
  }).trim();
}

async function linear(query) {
  const res = await axios.post(
    "https://api.linear.app/graphql",
    { query },
    {
      headers: {
        Authorization: LINEAR_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  if (res.data.errors) {
    throw new Error(JSON.stringify(res.data.errors, null, 2));
  }

  return res.data.data;
}

async function getNextIssue() {
  const data = await linear(`
    query {
      issues(
        filter: {
          team: { key: { eq: "${TEAM_KEY}" } },
          state: { type: { eq: "unstarted" } }
        },
        first: 1
      ) {
        nodes {
          id
          identifier
          title
          description
        }
      }
    }
  `);

  return data.issues.nodes[0];
}

async function getStateId(name) {
  const data = await linear(`
    query {
      workflowStates(
        filter: {
          team: { key: { eq: "${TEAM_KEY}" } },
          name: { eq: "${name}" }
        }
      ) {
        nodes {
          id
          name
        }
      }
    }
  `);

  return data.workflowStates.nodes[0]?.id;
}

async function moveIssue(issueId, stateName) {
  const stateId = await getStateId(stateName);

  if (!stateId) {
    throw new Error(`Could not find Linear state: ${stateName}`);
  }

  await linear(`
    mutation {
      issueUpdate(id: "${issueId}", input: { stateId: "${stateId}" }) {
        success
      }
    }
  `);

  console.log(`Moved issue to ${stateName}`);
}

async function processOneIssue() {
  const issue = await getNextIssue();

  if (!issue) {
    console.log("No unstarted issues found. Waiting 30 seconds...");
    await sleep(30000);
    return;
  }

  console.log(`\nStarting ${issue.identifier}: ${issue.title}`);

  await moveIssue(issue.id, "In Progress");

  run("git checkout main");
  run("git pull");

  const dirtyBefore = output("git status --short");

  if (dirtyBefore) {
    console.log("Dirty working tree detected before Codex:");
    console.log(dirtyBefore);
    console.log("Moving issue back to Todo and waiting.");
    await moveIssue(issue.id, "Todo");
    await sleep(30000);
    return;
  }

  const prompt = `
Complete Linear issue ${issue.identifier}.

Title:
${issue.title}

Description:
${issue.description || "No description provided."}

Rules:
- Work only on this issue.
- Do not invent extra features.
- Keep changes small and focused.
- Modify the root app files, not the agent folder, unless the issue specifically asks for agent changes.
- Verify the change if possible.
- When finished, stop. Do not wait for more instructions.
`;

  const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\r?\n/g, " ");

  run(`codex exec "${escapedPrompt}"`);

  const status = output("git status --short");

  if (!status) {
    console.log("No file changes made. Moving issue back to Todo.");
    await moveIssue(issue.id, "Todo");
    await sleep(30000);
    return;
  }

  run("git add .");
  run(`git commit -m "${issue.identifier} ${issue.title.replace(/"/g, "")}"`);
  run("git push");

  await moveIssue(issue.id, "Done");

  console.log(`Finished ${issue.identifier}`);
}

(async function runner() {
  while (true) {
    try {
      await processOneIssue();
    } catch (err) {
      console.error("AGENT ERROR:");
      console.error(err.message);
      console.log("Waiting 30 seconds before retry...");
      await sleep(30000);
    }
  }
})();