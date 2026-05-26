require("dotenv").config();
const axios = require("axios");
const { execSync } = require("child_process");

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_KEY = process.env.LINEAR_TEAM_KEY;
const MAX_TASKS = Number(process.env.MAX_TASKS || 5);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function run(cmd, cwd = "..") {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd, shell: "powershell.exe" });
}

function output(cmd, cwd = "..") {
  return execSync(cmd, { cwd, encoding: "utf8", shell: "powershell.exe" }).trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

async function linear(query) {
  const res = await axios.post(
    "https://api.linear.app/graphql",
    { query },
    { headers: { Authorization: LINEAR_API_KEY, "Content-Type": "application/json" } }
  );

  if (res.data.errors) throw new Error(JSON.stringify(res.data.errors, null, 2));
  return res.data.data;
}

async function getNextIssue() {
  const data = await linear(`
    query {
      issues(
        filter: {
          team: { key: { eq: "${TEAM_KEY}" } },
state: { type: { eq: "unstarted" } }        },
        first: 1
      ) {
        nodes { id identifier title description }
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
        nodes { id name }
      }
    }
  `);

  return data.workflowStates.nodes[0]?.id;
}

async function moveIssue(issueId, stateName) {
  const stateId = await getStateId(stateName);
  if (!stateId) throw new Error(`Could not find Linear state: ${stateName}`);

  await linear(`
    mutation {
      issueUpdate(id: "${issueId}", input: { stateId: "${stateId}" }) {
        success
      }
    }
  `);

  console.log(`Moved issue to ${stateName}`);
}

async function main() {
while (true) {    const issue = await getNextIssue();

    if (!issue) {
console.log("No Todo issues found. Waiting 30 seconds...");
await sleep(30000);
continue;
    }

    const branch = `itsme/${issue.identifier.toLowerCase()}-${slugify(issue.title)}`;

    console.log(`\nStarting ${issue.identifier}: ${issue.title}`);

    await moveIssue(issue.id, "In Progress");

    run("git checkout main");
    run("git pull");

    try {
      run(`git checkout ${branch}`);
    } catch {
      run(`git checkout -b ${branch}`);
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
- Verify the change if possible.
- When finished, stop. Do not wait for more instructions.
`;

    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\r?\n/g, " ");

    run(`codex exec "${escapedPrompt}"`);

    const status = output("git status --short");

    if (!status) {
      console.log("No file changes made. Moving issue back to Todo.");
      await moveIssue(issue.id, "Todo");
      continue;
    }

    run("git add .");
    run(`git commit -m "${issue.identifier} ${issue.title.replace(/"/g, "")}"`);
    run("git push --set-upstream origin HEAD");

    await moveIssue(issue.id, "Done");

    console.log(`Finished ${issue.identifier}`);
  }

  console.log(`Reached MAX_TASKS=${MAX_TASKS}.`);
}

(async function runner() {
  while (true) {
    try {
      await main();
    } catch (err) {
      console.error("AGENT ERROR:");
      console.error(err.message);
    }

    console.log("Restarting loop in 15 seconds...");
    await sleep(15000);
  }
})();