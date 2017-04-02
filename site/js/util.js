// From twitter
// For old browsers that does not support console.log()[...]
(function() {
	var method;
	var noop = function () {};
	var methods = [
	'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
	'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
	'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
	'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

function Util() {
	this.queries = function () {
		// From http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	        // If first entry with this name
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = decodeURIComponent(pair[1]);
	        // If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
	      query_string[pair[0]] = arr;
	        // If third or later entry with this name
	    } else {
	      query_string[pair[0]].push(decodeURIComponent(pair[1]));
	    }
	  }
	    return query_string;
	}();
	// console.log(this.queries);
}
Util.prototype.getParam = function(key, fallback) {
	if(this.queries.hasOwnProperty(key)) {
		return this.queries[key];
	}
	return fallback;
}
Util.prototype.season_attr = " Season";
Util.prototype.season2year = function(d) {
  var first_year = +d[Util.prototype.season_attr].substring(0,2);
	// console.log("first year " + first_year);
  return first_year < 20? (2000 + first_year) : (1900 + first_year);
}
