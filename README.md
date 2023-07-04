This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Getting Started

First, install Node.js from https://nodejs.org/en

Once installed, install the necessary Next.js modules:

```bash
npm install
npm install next
```

Install python from https://www.python.org/downloads/

Install the python modules to run the flask backend server, they have been included in the requirements folder:

```bash
pip install -r backend/requirements.txt
```

Install the Poppins font family from https://fonts.google.com/specimen/Poppins

Add the necessary API keys to the environment variables (.env file for Mac).
- OpenAI
- Google Cloud Speech-to-text Service Account Credentials
- Oculavis

Run the backend server by pressing F5.

Open a new Terminal, and run the frontend application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Commands to Push a Change to the code

Save the code

```bash
crtl + s
```

Add files to be committed, you can add several files, ensure you are in the correct directory when adding a file.

```bash
git add [the file you changed]
```

Commit your changes. Give a meaningful description of what you changed.

```bash
git commit -m "[Comment on what the change is]" 
```

Makes a new branch

```bash
git branch [branchname]
```

Uploads the code to the branch for the first time

```bash
git push origin [branchname]
```

Uploads the code to the current branch

```bash
git push [branchname]
```

The code should appear as a branch on Github.

To check your current branch:

```bash
git status
```

To make a new branch based on a specific commit:

```bash
git branch new-branch <commit-SHA>
git checkout new-branch
```

# Application Wiki

This repository contains numerous different files in the root directory such as:

```bash
.gitignore
jsconfig.json
next.config.js
package-lock.json
package.json
postcss.config.js
script.js
tailwind.config.js
```

## .gitignore
This file contains the files that are ignored by git when pushing to the repository. This is used to prevent the pushing of unnecessary files to the repository.

## jsconfig.json
This is used to configure the javascript files in the project.

## next.config.js
This is used to configure the next.js application.

## package-lock.json
The purpose of the package-lock.json file is to lock the versions of the package's dependencies. This means it records the exact version of every package installed as well as its descendants. By doing so, when you share your project with others, and they run npm install, they'll get the exact same versions of the packages as you have in your environment.

## package.json
This is used to configure the packages used in the application. This is used to install the packages used in the application. This is used to run the application. This is used to run the application in development mode.

## postcss.config.js
This is used to configure the postcss files in the application. 

## script.js
This is used to configure the scripts used in the application. This is used to run the application in development mode.

## tailwind.config.js
This is used to configure the tailwind files in the application. 
