#!/bin/bash
# Web Search skill installation
# Verifies that BRAVE_API_KEY is available

echo "Installing web-search skill..."

if [ -z "$BRAVE_API_KEY" ]; then
  echo "WARNING: BRAVE_API_KEY not set. Web search will not work until configured."
  echo "Set it with: export BRAVE_API_KEY=your_key_here"
fi

echo "web-search skill installed successfully."
