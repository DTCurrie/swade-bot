#!/bin/bash

find_latest_semver() {
    # Gets version from package.json
    echo $(npm pkg get version | sed 's/"//g')
}

increment_ver() {
    find_latest_semver | awk -F. -v a="$1" -v b="$2" -v c="$3" \
    '{printf("%d.%d.%d", $1+a, $2+b , $3+c)}'
}

bump() {
    # Get versions
    next_ver="$(increment_ver "$1" "$2" "$3")"
    latest_ver="$(find_latest_semver)"
    
    # Set package.json version to next version and commit
    echo "Bumping version to $next_ver"
    npm pkg set version=$next_ver
    git add .
    git commit -m "Bump version to $next_ver"
    
    
    # Get commits
    latest_commit=$(git rev-parse "v${latest_ver}" 2>/dev/null )
    head_commit=$(git rev-parse HEAD)
    
    # Tag commits
    if [ "$latest_commit" = "$head_commit" ]; then
        echo "refusing to tag; $latest_ver already tagged for HEAD ($head_commit)"
    else
        echo "tagging v$next_ver $head_commit"
        git tag "v$next_ver" $head_commit
    fi
}

usage() {
    echo "Pass a bump type: major|minor|patch"
    exit 1
}

case $1 in
    major) bump 1 0 0;;
    minor) bump 0 1 0;;
    patch) bump 0 0 1;;
    *) usage
esac