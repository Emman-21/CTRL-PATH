::: {align="center"}
# `CTRL-PATH`

**Clone. Install. Navigate.**

*A quick-start guide for setting up CTRL-PATH on your local machine.*

![Setup](https://img.shields.io/badge/SETUP-LOCAL-00D9A6?style=for-the-badge&labelColor=101820)
![Runtime](https://img.shields.io/badge/NODE.JS-REQUIRED-78CFF5?style=for-the-badge&labelColor=101820)
![Package
Manager](https://img.shields.io/badge/NPM-DEPENDENCIES-F4B860?style=for-the-badge&labelColor=101820)
:::

------------------------------------------------------------------------

## `01` --- Prerequisites

Before setting up CTRL-PATH, make sure these tools are installed:

  --------------------------------------------------------------------------
  Tool                                   Purpose
  -------------------------------------- -----------------------------------
  [Git](https://git-scm.com/downloads)   Clone the project repository

  [Node.js](https://nodejs.org/) (LTS    Run the project and its JavaScript
  recommended)                           tooling

  npm                                    Install the project's Node.js
                                         dependencies; included with Node.js
  --------------------------------------------------------------------------

Verify your installations in a terminal:

``` bash
git --version
node --version
npm --version
```

If each command returns a version number, you're ready to continue.

## `02` --- Clone CTRL-PATH

Open your terminal and clone the repository:

``` bash
git clone https://github.com/Emman-21/CTRL-PATH.git
```

Move into the project directory:

``` bash
cd CTRL-PATH
```

You now have a local copy of CTRL-PATH.

## `03` --- Install Node Modules

Install the dependencies listed in the project's `package.json`:

``` bash
npm install
```

npm will download the required packages and create the `node_modules`
directory.

> **Tip:** If the repository includes a `package-lock.json`,
> `npm install` will use it to help keep dependency versions consistent.

## `04` --- Configure Environment Variables (If Required)

Some projects need environment variables to run.

Check the project root for an `.env.example` file. If one exists, create
your local `.env` file and fill in the required values.

**Windows PowerShell:**

``` powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

``` bash
cp .env.example .env
```

If no `.env.example` file is provided, or the project does not require
environment variables, skip this step.

> Keep your `.env` file private. Do not commit API keys, passwords, or
> other secrets to GitHub.

## `05` --- Run CTRL-PATH

First, check which scripts are available in the project:

``` bash
npm run
```

Then run the appropriate development or start command listed in
`package.json`. For example, if the project defines a `dev` script:

``` bash
npm run dev
```

Or, if it defines a `start` script:

``` bash
npm start
```

Use only a command that is actually defined by the project.

------------------------------------------------------------------------

::: {align="center"}
``` text
┌──────────────────────────────────────────────┐
│                                              │
│   CTRL-PATH                                  │
│   ────────────────────────────────────────   │
│   REPOSITORY  : Emman-21 / CTRL-PATH         │
│   STATUS      : READY TO SET UP              │
│   NEXT STEP   : CLONE → INSTALL → RUN        │
│                                              │
└──────────────────────────────────────────────┘
```

**CTRL-PATH --- Your local setup starts here.**

[GitHub Repository](https://github.com/Emman-21/CTRL-PATH)
:::
