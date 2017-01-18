//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "chartbeat-board.js"

$(document).ready(function() {

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

	var chart = chartbeat_board()
		.api_key(getUrlParameter('api_key'))
	    .domain_name(getUrlParameter('domain'));

	d3.select('.container').call(chart);
});