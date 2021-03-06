var express = require('express'), app = express(), request = require('request'), path = require('path'), repoman = require('./repoman.js'), port = process.argv[2] || 3000;

app.use(express.static(path.join(__dirname + "/public", '')));

// get org info for a github organization.
app.get('/org/:orgname', function(req, res) {

    var orgName = req.params.orgname;
    res.setHeader('content-type', 'application/json');
    return repoman.getOrgInfo(orgName, function(orgInfo) {
	res.send(orgInfo);
    });
});

// get repo info for a github organization.
app.get('/repos/:ownertype/:orgname', function(req, res) {

    var orgName = req.params.orgname, ownerType = req.params.ownertype;


    res.setHeader('content-type', 'application/json');
    return repoman.getRepos(orgName, ownerType, function(repos) {
	console.log("repos is " + JSON.stringify(repos));
	res.send(repos);
	res.end();
    });
});

// get commit info for a github organization.
app.get('/commits/:orgname/:reponame', function(req, res) {
    // https://api.github.com/repos/netflix/rxjava/commits
    var orgName = req.params.orgname, repoName = req.params.reponame;
    res.setHeader('content-type', 'application/json');
    return repoman.getCommits(orgName, repoName, function(commits) {
	console.log(repoName + " commits  " + JSON.stringify(commits));
	res.send(commits);
    });
});

// load an owner's repositories
app.get('/:orgname', function(req, res) {
	app.use(express.static(path.join(__dirname + "/public/index.html?" + req.params.orgname, '')));
});


app.listen(port);
