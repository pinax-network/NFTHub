#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

clean=

main() {
  pushd "$ROOT" &> /dev/null

  while getopts "hc" opt; do
    case $opt in
      h) usage && exit 0;;
      c) clean=true;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  if [[ -d "./data" && $clean == true ]]; then
    echo "Cleaning data directory"
    rm -rf ./data 1> /dev/null
  fi

  prepare

  # Pass execution to docker compose
  exec docker-compose up
}

prepare() {
  if [[ -z "$ETH_MAINNET_RPC" ]]; then
    export ETH_MAINNET_RPC="https://eth.rpc.pinax.network:8545"
  fi
  if [[ -z "$SUBSTREAMS_ENDPOINT" || -z "$SUBSTREAMS_API_TOKEN" ]]; then
    echo "Your environment is not corrrectly configured to launch Docker Compose configuration."
    echo "Some of the required environment variables are unset or empty:"
    echo " - ETH_MAINNET_RPC (Current value '${ETH_MAINNET_RPC}', if local RPC node via 'localhost' like 'http://localhost:8545', use 'http://host-gateway:8545')"
    echo " - SUBSTREAMS_ENDPOINT (Current value '${SUBSTREAMS_ENDPOINT}', must in the form '<scheme>://<url>:<port>')"
    echo " - SUBSTREAMS_API_TOKEN (Current value '${SUBSTREAMS_API_TOKEN}')"
    echo ""
    echo "Ensure those are properly loaded in your environment"
    exit 1
  fi

  if [[ ! -d "./data/ipfs" ]]; then
    mkdir -p ./data/ipfs 1> /dev/null
  fi

  if [[ ! -d "./data/postgres" ]]; then
    mkdir -p ./data/postgres 1> /dev/null
  fi
}

usage_error() {
  message="$1"
  exit_code="$2"

  echo "ERROR: $message"
  echo ""
  usage
  exit ${exit_code:-1}
}

usage() {
  echo "usage: up [-c]"
  echo ""
  echo "Setup required files layout and launch 'docker compose up'"
  echo "spinning up all required development dependencies."
  echo ""
  echo "Options"
  echo "    -c          Clean 'data' directory before launching dependencies"
  echo "    -h          Display help about this script"
}

main "$@"


