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
    if [ $dry != true ] ; then
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
    else
        echo "EXECUTING DRY RUN - NO CHANGES WILL BE COMMITTED"
        
        echo "npm pkg set version=$next_ver"
        echo "git add ."
        echo "git commit -m \"Bump version to $next_ver\""
        
        # Get commits
        echo "latest_commit=$(git rev-parse \"v${latest_ver}\" 2>/dev/null )"
        echo "head_commit=DRY_RUN_NO_COMMIT"
        
        # Tag commits
        echo "tagging v$next_ver DRY_RUN_NO_COMMIT"
        echo  "git tag \"v$next_ver\" DRY_RUN_NO_COMMIT"
    fi
}

usage() {
    echo "Pass a bump type with the -t flag: major|minor|patch"
    exit 1
}

dry=false

while getopts t:d: flag
do
    echo "flag: $flag ${OPTARG}"
    case "${flag}" in
        t) type=${OPTARG};;
        d) dry=${OPTARG};;
    esac
done

case $type in
    major) bump 1 0 0;;
    minor) bump 0 1 0;;
    patch) bump 0 0 1;;
    *) usage
esac
