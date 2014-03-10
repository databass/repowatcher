# repowatcher

RepoWatcher is a Node.js app that uses the GitHub API to return metrics on GitHub Organization Repositories. 

http://repowatcher.net

RepoWatcher will display charts depecting a GitHub Organization's most popular Repos, based on number of forks, or stars.
It will also list an organization's public repositories, with quick links to recent commits for each repo.


## Installation Instructions

Assuming that you have [Node.js](http://nodejs.org/) (version 0.10 or greater), and Git installed on your machine:

```sh
git clone https://github.com/databass/repowatcher.git # or clone your own fork
cd repowatcher
npm install
node server.js
```
Your app should now be running on [localhost:3000](http://localhost:3000/).

If you'd like to run on a different port, you can enter that port number as a parameter, e.g.
```sh
node server.js 5000
```
Your app should now be running on [localhost:5000](http://localhost:5000/).


## Optional GitHub Client ID and Client Secret Configuration

You can optionally add your GitHub Client Id and Client Secret. This will raise the API limits significantly. Since repoman.js is a parent of the public directory, it will not be exposed to the public area. 

To change this, make a quick edit to repoman.js, located in the root folder.

```js
// put your GitHub Client ID and Client Secret here. 
// Without this information, the app will still run but the rate limit will be quickly exceeded
var clientId = 'xxx', clientSecret = 'yyy';
```





