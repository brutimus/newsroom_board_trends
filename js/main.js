//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "chartbeat-board.js"

$(document).ready(function () {

	var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};

	// CHARTBEAT ===============================================================

	var chart = chartbeat_board()
		.api_key(getUrlParameter('api_key'))
		.domain_name(getUrlParameter('domain'));

	d3.select('.cb-container').call(chart);

	// GOOGLE ANALYTICS ========================================================

	CLIENT_ID = getUrlParameter('ga_client_id');
	SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];
	// GA_ACCOUNT = '230256';
	// GA_PROPERTY = 'UA-230256-14';
	GA_PROFILE = '10916816';
	document.getElementById('auth-button').addEventListener('click', authorize);

});


var CLIENT_ID, SCOPES;

function authorize(event) {
	// Handles the authorization flow.
	// `immediate` should be false when invoked from the button click.
	var useImmdiate = event ? false : true;
	var authData = {
		client_id: CLIENT_ID,
		scope: SCOPES,
		immediate: useImmdiate
	};

	gapi.auth.authorize(authData, function (response) {
		var authButton = document.getElementById('auth-button');
		if (response.error) {
			authButton.hidden = false;
		} else {
			authButton.hidden = true;
			// queryAccounts();
			gapi.client.load('analytics', 'v3').then(function(){
				queryCoreReportingApi(GA_PROFILE);
			});
		}
	});
}

function queryCoreReportingApi(profileId) {
	// Query the Core Reporting API for the number sessions for
	// the past seven days.
	gapi.client.analytics.data.ga.get({
			'ids': 'ga:' + profileId,
			'start-date': 'yesterday',
			'end-date': 'today',
			'metrics': 'ga:sessions'
		})
		.then(function (response) {
			var formattedJson = JSON.stringify(response.result, null, 2);
			console.log(formattedJson);
		})
		.then(null, function (err) {
			// Log any errors.
			console.log(err);
		});
}