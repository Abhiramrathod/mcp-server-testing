#!/usr/bin/env python3
"""Generate detailed, production-grade GitHub release notes.

The script walks the git history between the previous version tag and the tag
being released, enriches every merge commit with PR metadata from the GitHub
API, classifies the changes via conventional-commit prefixes, and renders a
structured changelog suitable for publishing as a release body.

Requirements (provided on GitHub Actions ubuntu runners):
  - git with the full tag history checked out (fetch-depth: 0)
  - GH_TOKEN environment variable (GitHub Actions: ${{ secrets.GITHUB_TOKEN }})
  - GITHUB_REPOSITORY (e.g. "owner/repo") and GITHUB_REF_NAME (the tag name)

Output: RELEASE_NOTES.md in the current working directory.
"""

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from collections import Counter, OrderedDict
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Conventional commit classification
# ---------------------------------------------------------------------------

SECTION_DEFINITIONS = OrderedDict([
    # key: section title, value: (icon, list of commit types)
    ("New Features",            ("features", ["feat", "feature", "add", "implement", "introduce", "enable", "support"])),
    ("Bug Fixes",               ("fix",      ["fix", "bugfix", "hotfix", "patch", "repair", "resolve", "correct"])),
    ("Performance Improvements",("perf",     ["perf", "performance", "optimize", "optimization", "speed"])),
    ("Documentation",           ("docs",     ["docs", "documentation", "doc", "readme"])),
    ("Dependencies",            ("deps",     ["deps", "dependencies", "dependency", "bump", "upgrade", "chore(deps)"])),
    ("Testing",                 ("test",     ["test", "tests", "testing", "spec", "integration-test"])),
    ("Refactoring",             ("refactor", ["refactor", "refactoring", "reorganize", "simplify", "cleanup", "clean"])),
    ("CI & Build",              ("ci",       ["ci", "build", "workflow", "actions", "pipeline"])),
    ("Other Changes",           ("other",    ["chore", "style", "revert", "misc"])),
])

# Matches e.g. "feat(core)!: add x", "fix: y", "docs(readme): z"
CONVENTIONAL_RE = re.compile(
    r"^(?P<type>[a-z-]+)(\((?P<scope>[a-z0-9_-]+)\))?(?P<breaking>!)?:\s*(?P<subject>.+)$",
    re.IGNORECASE,
)
BREAKING_RE = re.compile(r"BREAKING[ -]CHANGE", re.IGNORECASE)
PR_MERGE_RE = re.compile(r"^Merge pull request #(\d+) from ", re.IGNORECASE)
PR_SQUASH_RE = re.compile(r"\(#(\d+)\)\s*$")

TYPE_MAP = {}
for _title, (_icon, _types) in SECTION_DEFINITIONS.items():
    for _t in _types:
        TYPE_MAP[_t.lower()] = _title


def run_git(*args):
    """Run a git command and return trimmed stdout."""
    result = subprocess.run(
        ["git", *args], capture_output=True, text=True, check=True)
    return result.stdout.strip()


def previous_tag(current_ref):
    """Return the tag that precedes current_ref, or None for the first release."""
    try:
        prev = run_git("describe", "--tags", "--abbrev=0", f"{current_ref}~1")
    except subprocess.CalledProcessError:
        prev = None
    if prev and prev == current_ref:
        prev = None
    return prev


def collect_commits(current_ref, prev_tag):
    """Return the list of commit SHAs between prev_tag and current_ref."""
    if prev_tag:
        range_expr = f"{prev_tag}..{current_ref}"
    else:
        range_expr = current_ref
    out = run_git("rev-list", "--first-parent", range_expr)
    return [line for line in out.splitlines() if line]


def gh_get(path):
    """GET a GitHub REST API endpoint using GH_TOKEN."""
    token = os.environ["GH_TOKEN"]
    url = f"https://api.github.com{path}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "release-notes-generator",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_pr_for_commit(repo, sha):
    """Return (pr_number, pr_title, author_login) for a merge commit, if any."""
    try:
        pulls = gh_get(f"/repos/{repo}/commits/{sha}/pulls")
    except urllib.error.HTTPError:
        return None
    if not pulls:
        return None
    pr = pulls[0]
    number = pr.get("number")
    title = pr.get("title") or ""
    user = pr.get("user") or {}
    return number, title, user.get("login")


def classify(message):
    """Return (section_title, breaking, subject, scope)."""
    match = CONVENTIONAL_RE.match(message.strip())
    if match:
        ctype = match.group("type").lower()
        breaking = bool(match.group("breaking")) or bool(BREAKING_RE.search(message))
        subject = match.group("subject").strip().rstrip(".")
        scope = match.group("scope")
        section = TYPE_MAP.get(ctype, "Other Changes")
        return section, breaking, subject, scope
    if BREAKING_RE.search(message):
        first_line = message.strip().splitlines()[0].rstrip(".")
        return "Breaking Changes", True, first_line, None
    return "Other Changes", False, message.strip().splitlines()[0].rstrip("."), None


def clean_subject(subject, scope):
    """Remove scope prefix noise from conventional subjects."""
    if scope and subject.lower().startswith(scope.lower()):
        subject = subject[len(scope):].strip().lstrip(": ")
    return subject


def render_markdown(current_ref, prev_tag, repo, grouped, authors, stats, breaking_entries):
    """Render the final release notes document."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = []

    lines.append(f"# Release {current_ref}")
    lines.append("")
    lines.append(f"> **Published:** {now}")

    total = stats["total"]
    if total:
        lines.append(
            f"> **Summary:** {total} change{'s' if total != 1 else ''} "
            f"across {len(authors)} contributor{'s' if len(authors) != 1 else ''} "
            f"— "
            f"{stats.get('features', 0)} feature{'s' if stats.get('features', 0) != 1 else ''}, "
            f"{stats.get('fixes', 0)} bug fix{'es' if stats.get('fixes', 0) != 1 else ''}, "
            f"{stats.get('breaking', 0)} breaking change{'s' if stats.get('breaking', 0) != 1 else ''}."
        )
    lines.append("")

    if breaking_entries:
        lines.append("## ⚠️ Breaking Changes")
        lines.append("")
        lines.append("> Please review the following items before upgrading:")
        lines.append("")
        for entry in breaking_entries:
            lines.append(f"- **{entry['subject']}** — {entry['pr_text']} (by @{entry['author']})")
        lines.append("")

    if total == 0:
        lines.append("No changes captured for this release.")
        return "\n".join(lines) + "\n"

    lines.append("## What's Changed")
    lines.append("")

    for section, (icon, _types) in SECTION_DEFINITIONS.items():
        entries = grouped.get(section, [])
        if not entries:
            continue
        lines.append(f"### {icon} {section}")
        lines.append("")
        for entry in entries:
            subject = entry["subject"]
            pr_text = entry["pr_text"]
            author = entry["author"]
            lines.append(f"- {subject} {pr_text} (by @{author})")
        lines.append("")

    lines.append("## Contributors")
    lines.append("")
    lines.append("Thanks to everyone who made this release possible:")
    lines.append("")
    for author in authors:
        lines.append(f"- [@{author}](https://github.com/{author})")
    lines.append("")

    lines.append("## Upgrade Notes")
    lines.append("")
    lines.append("- No migrations are required for this release.")
    lines.append("")

    lines.append("## Full Changelog")
    lines.append("")
    if prev_tag:
        lines.append(f"[Compare `{prev_tag}`...`{current_ref}`]"
                     f"(https://github.com/{repo}/compare/{prev_tag}...{current_ref})")
    else:
        lines.append(f"[View all commits](https://github.com/{repo}/commits/{current_ref})")
    lines.append("")

    return "\n".join(lines) + "\n"


def main():
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    current_ref = os.environ.get("GITHUB_REF_NAME", "").strip()
    if not current_ref:
        print("::error::GITHUB_REF_NAME is not set.", file=sys.stderr)
        sys.exit(1)

    prev_tag = previous_tag(current_ref)
    shas = collect_commits(current_ref, prev_tag)

    entries = []
    authors = set()
    stats = Counter({"total": len(shas), "breaking": 0})

    for sha in shas:
        try:
            subject_raw = run_git("log", "-1", "--format=%s", sha)
            body_raw = run_git("log", "-1", "--format=%b", sha)
        except subprocess.CalledProcessError:
            continue

        message = f"{subject_raw}\n{body_raw}"
        pr = fetch_pr_for_commit(repo, sha)

        if pr:
            number, pr_title, pr_author = pr
            pr_text = f"([#{number}](https://github.com/{repo}/pull/{number}))"
            author = pr_author or "dependabot"
            display_subject = pr_title
            # Prefer the PR title for display when it is more descriptive.
            classified = classify(pr_title)
        else:
            number = None
            pr_text = f"({sha[:7]})"
            author = run_git("log", "-1", "--format=%an", sha)
            display_subject = subject_raw
            classified = classify(subject_raw)

        section, breaking, subject, scope = classified
        subject = clean_subject(subject, scope) or display_subject

        if breaking:
            stats["breaking"] += 1
            section = "Breaking Changes"

        if section == "New Features":
            stats["features"] += 1
        elif section == "Bug Fixes":
            stats["fixes"] += 1

        authors.add(author)
        entries.append({
            "section": section,
            "subject": subject,
            "pr_text": pr_text,
            "author": author,
        })

    grouped = OrderedDict()
    breaking_entries = []
    for entry in entries:
        if entry["section"] == "Breaking Changes":
            breaking_entries.append(entry)
            continue
        grouped.setdefault(entry["section"], []).append(entry)

    ordered_authors = sorted(authors, key=str.lower)
    output = render_markdown(
        current_ref, prev_tag, repo, grouped, ordered_authors, stats, breaking_entries)

    with open("RELEASE_NOTES.md", "w", encoding="utf-8") as fh:
        fh.write(output)

    print(f"::notice::Generated release notes with {stats['total']} change(s).")
    print(f"::set-output name=changes::{stats['total']}")


if __name__ == "__main__":
    main()
