/**
 * repowatcher.js
 */

// when the document has loaded, add event-handlers
// note that all underscore templates are defined in index.html
var RW = (function() {

    var selectedOrgName = null;

    return {

	"drawChart" : function(data, chartType) {

	    var widthFactor = .48, svg, chart, measureAxis, maxRepo, maxLabelLength;

	    $("#ChartContainer").fadeIn();

	    $(".chartHeader").show();

	    if ($("#ChartContainer").width() < (1.8 * ($("#" + chartType + "ChartContainer").css("min-width").replace(/px/g, '')))) {
		widthFactor = .9;
	    }
	    
	    // dimple doesn't handle long labels well..and we don't want excessive padding, so this hack will add extra margin for 90 degree rotated labels
	    maxLabelLength = _.max(data, function(repo) {
		return repo.Name.length;
	    }).Name.length;


	    svg = dimple.newSvg("#" + chartType + "Chart", $("#ChartContainer").width() * widthFactor, 360);
	    chart = new dimple.chart(svg, data);

	    chart.addCategoryAxis("x", "Name");

	    measureAxis = chart.addMeasureAxis("y", chartType);
	    chart.addSeries([ 'Stars', 'Forks' ], dimple.plot.bar);

	    maxRepo = _.max(data, function(repo) {
		return Math.max(repo.Stars, repo.Forks);
	    });


	    
	    measureAxis.overrideMax = Math.max(maxRepo.Stars, maxRepo.Forks);
	    // measureAxis.titleShape.text("My own title");

	    chart.setMargins(60, 25, 25, 100);


	    chart.draw();

	},

	"getCommits" : function(orgName, repoName) {

	    $('#myWaitModal').modal({
		show : true
	    });
	    
	    $('#myWaitModal .modal-body').html('Retrieving Recent Repo Commits for <span class="bold">' + repoName + '</span>');
	    
	    $.getJSON("/commits/" + orgName + "/" + repoName, function(data) {
		$('#myWaitModal').modal('hide');
	
		if (data.error !== undefined) {

		    $('#myErrorModal').modal({
			show : true
		    });

		    $('#myErrorModal .modal-body').html(_.template($('#ErrorTemplate').html(), data));

		    return false;
		}

		$('#myCommitsModal').modal({
		    show : true
		});

		// workaround to make modal draggable
		$("#myCommitsModal").draggable({
		    handle : ".modal-header"
		});	
		$('#myCommitsModal .modal-title').html('Recent Commit Details for Repo <span class="bold">' + repoName + '</span>');
		$('#myCommitsModal .modal-body').html(_.template($('#CommitsTemplate').html(), data));

		$('#CommitsGrid').dataTable({
		    "aaSorting" : [ [ 2, "desc" ] ],
		    "bPaginate" : false,
		    "bFilter" : true,
		    "bAutoWidth" : false,
		    "oLanguage" : {
			"sSearch" : "Filter: "
		    }
		});
	
		return false;
	    });
	},

	"getOrgInfo" : function(orgName) {

	    var orgMapping = {"Organization":"orgs","User":"users"}, that = this;
	    $.getJSON("/org/" + orgName, function(data) {
		$('#myWaitModal').modal('hide');

		if (data.error !== undefined) {

		    $('#myErrorModal').modal({
			show : true
		    });

		    $('#myErrorModal .modal-body').html(_.template($('#ErrorTemplate').html(), data));

		    return false;
		}

		$("#OwnerSummaryContainer").html(_.template($('#HeaderTemplate').html(), data.orgInfo));

		that.getRepos(data.orgInfo.login, orgMapping[data.orgInfo.type]);

	    });

	},

	"getRepos" : function(orgName, ownerType) {

	    var that = this;

	    $("#InitialContainer").hide();
	    
	    $('#myWaitModal').modal({
		show : true
	    });

	    $('#myWaitModal .modal-body').html('Retrieving Repo Information for <span class="bold">' + orgName + '</span>');

	    $.getJSON("/repos/" + ownerType + '/' + orgName, function(data) {

		$('#myWaitModal').modal('hide');

		if (data.error !== undefined) {

		    $('#myErrorModal').modal({
			show : true
		    });
		    $('#myErrorModal .modal-body').html(_.template($('#ErrorTemplate').html(), data));

		    return false;
		}

		selectedOrgName = orgName;

		$("#GridContainer").html(_.template($('#GridTemplate').html(), data));
		$("#GridContainer").fadeIn();
		$('#ReposGrid').dataTable({
		    "aaSorting" : [ [ 2, "desc" ] ],
		    "bPaginate" : false,
		    "bFilter" : true,
		    "bAutoWidth" : false,
		    "oLanguage" : {
			"sSearch" : "Filter: "
		    }
		});

		// click on a repo name link
		$("td.repo").on('click', function(event) {

		    that.getCommits(selectedOrgName, $(this).data("repo"));

		});

		that.drawChart(_.sortBy(data.repos, function(repo) {
		    return -repo.Stars;
		}).slice(0, 5), "Stars");

		that.drawChart(_.sortBy(data.repos, function(repo) {
		    return -repo.Forks;
		}).slice(0, 5), "Forks");

	    });

	},

	"init" : function() {

	    var that = this, fetchRepoHandler = function() {

		var name = $('#UsernameInput').val();

		if (name.replace(/\s/g) === '') {
		    $('#myErrorModal').modal({
			show : true
		    });
	
		    $('#myErrorModal .modal-body').html(_.template($('#ErrorTemplate').html(), {"error" : "Please Enter a Repo"}));


		    return false;
		}

		$("#ChartContainer").hide();
		$("#GridContainer").hide();
		$("#StarsChart").empty();
		$("#ForksChart").empty();
		$("#GridContainer").empty();
		$("#InitialContainer").hide();
		$(".chartHeader").hide();
		$("#OwnerSummaryContainer").empty();
		$("#OwnerSummaryContainer").show();
		selectedOrgName = null;
		that.getOrgInfo(name);

	    };



	    // events

	    $("#GetRepos").on('click', fetchRepoHandler);

	    $('#UsernameInput').on('keypress', function(event) {

		var keycode = (event.keyCode ? event.keyCode : event.which);
		if (keycode === 13) {
		    fetchRepoHandler();
		}
	    });

	}
    };

})();
