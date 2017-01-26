//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "chartbeat-board.js"

$(document).ready(function () {

    GA_CLIENT_ID = getUrlParameter('ga_client_id');
    SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];
    GA_VIEW_ID = getUrlParameter('ga_view_id');

    document.getElementsByName('google-signin-client_id')[0].setAttribute(
        'content', GA_CLIENT_ID);


    // CHARTBEAT ===============================================================

    var CB_API_KEY = getUrlParameter('api_key'),
        CB_DOMAIN = getUrlParameter('domain'),
        CB_TRAFFIC_SERIES_URL = 'http://api.chartbeat.com/historical/traffic/series/?apikey={0}&host={1}&start={2}&end={3}&frequency={4}&fields=people,social';
    
    var svg = d3.select(".past-seven-days"),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    var x = d3.scaleTime().rangeRound([0, width]),
        y = d3.scaleLinear().rangeRound([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10),
        stack = d3.stack(),
        keys = ['social', 'people'];
    
    var area = d3.area()
        .x(function(d) { return x(d.data.time); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); });
    


    d3.json(CB_TRAFFIC_SERIES_URL.format(
        CB_API_KEY,
        CB_DOMAIN,
        '2017-01-18%2003:00:00',
        '2017-01-25%2002:59:59',
        60), function(error, response) {
        if (error) throw error;
        var start_time = +response['data']['start'],
            end_time = +response['data']['end'],
            frequency = +response['data']['frequency'],
            data = response['data']['spokesman.com']['series']['people'].map(function(d, i){
                return {
                    'time': new Date((start_time + (60 * 60 * i)) * 1000),
                    'people': +d,
                    'social': +response['data']['spokesman.com']['series']['social'][i]}
            });
        // console.log(data);

        x.domain(d3.extent(data, function(d) { return d.time; }));
        y.domain([0, d3.max(data, function(d) { return d['people']; })]);
        z.domain(keys);
        stack.keys(keys);
        console.log(stack(data))
        // area.y0(y(0));

        // g.append("path")
        //     .datum(data)
        //     .attr("fill", "steelblue")
        //     .attr("d", area);
    
        var layer = g.selectAll('.layer')
            .data(stack(data))
            .enter().append('g')
                .attr('class', 'layer');
        
        layer.append('path')
            .attr('class', 'area')
            .style('fill', function(d){ return z(d.key); })
            .attr('d', area);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#FFF")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Concurrents");
        });
    });

    // GOOGLE ANALYTICS ========================================================


// });

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