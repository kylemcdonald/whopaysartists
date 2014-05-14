# [Who pays artists?](http://whopaysartists.com/)

Right now [Who pays artists?](http://whopaysartists.com/) is a work in progress, with a mockup on the main page and this repository representing some initial work.

If you'd like to contribute, you can help by closing any issues with PRs.

Because there is so much interest, make sure to comment that you are working to close an issue to avoid duplication of labor.

## Dependencies
 - Node - [http://nodejs.org/](http://nodejs.org/)
 - NPM - [https://www.npmjs.org/](https://www.npmjs.org/)
 - Mongo DB - [http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)

The easiest way to install these three dependancies is with Homebrew:

```$ brew update```

```$ brew install node # npm comes baked into node```

```$ brew install mongodb```

## Getting setup

 - Clone the repository
 - ```$ npm install```
 - ```$ npm start```
 - Point your browser to [http://localhost:3000](http://localhost:3000)

## Common problems

```Error: Cannot find module 'express'```

Make sure you've run ```$ npm install```

```
TypeError: Cannot call method 'createCollection' of null 
at /Users/youruser/Workspaces/WhoPaysArtists/storage.js:29:16
```

Make sure you've installed MongoDB and that it's running
