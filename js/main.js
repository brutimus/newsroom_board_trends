//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "chartbeat-board.js"

$(document).ready(function () {

    GA_CLIENT_ID = getUrlParameter('ga_client_id');
    SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];
    GA_VIEW_ID = getUrlParameter('ga_view_id');
    TW_KEY = getUrlParameter('tw_key');
    TW_SECRET = getUrlParameter('tw_secret');
    TW_TOKEN = getUrlParameter('tw_token');
    TW_TOKEN_SECRET = getUrlParameter('tw_token_secret');

    document.getElementsByName('google-signin-client_id')[0].setAttribute(
        'content', GA_CLIENT_ID);

    // TWITTER =================================================================

    var cb = new Codebird;
    cb.setConsumerKey(TW_KEY, TW_SECRET);
    cb.setToken(TW_TOKEN, TW_TOKEN_SECRET);
    cb.__call(
        "trends_place",
        {'id': '2490383'}, // Seattle
        function (reply, rate, err) {
            // console.log(err);
            twitterTrends(
                '.twitter-trends-seattle',
                'Seattle',
                reply[0].trends.slice(0, 10));
        }
    );
    cb.__call(
        "trends_place",
        {'id': '23424977'}, // USA
        function (reply, rate, err) {
            // console.log(err);
            twitterTrends(
                '.twitter-trends-national',
                'National',
                reply[0].trends.slice(0, 10));
        }
    );
    cb.__call(
        "trends_place",
        {'id': '1'}, // Global
        function (reply, rate, err) {
            // console.log(err);
            twitterTrends(
                '.twitter-trends-global',
                'Global',
                reply[0].trends.slice(0, 10));
        }
    );

    // GOOGLE TRENDS ===========================================================

    d3.json(
        'http://crossorigin.me/http://hawttrends.appspot.com/api/terms/',
        function(error, data){
            var usa_data = data[1];
            console.log(data)
            $.each([
                [0, 6],
                [6, 12],
                [12, 18]
            ], function(i, set){
                console.log(set)
                var scope_data = usa_data.slice(set[0], set[1]),
                    container = d3.select(
                    '.google-trends-container .google-trends-' + set[0] + '-' + set[1]
                );
                // container.append('h2').text('Search Rank ' + set[0] + '-' + set[1]);
                var lis = container.append('ul')
                    .selectAll('li')
                    .data(scope_data)
                    .enter().append('li');
                lis.append('span')
                    .attr('class', 'rank')
                    .text(function(d, i){ return set[0]+1+i + '.'; })
                lis.append('span')
                    .attr('class', 'text')
                    .text(function(d){return d});

            })

        })

});

// TWITTER =====================================================================

function twitterTrends(selector, label, data){
    var container = d3.select(selector);
    container.append('h2').text(label);
    container.append('ul')
        .selectAll('li')
            .data(data)
            .enter().append('li')
                .text(function(d){ return d.name; });
}

// function twitterTrends(selector, label, data){
//     console.log(data)
//     var svg = d3.select(selector),
//         margin = {top: 20, right: 20, bottom: 30, left: 50},
//         width = +svg.attr("width") - margin.left - margin.right,
//         height = +svg.attr("height") - margin.top - margin.bottom;

//     var g = svg.append("g").attr(
//         "transform",
//         "translate(" + margin.left + "," + margin.top + ")");
    
//     var x = d3.scaleLinear()
//             .rangeRound([0, width])
//             .domain([0, d3.max(data, function(d){return d.tweet_volume; })]);
//         y = d3.scaleBand()
//             .rangeRound([height, 0]).padding(0.1)
//             .domain(data.map(function(d){ return d.name; }));
    
//     g.selectAll(".bar")
//         .data(data)
//         .enter().append("rect")
//             .attr("class", "bar")
//             .attr("x", 0)
//             .attr("y", function(d){ return y(d.name); })
//             .attr("width", function(d){ return width - x(d.tweet_volume)})
//             .attr("height", y.bandwidth());

// }

// GOOGLE ANALYTICS ============================================================

var parseDate = d3.timeParse('%Y%m%d%H'),
    dateFormat = d3.timeFormat('%Y-%m-%d')
    yesterday = new Date(Date.now() - (1000 * 60 * 60 * 24)),
    minus_5_days = new Date(Date.now() - (1000 * 60 * 60 * 24 * 5)),
    minus_7_days = new Date(Date.now() - (1000 * 60 * 60 * 24 * 7)),
    minus_14_days = new Date(Date.now() - (1000 * 60 * 60 * 24 * 14));

function queryReports() {
    $('.g-signin2').hide();
    trafficSourcePastWeek(
        ".ga-container .sources-past-five-days",
        minus_5_days,
        yesterday,
        "Traffic Sources - Past 5 Days");
    trafficDevicesPastWeek(
        ".ga-container .devices-past-five-days",
        minus_5_days,
        yesterday,
        "Devices - Past 5 Days");
    yesterdayPublished(
        ".site-trends-container .yesterday-published",
        yesterday,
        yesterday,
        "Published Yesterday");
    yesterdayPageviews(
        ".site-trends-container .yesterday-pageviews",
        yesterday,
        yesterday,
        "Published Anytime");
}

function trafficSourcePastWeek(selector, start_date, end_date, label){
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
                    startDate: dateFormat(start_date),
                    endDate: dateFormat(end_date)
                }
                ],
                dimensions: [
                    {name: 'ga:dateHour'},
                    {name: 'ga:hasSocialSourceReferral'},
                ],
                metrics: [
                    {expression: 'ga:sessions'},
                    {expression: 'ga:organicSearches'},
                ],
                pageSize: 10000
            }]
        }
        }).then(function(response){
            // console.log(response);
            var tempdata = {},
                data = [];
            $.each(response.result.reports[0].data.rows, function(i, d){
                var row = tempdata[d.dimensions[0]] = tempdata[d.dimensions[0]] || {};
                if (d.dimensions[1] == "No") {
                    row.sessions = +d.metrics[0].values[0];
                    row.search = +d.metrics[0].values[1];
                } else {
                    row.social = +d.metrics[0].values[0];
                }
            });

            $.each(tempdata, function(k, v){
                v.date = parseDate(k);
                v.other = v.sessions - v.social - v.search;
                data.push(v);
            });
            
            var svg = d3.select(selector),
                margin = {top: 0, right: 0, bottom: 30, left: 50},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr(
                    "transform",
                    "translate(" + margin.left + "," + margin.top + ")");
            
            var x = d3.scaleTime().rangeRound([0, width]),
                y = d3.scaleLinear().rangeRound([height, 0]),
                z = d3.scaleOrdinal(d3.schemeCategory20c),
                stack = d3.stack(),
                keys = ['social', 'search', 'other'];
            
            var area = d3.area().curve(d3.curveMonotoneX)
                .x(function(d) { return x(d.data.date); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); });

            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain([0, d3.max(data, function(d) { return d.other + d.social + d.search + 1000; })]);
            z.domain(keys);
            stack.keys(keys);
            
            g.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(y)
                    .ticks(5)
                    .tickSize(-width)
                    .tickFormat("")
                    .tickSizeOuter(0))

            g.append("g")
                .attr("class", "axis-x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x)
                    .ticks(5, "%a %e"));

            g.append("g")
                .attr("class", "axis-y")
                .call(d3.axisLeft(y)
                    .ticks(5)
                    .tickSizeOuter(0))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", "-10px")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Sessions / Hour");
            
            var legend = g.append("g")
                .attr("class", "legend")
                .selectAll("g")
                .data(keys.reverse())
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(" +  -80 * i + ",0)"; });

            legend.append("rect")
                .attr("x", width - 80)
                .attr("width", 80)
                .attr("height", 22)
                .attr("fill", z);

            legend.append("text")
                .attr("x", width - 70)
                .attr("y", 15)
                .text(function(d) { return d; });
            
            var layer = g.selectAll('.layer')
                .data(stack(data))
                .enter().append('g')
                    .attr('class', 'layer');
            
            layer.append('path')
                .attr('class', 'area')
                .style('fill', function(d){ return z(d.key); })
                .attr('d', area);
            
        }, console.error.bind(console));
}

function trafficDevicesPastWeek(selector, start_date, end_date, label){
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
                    startDate: dateFormat(start_date),
                    endDate: dateFormat(end_date)
                }
                ],
                dimensions: [
                    {name: 'ga:dateHour'},
                    {name: 'ga:deviceCategory'},
                ],
                metrics: [
                    {expression: 'ga:sessions'},
                ],
                pageSize: 10000
            }]
        }
        }).then(function(response){
            // console.log(response);
            var data = {};
            $.each(response.result.reports[0].data.rows, function(i, d){
                var row = data[d.dimensions[0]] = data[d.dimensions[0]] || {};
                row[d.dimensions[1]] = +d.metrics[0].values[0];
                row['date'] = parseDate(d.dimensions[0]);
            });
            data = $.map(data, function(v, k){return v});

            var svg = d3.select(selector),
                margin = {top: 0, right: 0, bottom: 30, left: 50},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr(
                    "transform",
                    "translate(" + margin.left + "," + margin.top + ")");
            
            var x = d3.scaleTime().rangeRound([0, width]),
                y = d3.scaleLinear().rangeRound([height, 0]),
                z = d3.scaleOrdinal(d3.schemeCategory20.slice(1)),
                keys = ['desktop', 'mobile', 'tablet'];

            var lineD = d3.line()
                .curve(d3.curveMonotoneX)
                .x(function(d){ return x(d.date)})
                .y(function(d){ return y(d.desktop)});
            
            var lineM = d3.line()
                .curve(d3.curveMonotoneX)
                .x(function(d){ return x(d.date)})
                .y(function(d){ return y(d.mobile)});
            
            var lineT = d3.line()
                .curve(d3.curveMonotoneX)
                .x(function(d){ return x(d.date)})
                .y(function(d){ return y(d.tablet)});

            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain([0, d3.max(data, function(d) { return d3.max([d.tablet, d.mobile, d.desktop]) + 500 })]);
            z.domain(keys);

            g.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(y)
                    .ticks(5)
                    .tickSize(-width)
                    .tickFormat("")
                    .tickSizeOuter(0))

            g.append("g")
                .attr("class", "axis-x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x)
                    .ticks(5, "%a %e"));

            g.append("g")
                .attr("class", "axis-y")
                .call(d3.axisLeft(y)
                    .ticks(5)
                    .tickSizeOuter(0))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", "-10px")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Sessions / Hour");
            
            var legend = g.append("g")
                .attr("class", "legend")
                .selectAll("g")
                .data(keys.reverse())
                .enter().append("g")
                .attr(
                    "transform",
                    function(d, i) { return "translate(" +  -80 * i + ",0)"; });

            legend.append("rect")
                .attr("x", width - 80)
                .attr("width", 80)
                .attr("height", 22)
                .attr("fill", z);

            legend.append("text")
                .attr("x", width - 70)
                .attr("y", 15)
                .text(function(d) { return d; });

            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", z('desktop'))
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3)
                .attr("d", lineD);
            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", z('mobile'))
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3)
                .attr("d", lineM);
            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", z('tablet'))
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3)
                .attr("d", lineT);
            
        }, console.error.bind(console));
}

function yesterdayPublished(selector, start_date, end_date, label){
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
                    startDate: dateFormat(start_date),
                    endDate: dateFormat(end_date)
                }
                ],
                dimensions: [
                    {name: 'ga:pagePath'},
                    {name: 'ga:pageTitle'},
                ],
                dimensionFilterClauses: [
                    {
                        filters: [
                            {
                                dimensionName: 'ga:dimension5',
                                operator: 'EXACT',
                                expressions: [
                                    dateFormat(start_date)
                                ]
                            }
                        ]
                    }
                ],
                metrics: [
                    {expression: 'ga:pageviews'},
                ]
            }]
        }
        }).then(function(response){
            // console.log(response);
            var data = {};
            $.each(response.result.reports[0].data.rows, function(i, d){
                var row = data[d.dimensions[0]] = data[d.dimensions[0]] || {};
                row['title'] = d.dimensions[1];
                row['pageviews'] = (row['pageviews'] || 0) + parseInt(d.metrics[0].values[0]);
            });
            data = $.map(data, function(v, k){return v}).sort(function(a, b){
            return ((a.pageviews < b.pageviews) ? -1 : ((a.pageviews > b.pageviews) ? 1 : 0));
            }).reverse().slice(0, 10);
            // console.log(data)
            var container = d3.select(selector);
            container.append('h2').text(label);
            var lis = container.append('ul')
                .selectAll('li')
                    .data(data)
                    .enter().append('li');
                        // .text(function(d){ return d.title; });
            lis.append('span')
                .attr('class', 'text')
                .text(function(d){return d.title});
            lis.append('span')
                .attr('class', 'num')
                .text(function(d){return numberWithCommas(d.pageviews)});
            
        }, console.error.bind(console));
}

function yesterdayPageviews(selector, start_date, end_date, label){
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
                    startDate: dateFormat(start_date),
                    endDate: dateFormat(end_date)
                }
                ],
                dimensions: [
                    {name: 'ga:pagePath'},
                    {name: 'ga:pageTitle'},
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
                    {expression: 'ga:pageviews'},
                ],
                orderBys: [
                {
                    fieldName: 'ga:pageviews',
                    sortOrder: 'DESCENDING'
                }
                ],
                pageSize: 10000
            }]
        }
        }).then(function(response){
            // console.log(response);
            var data = {};
            $.each(response.result.reports[0].data.rows, function(i, d){
                var row = data[d.dimensions[0]] = data[d.dimensions[0]] || {};
                row['title'] = row['title'] || d.dimensions[1];
                row['pageviews'] = (row['pageviews'] || 0) + parseInt(d.metrics[0].values[0]);
            });
            data = $.map(data, function(v, k){return v}).sort(function(a, b){
            return ((a.pageviews < b.pageviews) ? -1 : ((a.pageviews > b.pageviews) ? 1 : 0));
            }).reverse().slice(0, 10);
            // console.log(data)
            var container = d3.select(selector);
            container.append('h2').text(label);
            var lis = container.append('ul')
                .selectAll('li')
                    .data(data)
                    .enter().append('li');
                        // .text(function(d){ return d.title; });
            lis.append('span')
                .attr('class', 'text')
                .text(function(d){return d.title});
            lis.append('span')
                .attr('class', 'num')
                .text(function(d){return numberWithCommas(d.pageviews)});
            
        }, console.error.bind(console));
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

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
