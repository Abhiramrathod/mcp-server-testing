#!/usr/bin/env bash
set -euo pipefail

# This script generates aggregated Javadocs and copies them into docs/javadoc/apidocs
# Usage: ./docs/scripts/generate_javadocs.sh

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"

echo "Repository root: $repo_root"

if ! command -v mvn >/dev/null 2>&1; then
  echo "mvn not found in PATH. Install Maven to run this script." >&2
  exit 1
fi

cd "$repo_root"

echo "Running: mvn -T 1C -DskipTests clean javadoc:aggregate"
mvn -T 1C -DskipTests clean javadoc:aggregate

src="$repo_root/target/site/apidocs"
dest="$repo_root/docs/javadoc/apidocs"

if [ ! -d "$src" ]; then
  echo "Generated javadocs not found at: $src" >&2
  exit 2
fi

mkdir -p "$dest"
cp -r "$src/"* "$dest/"

echo "Javadocs copied to: $dest"

