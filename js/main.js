//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "chartbeat-board.js"

$(document).ready(function () {

    GA_CLIENT_ID = getUrlParameter('ga_client_id');
    SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];
    GA_VIEW_ID = getUrlParameter('ga_view_id');

    document.getElementsByName('google-signin-client_id')[0].setAttribute('content', GA_CLIENT_ID)


    // CHARTBEAT ===============================================================

    var chart = chartbeat_board()
        .api_key(getUrlParameter('api_key'))
        .domain_name(getUrlParameter('domain'));
    d3.select('.cb-container').call(chart);

    // GOOGLE ANALYTICS ========================================================


});

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

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function queryReports() {
    $('.g-signin2').hide();
    doQuery();
    setInterval(doQuery, 3600000);

    

}

function doQuery(){
    gapi.client.request({
        path: '/v4/reports:batchGet',
        root: 'https://analyticsreporting.googleapis.com/',
        method: 'POST',
        body: {
            reportRequests: [
            {
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'yesterday',
                    endDate: 'yesterday'
                }
                ],
                dimensions: [
                    {
                        name: 'ga:pagePath'
                    }
                ],
                dimensionFilterClauses: [
                    {
                        filters: [
                            {
                                dimensionName: 'ga:pagePath',
                                expressions: [
                                '^/(blogs/[a-z\-]+|[a-z\-]+/stories)/[0-9]{4}/'
                                ]
                            }
                        ]
                    }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                orderBys: [
                {
                    fieldName: 'ga:pageviews',
                    sortOrder: 'DESCENDING'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'yesterday',
                    endDate: 'yesterday'
                }
                ],
                dimensions: [
                    {
                        name: 'ga:pagePath'
                    }
                ],
                dimensionFilterClauses: [
                    {
                        filters: [
                            {
                                dimensionName: 'ga:pagePath',
                                expressions: [
                                '^/galleries/'
                                ]
                            }
                        ]
                    }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                orderBys: [
                {
                    fieldName: 'ga:pageviews',
                    sortOrder: 'DESCENDING'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'yesterday',
                    endDate: 'yesterday'
                }
                ],
                dimensions: [
                    {
                        name: 'ga:medium'
                    },{
                        name: 'ga:pagePath'
                    }
                ],
                dimensionFilterClauses: [
                    {
                        operator: 'AND',
                        filters: [
                            {
                                dimensionName: 'ga:pagePath',
                                expressions: [
                                '^/(blogs/[a-z\-]+|[a-z\-]+/stories)/[0-9]{4}/'
                                ]
                            },{
                                dimensionName: 'ga:medium',
                                operator: 'EXACT',
                                expressions: [
                                    'organic'
                                ]
                            }
                        ]
                    }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                orderBys: [
                {
                    fieldName: 'ga:pageviews',
                    sortOrder: 'DESCENDING'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'yesterday',
                    endDate: 'yesterday'
                }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'yesterday',
                    endDate: 'yesterday'
                }
                ],
                metrics: [
                {
                    expression: 'ga:avgSessionDuration'
                }
                ],
                pageSize: 1
            }
            ]
        }
        }).then(function(response){
            // console.log(response);
            $('#yesterdays-top-story').text(
                response.result.reports[0].data.rows[0].dimensions[0]);
            $('#yesterdays-top-gallery').text(
                response.result.reports[1].data.rows[0].dimensions[0]);
            $('#yesterdays-top-search').text(
                response.result.reports[2].data.rows[0].dimensions[1]);
            $('#yesterdays-pageviews').text(
                numberWithCommas(response.result.reports[3].data.rows[0].metrics[0].values[0]));
            var d = response.result.reports[4].data.rows[0].metrics[0].values[0];
            $('#yesterdays-duration').text(Math.floor(d/60) + ':' + ('00' + Math.round(d % 60)).slice(-2));
        }, console.error.bind(console));

    gapi.client.request({
        path: '/v4/reports:batchGet',
        root: 'https://analyticsreporting.googleapis.com/',
        method: 'POST',
        body: {
            reportRequests: [
            {
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'today',
                    endDate: 'today'
                }
                ],
                dimensions: [
                    {
                        name: 'ga:pagePath'
                    }
                ],
                dimensionFilterClauses: [
                    {
                        filters: [
                            {
                                dimensionName: 'ga:pagePath',
                                expressions: [
                                '^/(blogs/[a-z\-]+|[a-z\-]+/stories)/[0-9]{4}/'
                                ]
                            }
                        ]
                    }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                orderBys: [
                {
                    fieldName: 'ga:pageviews',
                    sortOrder: 'DESCENDING'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'today',
                    endDate: 'today'
                }
                ],
                dimensions: [
                    {
                        name: 'ga:pagePath'
                    }
                ],
                dimensionFilterClauses: [
                    {
                        filters: [
                            {
                                dimensionName: 'ga:pagePath',
                                expressions: [
                                '^/galleries/'
                                ]
                            }
                        ]
                    }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                orderBys: [
                {
                    fieldName: 'ga:pageviews',
                    sortOrder: 'DESCENDING'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'today',
                    endDate: 'today'
                }
                ],
                dimensions: [
                    {
                        name: 'ga:medium'
                    },{
                        name: 'ga:pagePath'
                    }
                ],
                dimensionFilterClauses: [
                    {
                        operator: 'AND',
                        filters: [
                            {
                                dimensionName: 'ga:pagePath',
                                expressions: [
                                '^/(blogs/[a-z\-]+|[a-z\-]+/stories)/[0-9]{4}/'
                                ]
                            },{
                                dimensionName: 'ga:medium',
                                operator: 'EXACT',
                                expressions: [
                                    'organic'
                                ]
                            }
                        ]
                    }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                orderBys: [
                {
                    fieldName: 'ga:pageviews',
                    sortOrder: 'DESCENDING'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'today',
                    endDate: 'today'
                }
                ],
                metrics: [
                {
                    expression: 'ga:pageviews'
                }
                ],
                pageSize: 1
            },{
                viewId: GA_VIEW_ID,
                samplingLevel: 'LARGE',
                dateRanges: [
                {
                    startDate: 'today',
                    endDate: 'today'
                }
                ],
                metrics: [
                {
                    expression: 'ga:avgSessionDuration'
                }
                ],
                pageSize: 1
            }
            ]
        }
        }).then(function(response){
            // console.log(response);
            $('#todays-top-story').text(
                response.result.reports[0].data.rows[0].dimensions[0]);
            $('#todays-top-gallery').text(
                response.result.reports[1].data.rows[0].dimensions[0]);
            $('#todays-top-search').text(
                response.result.reports[2].data.rows[0].dimensions[1]);
            $('#todays-pageviews').text(
                numberWithCommas(response.result.reports[3].data.rows[0].metrics[0].values[0]));
            var d = response.result.reports[4].data.rows[0].metrics[0].values[0];
            $('#todays-duration').text(Math.floor(d/60) + ':' + ('00' + Math.round(d % 60)).slice(-2));
        }, console.error.bind(console));
}