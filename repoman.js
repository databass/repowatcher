var _ = require('underscore'), moment = require('moment'), request = require('request');
exec = require('child_process').exec, clientId = 'xxx', clientSecret = 'yyy';

exports.getOrgInfo = function(orgName, callback) {

    var ownerTypes = ['orgs', 'users'], getOrgRequestURL = function(orgName, ownerType) {

	console.log('getting org info for ' + orgName);
	return 'https://api.github.com/' + ownerType + '/' + orgName + '?client_id=' + clientId + '&client_secret=' + clientSecret;

    }, results = {}, requestCallback, options = {
	headers : {
	    "Accept" : "application/vnd.github.v3+json",
	    "User-Agent" : "repowatcher"
	},
	url : getOrgRequestURL(orgName, ownerTypes[0])

    };

    requestCallback = function(error, response, body) {

	if (!error) {
	    try {

		results.orgInfo = JSON.parse(body);

	    } catch (e) {
		console.log("Error converting response to JSON: " + e.description);
		results.error = "Error converting response to JSON: " + e.message;
	    }

	    if (results.orgInfo.message !== undefined) {
	console.log("message is " + results.orgInfo.message);
            if (ownerTypes.length > 1) {

                options.url = getOrgRequestURL(orgName, ownerTypes.pop());
	console.log("url is now " + options.url);
            	request.get(options, requestCallback);
             }
             else {
		results.error = '<span class="bold">' + orgName + '</span> ' + results.orgInfo.message;
	    return callback(results);
            }

	    }
           else {
		return callback(results);
          }

	} else {
	    results.error = error.code || 'error code is undefined';
	    return callback(results);
	}


    };
    request.get(options, requestCallback);

};

exports.getRepos = function(orgName, ownerType, callback) {

    	var getOrgRepoRequestURL = function(orgName, pageNumber) {
	if (pageNumber === undefined || pageNumber === null) {
	    pageNumber = 1;
	}
	console.log('getting repos from page ' + pageNumber);
	return 'https://api.github.com/' + ownerType + '/' + orgName + '/repos?page=' + pageNumber + '&client_id=' + clientId + '&client_secret=' + clientSecret;

    }, results = {}, requestCallback, pageNumber = 1, options = {
	headers : {
	    "Accept" : "application/vnd.github.v3+json",
	    "User-Agent" : "repowatcher"
	},
	url : getOrgRepoRequestURL(orgName, 1)

    }, MAX_PAGES = 10;

    results.repos = [];

    requestCallback = function(error, response, body) {

	var mapResults = function(data) {
	    var mappedResults = [];
	    try {

		mappedResults = _.sortBy(_.map(data, function(repo) {
		    return {
			"Forks" : repo.forks_count,
			"Watchers" : repo.watchers_count,
			"Stars" : repo.stargazers_count,
			"Size" : repo.size,
			"Language" : repo.language,
			"Name" : repo.name,
			"Fullname" : repo.full_name,
			"Created" : moment(repo.created_at).format("MM/DD/YYYY"),
			"Updated" : moment(repo.updated_at).format("MM/DD/YYYY"),
		    };

		}), function(repo) {
		    return repo.forks;
		});

		return mappedResults;

	    } catch (e) {
		return {
		    "error" : "Error summarizing results: " + e.message
		};
	    }

	};

	if (!error) {

	    try {
		results.data = JSON.parse(body);
		if (results.data.length === 0 && pageNumber === 1) {
		    results.error = '<span class="bold">' + orgName + "</span> has no public repositories";
		}

	    } catch (e) {
		console.log("Error converting response to JSON: " + e.description);
		results.error = "Error converting response to JSON: " + e.message;
	    }

	    if (results.data.message !== undefined) {
		results.error = '<span class="bold">' + orgName + '</span> ' + results.data.message;

	    } else if (results.data !== undefined && results.data.length > 0) {

		results.repos = results.repos.concat(mapResults(results.data));
		// console.log(JSON.stringify(results));
		//console.log("data is " + results.data);
		results.owner = results.data[0].owner;
	    }

	} else {
	    results.error = error.code || 'error code is undefined';
	}

	// if we have one of the following: errors, fewer than 30 results, or
	// we've exceeded the maximum number of pages allowed, then we're
	// done--return the callback
	if ((results.error !== undefined) || ((results.repos !== undefined && results.data.length < 30) || pageNumber >= MAX_PAGES)) {
	    //console.log('returning ' + JSON.stringify(results));
	    return callback(results);

	    // otherwise, increment the page count and make another request
	} else {
	    pageNumber++;
	    options.url = getOrgRepoRequestURL(orgName, pageNumber);
	    request.get(options, requestCallback);
	}
    };
    request.get(options, requestCallback);
};

exports.getCommits = function(orgName, repoName, callback) {

    var getCommitRequestURL = function(orgName, repoName) {
	return 'https://api.github.com/repos/' + orgName + '/' + repoName + '/commits?client_id=' + clientId + '&client_secret=' + clientSecret;
	;
    }, results = {}, requestCallback, options = {
	headers : {
	    "Accept" : "application/vnd.github.v3+json",
	    "User-Agent" : "repowatcher"
	},
	url : getCommitRequestURL(orgName, repoName)

    };

    requestCallback = function(error, response, body) {

	if (!error) {
	    try {
		results.commits = JSON.parse(body);

	    } catch (e) {
		console.log("Error converting response to JSON: " + e.description);
		results.error = "Error converting response to JSON: " + e.message;
	    }
	} else {
	    results.error = error.code || 'error code is undefined';
	}
//	console.log(JSON.stringify(results));
	return callback(results);
    };
    request.get(options, requestCallback);
};
