import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /git section. Every git command is fundamentally a state
// transition (working dir / staging / repo / remote / stash), so one
// data-driven StateDemo component covers all of them — `demo()` just wires a
// command + before/after box states into a Component with no props, the
// shape App.jsx expects.
const demo = (props) => () => createElement(StateDemo, props)

export const gitConcepts = [
  {
    id: 'git-init',
    section: 'git',
    title: 'git init',
    blurb: 'Turns a plain folder into a git repository by creating the .git/ directory.',
    tag: 'Setup',
    Component: demo({
      command: 'git init',
      before: [{ label: 'my-project/', sub: 'plain folder' }],
      after: [{ label: 'my-project/' }, { label: '.git/', sub: 'repository created', color: 'var(--good)' }],
      note: {
        before: 'Just a folder — git has never seen it.',
        after: 'A .git/ directory now tracks every future snapshot of this folder.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git init\ngit add .\ngit commit -m "initial commit"` }],
    realWorld:
      'The very first command run in any new project before the first commit — every other git command assumes a .git/ directory already exists.',
    pitfall:
      'Running it inside a folder that already has a parent repository creates a nested repo (a "repo inside a repo"), which silently breaks `git add .` in the outer repo.',
    fix:
      'Check `git status` (or look for an existing `.git/` up the tree) before initializing — if you actually wanted a subfolder tracked, use a submodule instead of an accidental nested repo.',
  },
  {
    id: 'git-clone',
    section: 'git',
    title: 'git clone',
    blurb: 'Copies a remote repository — full history and all — down to a new local directory.',
    tag: 'Setup',
    Component: demo({
      command: 'git clone <url>',
      before: [{ label: 'origin (remote)', color: 'var(--accent-2)' }],
      after: [
        { label: 'origin (remote)', color: 'var(--accent-2)', arrowLabel: 'clone' },
        { label: 'local copy', sub: 'full history + working files', color: 'var(--good)' },
      ],
      note: {
        before: 'A repository exists somewhere else — nothing local yet.',
        after: 'Every commit, branch, and tag is copied locally, with "origin" already wired up as the remote.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git clone https://github.com/user/repo.git\ncd repo` }],
    realWorld:
      'The standard first step to start contributing to any existing project — onboarding a new machine or a new teammate always starts here.',
    pitfall:
      'Cloning a huge repository with its entire history (large binary assets, years of commits) can be slow and disk-hungry when you only need recent history.',
    fix:
      'Use `git clone --depth 1` for a shallow clone when full history isn\'t needed, or `--filter=blob:none` for a partial clone on very large repos.',
  },
  {
    id: 'git-config',
    section: 'git',
    title: 'git config',
    blurb: 'Reads or sets configuration values — identity, aliases, editor — at the repo, global, or system level.',
    tag: 'Setup',
    Component: demo({
      command: 'git config user.name "Ada Lovelace"',
      before: [{ label: 'user.name', sub: '(unset)', dim: true }],
      after: [{ label: 'user.name', sub: '"Ada Lovelace"', color: 'var(--good)' }],
      note: {
        before: 'No identity configured — commits would be attributed to nobody.',
        after: 'Every commit from here on records this name and email as the author.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git config --global user.name "Ada Lovelace"\ngit config --global user.email "ada@example.com"` }],
    realWorld:
      'Set once per machine right after installing git (`--global`), and occasionally per-repo (no `--global`) when a project needs a different identity, like a work email.',
    pitfall:
      "Forgetting `--global` sets the value only for the current repo — commits made from a freshly cloned repo elsewhere fall back to whatever (or nobody) is configured globally.",
    fix:
      'Set identity globally once (`git config --global`), and only override per-repo when a specific project genuinely needs different values.',
  },
  {
    id: 'git-add',
    section: 'git',
    title: 'git add',
    blurb: 'Stages changes from the working directory so the next commit includes them.',
    tag: 'Snapshotting',
    Component: demo({
      command: 'git add file.js',
      before: [
        { label: 'Working Directory', sub: 'file.js modified', color: 'var(--accent)' },
        { label: 'Staging Area', dim: true },
      ],
      after: [
        { label: 'Working Directory', dim: true },
        { label: 'Staging Area', sub: 'file.js staged', color: 'var(--good)' },
      ],
      note: {
        before: 'file.js has uncommitted edits sitting in the working directory.',
        after: 'file.js is staged — it will be included in the next `git commit`.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git add file.js\ngit add .          # everything in the current directory\ngit add -p         # stage hunks interactively` }],
    realWorld:
      'The routine step before every commit — separating "what changed" from "what goes in this commit" is what lets you split a messy working directory into focused, reviewable commits.',
    pitfall:
      "`git add .` stages everything indiscriminately, including files you didn't mean to commit (stray debug logs, local config) if .gitignore hasn't caught them.",
    fix:
      'Review with `git status`/`git diff --staged` before committing, or stage selectively with `git add -p` when the working directory has unrelated changes mixed together.',
  },
  {
    id: 'git-status',
    section: 'git',
    title: 'git status',
    blurb: "Shows what's changed, staged, or untracked — the repo's current state at a glance.",
    tag: 'Snapshotting',
    Component: demo({
      command: 'git status',
      before: [{ label: 'Working Directory', sub: '(state unknown)', dim: true }],
      after: [
        { label: 'Working Dir', sub: 'modified: file.js', color: 'var(--accent)' },
        { label: 'Staging', sub: 'new file: x.js', color: 'var(--good)' },
      ],
      note: {
        before: "Nothing's been checked yet.",
        after: 'One modified-but-unstaged file, one new staged file — status never changes anything, it just reports.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git status\ngit status -s      # short format` }],
    realWorld:
      "The most-run git command by far — checked before almost every add/commit/push to confirm exactly what's about to happen.",
    pitfall:
      "Running it once and trusting stale results — if other tools or teammates change files on disk after you last checked, the picture you're acting on is out of date.",
    fix:
      "Re-run `git status` immediately before staging or committing, especially after switching branches or pulling — don't act on a status check from several steps ago.",
  },
  {
    id: 'git-diff',
    section: 'git',
    title: 'git diff',
    blurb: 'Shows exactly which lines changed, between the working directory, staging area, or two commits.',
    tag: 'Snapshotting',
    Component: demo({
      command: 'git diff',
      before: [{ label: 'file.js', sub: '(no diff shown yet)', dim: true }],
      after: [
        { label: '- console.log(x)', color: 'var(--bad)' },
        { label: '+ logger.debug(x)', color: 'var(--good)' },
      ],
      note: {
        before: 'file.js has unstaged edits, but nothing has been inspected yet.',
        after: 'Line-by-line: one line removed, one added — this is what `git add` would stage if run now.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git diff              # working dir vs staging\ngit diff --staged     # staging vs last commit\ngit diff main..feature` }],
    realWorld:
      'The pre-commit sanity check — catching an accidental leftover `console.log` or an unintended whitespace change before it ships is exactly what a quick `git diff` is for.',
    pitfall:
      "`git diff` alone only shows unstaged changes — after `git add`, the same edits vanish from plain `git diff` and only show up under `--staged`, which trips people up mid-review.",
    fix:
      'Use `git diff --staged` (or `--cached`) specifically to review what a commit is about to contain, and plain `git diff` for what\'s still unstaged.',
  },
  {
    id: 'git-commit',
    section: 'git',
    title: 'git commit',
    blurb: 'Records the staged snapshot as a new permanent point in the repository history.',
    tag: 'Snapshotting',
    Component: demo({
      command: 'git commit -m "add feature"',
      before: [
        { label: 'Staging Area', sub: 'file.js staged', color: 'var(--accent)' },
        { label: 'Repository', sub: 'C1', dim: true },
      ],
      after: [
        { label: 'Staging Area', dim: true },
        { label: 'Repository', sub: 'C1 → C2', color: 'var(--good)' },
      ],
      note: {
        before: 'Changes are staged but not yet part of history.',
        after: 'C2 is now a permanent snapshot — staging is empty again, ready for the next round of edits.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git commit -m "add feature"\ngit commit --amend   # rewrite the last commit` }],
    realWorld:
      "Every unit of project history — a good commit message plus a focused diff is what makes `git log` and `git blame` actually useful six months later.",
    pitfall:
      'Bundling unrelated changes into one giant commit ("fix bug, also refactor, also update deps") makes it impossible to revert or bisect just one of those changes later.',
    fix:
      'Keep commits small and focused on one logical change — use `git add -p` to split a messy working directory into several clean commits instead of one catch-all.',
  },
  {
    id: 'git-rm',
    section: 'git',
    title: 'git rm',
    blurb: 'Deletes a file from the working directory and stages that deletion in one step.',
    tag: 'Snapshotting',
    Component: demo({
      command: 'git rm old.js',
      before: [{ label: 'old.js', color: 'var(--accent)' }],
      after: [{ label: 'old.js', sub: 'deleted + staged', color: 'var(--bad)', dim: true }],
      note: {
        before: 'old.js exists, tracked by git.',
        after: 'The file is gone from disk and the deletion is staged — a normal commit records it.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git rm old.js\ngit rm --cached secrets.env   # untrack without deleting the file` }],
    realWorld:
      'Removing a file the "git-aware" way instead of a plain `rm`, so the deletion shows up staged and ready to commit rather than as an unstaged change git has to be told about separately.',
    pitfall:
      'Plain `git rm` deletes the file from disk too — running it on a file you meant to just untrack (like a secrets file someone accidentally committed) destroys the local copy along with the git record.',
    fix:
      'Use `git rm --cached <file>` to stop tracking a file while leaving it on disk — reserve plain `git rm` for files you actually want gone.',
  },
  {
    id: 'git-mv',
    section: 'git',
    title: 'git mv',
    blurb: 'Renames or moves a tracked file and stages the rename in one step.',
    tag: 'Snapshotting',
    Component: demo({
      command: 'git mv old.js new.js',
      before: [{ label: 'old.js', color: 'var(--accent)' }],
      after: [{ label: 'new.js', sub: 'renamed, staged', color: 'var(--good)' }],
      note: {
        before: 'old.js is tracked under its original name.',
        after: 'Staged as a rename — git\'s similarity detection will show it as "renamed" in history, not delete+add.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git mv old.js new.js\n# equivalent to:\nmv old.js new.js && git add old.js new.js` }],
    realWorld:
      'A convenience wrapper — plain `mv` followed by `git add` on both paths produces the identical staged result, git detects the rename either way by content similarity.',
    pitfall:
      "Renaming a file and heavily editing its contents in the same commit can defeat git's rename detection, so history shows a delete+add instead of a clean rename — `git log --follow` then loses the trail.",
    fix:
      'Commit the rename by itself first, then make content edits in a separate commit, if you want history and blame to cleanly follow the file across the rename.',
  },
  {
    id: 'git-branch',
    section: 'git',
    title: 'git branch',
    blurb: 'Creates, lists, or deletes branches — lightweight movable pointers to a commit.',
    tag: 'Branching',
    Component: demo({
      command: 'git branch feature',
      before: [{ label: 'main', sub: 'C1 → C2', color: 'var(--accent)' }],
      after: [
        { label: 'main', sub: 'C1 → C2', color: 'var(--accent)' },
        { label: 'feature', sub: '→ C2 (new pointer)', color: 'var(--good)' },
      ],
      note: {
        before: 'Only main exists, pointing at C2.',
        after: 'feature also points at C2 — creating a branch is just adding a pointer, no files are copied.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git branch feature       # create\ngit branch -d feature    # delete (safe)\ngit branch -a            # list all, including remotes` }],
    realWorld:
      'The mechanism behind every feature-branch workflow — a branch is so cheap (just a 41-byte pointer file) that creating one for every small piece of work is standard practice.',
    pitfall:
      '`git branch` alone only creates the pointer — it does not switch to it, which trips people up expecting `git branch feature` to behave like `git checkout -b feature`.',
    fix:
      'Use `git switch -c feature` (or `git checkout -b feature`) when you want to create and move onto the branch in one step.',
  },
  {
    id: 'git-checkout',
    section: 'git',
    title: 'git checkout / switch',
    blurb: 'Moves HEAD to a different branch or commit, updating the working directory to match.',
    tag: 'Branching',
    Component: demo({
      command: 'git switch feature',
      before: [
        { label: 'HEAD → main', color: 'var(--accent)' },
        { label: 'feature', dim: true },
      ],
      after: [
        { label: 'main', dim: true },
        { label: 'HEAD → feature', color: 'var(--good)' },
      ],
      note: {
        before: 'Working directory reflects whatever main last committed.',
        after: 'Working directory is rewritten to match feature\'s latest commit — HEAD now follows feature.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git switch feature          # modern, branch-only\ngit checkout feature        # older, does branches + files\ngit checkout -- file.js     # discard unstaged changes to one file` }],
    realWorld:
      "Switching context between branches dozens of times a day — feature work, a quick hotfix, back to feature — is the normal rhythm of any git-based workflow.",
    pitfall:
      '`git checkout` is overloaded — the same command switches branches, restores files, and detaches HEAD depending on its arguments, which makes typos (like a mistyped filename matching a branch name) dangerous.',
    fix:
      "Use `git switch` for branches and `git restore` for files (both newer, narrower commands) instead of overloaded `git checkout`, so a typo can't silently do the wrong kind of operation.",
  },
  {
    id: 'git-merge',
    section: 'git',
    title: 'git merge',
    blurb: 'Combines another branch into the current one, creating a merge commit that joins both histories.',
    tag: 'Branching',
    Component: demo({
      command: 'git merge feature',
      before: [
        { label: 'main', sub: 'C1 → C2' },
        { label: 'feature', sub: 'C1 → C3', color: 'var(--accent-2)' },
      ],
      after: [{ label: 'main', sub: 'C1 → C2 → C4 (merge of C2 + C3)', color: 'var(--good)' }],
      note: {
        before: 'main and feature diverged from a common ancestor, C1.',
        after: 'A new merge commit, C4, has both C2 and C3 as parents — both histories are preserved exactly as they happened.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git switch main\ngit merge feature` }],
    realWorld:
      "The default way pull requests land — merging a feature branch into main keeps the full, honest history of when work actually happened, branch structure and all.",
    pitfall:
      'A long-lived feature branch merged late accumulates a large, hard-to-review merge commit, and conflicting changes on both sides have to be resolved all at once.',
    fix:
      'Merge (or rebase onto) main frequently while the feature branch is still small, instead of letting it drift for weeks before the one big merge.',
  },
  {
    id: 'git-rebase',
    section: 'git',
    title: 'git rebase',
    blurb: "Replays a branch's commits on top of another branch, producing a linear history instead of a merge commit.",
    tag: 'Branching',
    Component: demo({
      command: 'git rebase main',
      before: [
        { label: 'main', sub: 'C1 → C2' },
        { label: 'feature', sub: 'C1 → C3', color: 'var(--accent-2)' },
      ],
      after: [
        { label: 'main', sub: 'C1 → C2' },
        { label: 'feature', sub: "C1 → C2 → C3'", color: 'var(--good)' },
      ],
      note: {
        before: 'feature branched off before C2 existed on main.',
        after: "C3 is replayed as a new commit C3' sitting on top of C2 — the history reads as if feature started from C2, no merge commit.",
      },
    }),
    code: [{ lang: 'bash', snippet: `git switch feature\ngit rebase main` }],
    realWorld:
      'Cleaning up a feature branch before opening a pull request — a linear, rebased history is easier to review commit-by-commit than one tangled with merge commits.',
    pitfall:
      "Rebasing rewrites commit hashes — doing it on a branch someone else has already pulled and built on top of forces them into a painful history reconciliation.",
    fix:
      'Only rebase commits that are still local/unpushed, or that you\'re certain nobody else has based work on — once a branch is shared, merge instead of rebasing it.',
  },
  {
    id: 'git-cherry-pick',
    section: 'git',
    title: 'git cherry-pick',
    blurb: 'Applies one specific commit from another branch onto the current branch.',
    tag: 'Branching',
    Component: demo({
      command: 'git cherry-pick Cx',
      before: [
        { label: 'feature', sub: '…→ Cx (bugfix)', color: 'var(--accent-2)' },
        { label: 'main', sub: 'C1 → C2' },
      ],
      after: [{ label: 'main', sub: "C1 → C2 → Cx' (bugfix copied)", color: 'var(--good)' }],
      note: {
        before: 'A bugfix commit, Cx, exists only on feature.',
        after: "A new commit Cx' on main has the same changes as Cx — just that one commit was copied over, not the rest of feature.",
      },
    }),
    code: [{ lang: 'bash', snippet: `git switch main\ngit cherry-pick Cx` }],
    realWorld:
      'Backporting a single hotfix from a development branch onto a release branch — you want exactly that one fix, not the entire feature branch it lives on.',
    pitfall:
      "Cherry-picking creates a brand-new commit with a new hash — later merging the original branch can reintroduce the same change and cause a confusing duplicate-looking diff or conflict.",
    fix:
      "Note which commits were cherry-picked (many teams add a `(cherry picked from commit ...)` trailer, which `git cherry-pick -x` adds automatically) so a later merge's overlap is easy to recognize and resolve.",
  },
  {
    id: 'git-tag',
    section: 'git',
    title: 'git tag',
    blurb: 'Marks a specific commit with a permanent, human-readable name — typically a release version.',
    tag: 'Branching',
    Component: demo({
      command: 'git tag v1.0.0',
      before: [{ label: 'main', sub: 'C1 → C2' }],
      after: [
        { label: 'main', sub: 'C1 → C2' },
        { label: 'v1.0.0', sub: '→ C2 (permanent)', color: 'var(--good)' },
      ],
      note: {
        before: 'C2 is only reachable by remembering its hash or that main pointed at it.',
        after: "v1.0.0 always points at C2 — unlike a branch, tags don't move as new commits land.",
      },
    }),
    code: [{ lang: 'bash', snippet: `git tag v1.0.0            # lightweight\ngit tag -a v1.0.0 -m "1.0 release"   # annotated, with metadata\ngit push origin v1.0.0` }],
    realWorld:
      'Marking release points (v1.0.0, v2.1.3) so a specific shipped commit can always be found and checked out again, independent of where main has since moved.',
    pitfall:
      'Tags are local until explicitly pushed — a teammate cloning the repo won\'t see a tag you created but never pushed, which surfaces confusingly as "that release doesn\'t exist" downstream.',
    fix:
      'Push tags explicitly with `git push origin <tag>` (or `--tags` for all of them) right after creating one meant to be shared.',
  },
  {
    id: 'git-fetch',
    section: 'git',
    title: 'git fetch',
    blurb: "Downloads a remote's new commits and branches without touching the current working directory.",
    tag: 'Sharing',
    Component: demo({
      command: 'git fetch origin',
      before: [
        { label: 'origin/main (local)', sub: 'C1 → C2', dim: true },
        { label: 'origin (remote)', sub: 'C1 → C2 → C3', color: 'var(--accent-2)' },
      ],
      after: [
        { label: 'origin/main', sub: 'C1 → C2 → C3', color: 'var(--good)' },
        { label: 'main (local)', sub: 'still C1 → C2', dim: true },
      ],
      note: {
        before: "The local origin/main bookmark hasn't heard about the remote's new commit yet.",
        after: 'origin/main is updated to match the remote — but local main is untouched, so nothing in the working directory changed.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git fetch origin\ngit log main..origin/main   # see what's new before merging` }],
    realWorld:
      "The safe way to check what's changed upstream before deciding what to do about it — CI systems and IDE background syncs run `git fetch` constantly without ever touching your working files.",
    pitfall:
      "Confusing fetch with pull — after `git fetch`, local main still looks unchanged, which surprises people expecting the working directory to already reflect the remote's new commits.",
    fix:
      'Fetch to inspect first (`git log main..origin/main`), then explicitly `git merge origin/main` (or `git pull`, which does both steps at once) once you\'ve confirmed what\'s incoming.',
  },
  {
    id: 'git-pull',
    section: 'git',
    title: 'git pull',
    blurb: 'Fetches from the remote and immediately merges (or rebases) it into the current branch, in one step.',
    tag: 'Sharing',
    Component: demo({
      command: 'git pull origin main',
      before: [
        { label: 'main (local)', sub: 'C1 → C2' },
        { label: 'origin (remote)', sub: 'C1 → C2 → C3', color: 'var(--accent-2)' },
      ],
      after: [{ label: 'main (local)', sub: 'C1 → C2 → C3', color: 'var(--good)' }],
      note: {
        before: 'The remote has a commit, C3, that local main lacks.',
        after: 'fetch + merge happened in one command — local main and the working directory now include C3.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git pull origin main\ngit pull --rebase   # replay local commits on top instead of merging` }],
    realWorld:
      "The default way to sync a local branch with its remote before starting new work — usually the very first command run at the start of a session.",
    pitfall:
      'Pulling with uncommitted local changes can trigger a merge conflict mid-pull that\'s harder to reason about than a clean merge, since it\'s tangled with your working directory state too.',
    fix:
      'Commit or stash local changes before pulling — `git status` clean, then `git pull` — so any conflict that shows up is purely about diverged history, not mixed with in-progress edits.',
  },
  {
    id: 'git-push',
    section: 'git',
    title: 'git push',
    blurb: 'Uploads local commits to a remote branch, making your history visible to everyone else.',
    tag: 'Sharing',
    Component: demo({
      command: 'git push origin main',
      before: [
        { label: 'main (local)', sub: 'C1 → C2 → C3' },
        { label: 'origin (remote)', sub: 'C1 → C2', dim: true },
      ],
      after: [
        { label: 'main (local)', sub: 'C1 → C2 → C3' },
        { label: 'origin (remote)', sub: 'C1 → C2 → C3', color: 'var(--good)' },
      ],
      note: {
        before: 'C3 exists only locally — nobody else can see it yet.',
        after: "The remote now has C3 too — anyone who fetches or pulls origin/main will get it.",
      },
    }),
    code: [{ lang: 'bash', snippet: `git push origin main\ngit push --force-with-lease   # push after a rebase, safely` }],
    realWorld:
      'The step that actually shares your work — opening a pull request, triggering CI, or just making a commit visible to teammates all require a push first.',
    pitfall:
      '`git push --force` overwrites the remote branch unconditionally — if a teammate pushed in between, their commits are silently discarded with no recovery path via normal git commands.',
    fix:
      'Use `git push --force-with-lease` instead of plain `--force` — it fails safely if the remote has commits you haven\'t seen yet, rather than clobbering them.',
  },
  {
    id: 'git-remote',
    section: 'git',
    title: 'git remote',
    blurb: 'Manages the named shortcuts (like "origin") that point at remote repository URLs.',
    tag: 'Sharing',
    Component: demo({
      command: 'git remote add origin <url>',
      before: [{ label: '(no remotes)', dim: true }],
      after: [{ label: 'origin', sub: '→ github.com/you/repo.git', color: 'var(--good)' }],
      note: {
        before: 'No remote configured — fetch, pull, and push have nothing to talk to.',
        after: '"origin" is now shorthand for the full URL — every other sharing command can reference it by name.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git remote add origin git@github.com:you/repo.git\ngit remote -v            # list remotes with URLs\ngit remote set-url origin <new-url>` }],
    realWorld:
      '"origin" is the near-universal name for a repo\'s primary remote, and "upstream" the common second one when working from a fork — both are just labels this command manages.',
    pitfall:
      "Forgetting a remote was renamed or the URL changed (e.g. an org rename on GitHub) leaves push/pull silently failing with an auth or 404 error that doesn't obviously point at `git remote` as the fix.",
    fix:
      'Check `git remote -v` first when push/pull/fetch fails unexpectedly — update the URL with `git remote set-url` rather than re-cloning the whole repository.',
  },
  {
    id: 'git-log',
    section: 'git',
    title: 'git log',
    blurb: 'Lists commit history — messages, authors, dates, and hashes — in the order they were made.',
    tag: 'Inspection',
    Component: demo({
      command: 'git log --oneline',
      before: [{ label: '?', dim: true }],
      after: [
        { label: 'C3 (HEAD)', sub: 'fix login bug', color: 'var(--good)' },
        { label: 'C2', sub: 'add validation' },
        { label: 'C1', sub: 'initial commit' },
      ],
      note: {
        before: 'History exists but hasn\'t been inspected yet.',
        after: 'Newest first: three commits, each a full snapshot with its own message and author.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git log --oneline\ngit log --graph --all --decorate\ngit log -- path/to/file.js   # history of one file` }],
    realWorld:
      "The go-to command for answering \"what happened here and why\" — reading commit messages back through history is often faster than asking whoever wrote the code.",
    pitfall:
      'Vague commit messages ("fix", "wip", "updates") make `git log` nearly useless months later — the tool only surfaces information that was actually recorded at commit time.',
    fix:
      'Write commit messages that explain the *why*, not just the *what* — the diff already shows what changed, the message is the only place the reasoning survives.',
  },
  {
    id: 'git-show',
    section: 'git',
    title: 'git show',
    blurb: 'Displays the full details of a single commit — metadata plus its diff.',
    tag: 'Inspection',
    Component: demo({
      command: 'git show C2',
      before: [{ label: 'C2', sub: '(hash only)', dim: true }],
      after: [{ label: 'C2', sub: 'author, date, message, +/- diff', color: 'var(--good)' }],
      note: {
        before: 'All that\'s known is which commit to look at.',
        after: 'Full detail: who made it, when, why (the message), and exactly what changed.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git show C2\ngit show HEAD~2\ngit show C2:path/to/file.js   # a file's content as of that commit` }],
    realWorld:
      "Following up from `git log` or `git blame` — once you've spotted the commit hash you care about, `git show` is how you actually read what it did.",
    pitfall:
      "On a merge commit, plain `git show` only displays the combined diff against the first parent, which can hide what the merged-in branch actually contributed.",
    fix:
      'Use `git show <merge-commit> -m` (or specify `-p --first-parent`/`--cc` explicitly) when you need to see a merge commit\'s diff against each parent separately.',
  },
  {
    id: 'git-blame',
    section: 'git',
    title: 'git blame',
    blurb: 'Annotates every line of a file with the commit and author that last changed it.',
    tag: 'Inspection',
    Component: demo({
      command: 'git blame file.js',
      before: [{ label: 'file.js', sub: '(no annotations)', dim: true }],
      after: [
        { label: 'line 1: const x = 1', sub: 'Ada — C1' },
        { label: 'line 2: return x * 2', sub: 'Grace — C3', color: 'var(--good)' },
      ],
      note: {
        before: 'The file exists, but not who wrote each line.',
        after: "Every line traced to the commit that last touched it — line 2's author is worth asking about that logic.",
      },
    }),
    code: [{ lang: 'bash', snippet: `git blame file.js\ngit blame -L 10,20 file.js   # only a line range` }],
    realWorld:
      'The first move when debugging a confusing line of code — finding who wrote it (and the commit message explaining why) beats guessing at intent.',
    pitfall:
      'A file that went through an automated reformat (Prettier, gofmt) shows that reformat commit as the "author" of every line, burying the actual meaningful history underneath.',
    fix:
      'Use `git blame -w` to ignore whitespace changes, or maintain a `.git-blame-ignore-revs` file listing mass-reformat commits so blame walks past them to the real author.',
  },
  {
    id: 'git-stash',
    section: 'git',
    title: 'git stash',
    blurb: 'Temporarily shelves uncommitted changes so the working directory is clean, without committing them.',
    tag: 'Undoing',
    Component: demo({
      command: 'git stash',
      before: [{ label: 'Working Directory', sub: 'uncommitted edits', color: 'var(--accent)' }],
      after: [
        { label: 'Working Directory', sub: 'clean', dim: true },
        { label: 'Stash', sub: 'stash@{0}', color: 'var(--good)' },
      ],
      note: {
        before: "In-progress edits that aren't ready to commit, but are in the way.",
        after: 'The edits are shelved on a stack — the working directory matches the last commit again, safe to switch branches.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git stash\ngit stash pop     # restore the most recent stash and drop it\ngit stash list    # see everything shelved` }],
    realWorld:
      "Needing to switch to a different branch (urgent hotfix) while mid-way through unrelated, uncommitted work — stash clears the working directory without losing anything.",
    pitfall:
      'Stashes are easy to forget about entirely — `git stash` with no message and no `pop` just accumulates on the stack until "what was in stash@{4}?" becomes a genuine mystery.',
    fix:
      'Name stashes with `git stash push -m "description"` and check `git stash list` periodically — treat an old stash as a signal to either finish that work or drop it.',
  },
  {
    id: 'git-reset',
    section: 'git',
    title: 'git reset',
    blurb: 'Moves the current branch pointer (and optionally staging/working directory) to a different commit.',
    tag: 'Undoing',
    Component: demo({
      command: 'git reset --hard HEAD~1',
      before: [{ label: 'main', sub: 'C1 → C2 → C3 (HEAD)', color: 'var(--accent)' }],
      after: [
        { label: 'main', sub: 'C1 → C2 (HEAD)', color: 'var(--bad)' },
        { label: 'C3', sub: 'unreachable', dim: true },
      ],
      note: {
        before: 'main points at C3, the most recent commit.',
        after: '`--hard` moved main back to C2 and overwrote the working directory to match — C3 still exists briefly but nothing points at it.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git reset --soft HEAD~1   # move pointer only, keep staged + working changes\ngit reset HEAD~1          # mixed (default): unstage, keep working changes\ngit reset --hard HEAD~1   # move pointer, discard everything` }],
    realWorld:
      'Undoing a local commit before anyone else has seen it — `--soft` to redo the commit message, `--mixed` to restage differently, `--hard` to throw the whole thing away.',
    pitfall:
      "`--hard` discards uncommitted working-directory changes with zero confirmation and no undo through normal commands — it's the single most common source of \"I lost my work\" panic.",
    fix:
      "Double-check `git status` and `git diff` before `--hard`, and remember the commit itself isn't gone immediately — `git reflog` can usually recover it if you catch the mistake soon after.",
  },
  {
    id: 'git-revert',
    section: 'git',
    title: 'git revert',
    blurb: 'Creates a new commit that undoes the changes from an earlier commit, without rewriting history.',
    tag: 'Undoing',
    Component: demo({
      command: 'git revert C2',
      before: [{ label: 'main', sub: 'C1 → C2 (buggy)', color: 'var(--accent)' }],
      after: [{ label: 'main', sub: 'C1 → C2 → C3 (undoes C2)', color: 'var(--good)' }],
      note: {
        before: 'C2 introduced a bug and is already part of shared history.',
        after: "C3 is a new commit that applies the inverse of C2's diff — the bug is fixed, but C2 stays visible in history for context.",
      },
    }),
    code: [{ lang: 'bash', snippet: `git revert C2\ngit revert --no-commit C2   # stage the revert without committing yet` }],
    realWorld:
      'Undoing a commit that\'s already been pushed and pulled by others — since it adds a new commit instead of erasing one, nobody\'s history gets rewritten out from under them.',
    pitfall:
      "Reverting a merge commit needs an explicit `-m <parent-number>` telling git which parent to treat as \"mainline\" — running plain `git revert` on one fails with a confusing error.",
    fix:
      'Use `git revert -m 1 <merge-commit>` (mainline usually parent 1) when reverting a merge, and double check which parent that actually points at for the specific merge.',
  },
  {
    id: 'git-reflog',
    section: 'git',
    title: 'git reflog',
    blurb: "A local log of every place HEAD has pointed — the safety net for recovering from a bad reset or rebase.",
    tag: 'Undoing',
    Component: demo({
      command: 'git reflog',
      before: [{ label: '?', dim: true }],
      after: [
        { label: 'HEAD@{0}', sub: 'reset: moving to HEAD~1', color: 'var(--good)' },
        { label: 'HEAD@{1}', sub: 'commit: add feature' },
        { label: 'HEAD@{2}', sub: 'checkout: main → feature' },
      ],
      note: {
        before: "HEAD's movement history hasn't been looked at.",
        after: "Every checkout, commit, reset, and rebase HEAD has been through — including commits a `--hard reset` just made unreachable.",
      },
    }),
    code: [{ lang: 'bash', snippet: `git reflog\ngit reset --hard HEAD@{2}   # jump back to an earlier HEAD position` }],
    realWorld:
      'The recovery tool after a `git reset --hard` or botched rebase throws away commits you actually needed — reflog remembers where HEAD has been even after that.',
    pitfall:
      "Reflog is purely local and time-limited (entries expire, default 90 days for reachable, 30 for unreachable) — it's not a substitute for pushing important work to a remote.",
    fix:
      "Treat reflog as an emergency undo window, not permanent backup — push commits you care about to a remote so recovery doesn't depend on local reflog retention.",
  },
  {
    id: 'git-clean',
    section: 'git',
    title: 'git clean',
    blurb: 'Deletes untracked files from the working directory — the ones git has never seen, not just uncommitted edits.',
    tag: 'Undoing',
    Component: demo({
      command: 'git clean -fd',
      before: [{ label: 'Working Directory', sub: '+ debug.log (untracked)', color: 'var(--accent)' }],
      after: [{ label: 'Working Directory', sub: 'untracked files removed', color: 'var(--good)' }],
      note: {
        before: 'debug.log was never `git add`-ed — it\'s invisible to reset/checkout, which only touch tracked files.',
        after: '`-f` (force) and `-d` (directories too) removed it — gone from disk, not recoverable through git.',
      },
    }),
    code: [{ lang: 'bash', snippet: `git clean -n     # dry run — see what would be deleted\ngit clean -fd    # actually delete untracked files and directories` }],
    realWorld:
      'Wiping out build artifacts, stray scratch files, or debug output that accumulated during a session and were never meant to be tracked in the first place.',
    pitfall:
      'Deleted files are genuinely gone — unlike tracked-file operations, git clean has no reflog or recovery path, since the files were never part of any commit to fall back to.',
    fix:
      'Always run `git clean -n` (dry run) first to see exactly what would be removed before adding `-f` to actually delete it.',
  },
]
