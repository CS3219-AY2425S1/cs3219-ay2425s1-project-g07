#!/bin/sh

# utility script to build image on GKE
version=$1

if [[ "X$version" == "X" ]]; then
    echo "Usage: bash build.sh [image_tag]"
    echo "E.g. bash build.sh v1.1"
    exit 1
fi

image="asia-southeast1-docker.pkg.dev/cs3219-peerprep-436507/peerprep/api-gateway:${version}"

docker build -t $image -f ./Dockerfile.dev

docker push $image