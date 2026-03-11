on: push / pull_request   → triggers on push OR when PR is raised
runs-on: ubuntu-latest    → spins up a fresh Linux machine
actions/checkout@v4       → pulls your code into that machine
actions/setup-node@v4     → installs Node 20
npm install               → installs your packages
npm run build             → checks if app builds without errors