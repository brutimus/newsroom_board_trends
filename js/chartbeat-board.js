//@codekit-prepend "../bower_components/d3/d3.js"

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

function chartbeat_board() {
  var api_key = '',
      domain_name = '';

  function my(selection) {

    /* ========== VARIABLES & FUNCTIONS ========== */
    var api_url = 'http://api.chartbeat.com/live/toppages/v3/?apikey={0}&host={1}&limit=50;';


    function draw_pages(data){
        /* ========== SETUP UI ========== */

        var pages = list_container.selectAll('tr')
            .data(data.pages.filter(function(d){
                return d.path.split('/').length > 4
            }), function(d){return d.title});
        
        // REMOVE ELEMENTS
        pages.exit()
            .remove();
        update_numerical_cell(pages, '.concurrent', 'd.stats.people');
        update_percent_cell(
            pages,
            '.desktop',
            'd.stats.platform.d',
            'd.stats.people'
        );
        update_percent_cell(
            pages,
            '.mobile',
            'd.stats.platform.m',
            'd.stats.people'
        );
        update_numerical_cell(pages, '.social', 'd.stats.social');
        update_time_cell(pages, '.engaged', 'd.stats.engaged_time.avg');

        var new_pages = pages.enter().append('tr');
        add_numerical_cell(new_pages, 'concurrent', 'd.stats.people');
        new_pages.append('td')
            .attr('class', 'title')
            .text(function(d){return d.title.split('|')[0]});
        add_percent_cell(
            new_pages,
            'desktop',
            'd.stats.platform.d',
            'd.stats.people'
        );
        add_percent_cell(
            new_pages,
            'mobile',
            'd.stats.platform.m',
            'd.stats.people'
        );
        add_numerical_cell(new_pages, 'social', 'd.stats.social');
        add_numerical_cell(new_pages, 'search', 'd.stats.search');
        add_time_cell(new_pages, 'engaged', 'd.stats.engaged_time.avg');
        var updates = new_pages.merge(pages);
        updates.style('transform', function(d, i){
            return 'translateY(' + ((60 * i) + 40) + 'px)'
        });
        
    }
    function add_numerical_cell(selection, c, path){
        selection.append('td')
            .attr('class', c)
            .text(function(d){return eval(path)});
    }
    function add_percent_cell(selection, c, path_num,  path_denom){
        selection.append('td')
            .attr('class', c)
            .text(function(d){
                return Math.round((eval(path_num) / eval(path_denom)) * 100) + '%'});
    }
    function add_time_cell(selection, c, path){
        selection.append('td')
            .attr('class', c)
            .text(function(d){
                var time = eval(path);
                return Math.floor(time/60) + ':' + ('00' + Math.round(time%60)).slice(-2)
            });
    }
    function update_numerical_cell(selection, c, path){
        selection.select(c)
            .transition().duration(1000)
            .tween('text', function(d){
                var i = d3.interpolate(this.textContent, eval(path)),
                    self = this;
                return function(t){
                    self.textContent = Math.round(i(t));
                }
            });
    }
    function update_percent_cell(selection, c, path_num, path_denom){
        selection.select(c)
            .transition().duration(1000)
            .tween('text', function(d){
                var old = parseInt(this.textContent.split('%')[0]),
                    i = d3.interpolate(
                        old,
                        Math.round((eval(path_num) / eval(path_denom)) * 100)
                    ),
                    self = this;
                return function(t){
                    self.textContent = Math.round(i(t)) + '%';
                }
            });
    }
    function update_time_cell(selection, c, path){
        selection.select(c)
            .transition().duration(1000)
            .tween('text', function(d){
                var time = this.textContent.split(':'),
                    i = d3.interpolate(parseInt(time[0])*60 + parseInt(time[1]), eval(path)),
                    self = this;
                return function(t){
                    self.textContent = Math.floor(i(t)/60) + ':' + ('00' + Math.round(i(t) % 60)).slice(-2);
                }
            });
    }

    function data_ready(error, cb) {
        draw_pages(cb);
    }


    /* ========== SETUP SVG ========== */

    var numbers_container = selection.select('.numbers'),
        list_container = selection.select('.pages tbody'),
        viewport_height = d3.select('body').node().getBoundingClientRect().height;

    /* ============================= */
    /* ========== RUNTIME ========== */
    /* ============================= */

    d3.json(api_url.format(api_key, domain_name), data_ready);
    setInterval(
        d3.json,
        3000,
        api_url.format(api_key, domain_name),
        data_ready
    );


  }

  my.api_key = function(value) {
    if (!arguments.length) return api_key;
    api_key = value;
    return my;
  }
  my.domain_name = function(value) {
    if (!arguments.length) return domain_name;
    domain_name = value;
    return my;
  }

  return my;
}
