( function( $, LineChart ) {

  $.fn.lineChart = function( options ) {
    var options = $.extend( $.fn.lineChart.defaults, options );
    this.chart = new LineChart( this[0], options );
    return this.chart;
  }

  $.fn.lineChart.defaults = {
    bgColor     : "#ffffff",
    dataColor   : "#f37321",
    gridColor   : "#f5f2f0",
    selectedColor : "rgba( 233, 38, 41, 1 )",
    selectedIndex : 12,
    dataLineWidth : 4,
    gridGap     : 2,
    animationTimeout : 175,
    padding     : { top : 0, right : 0, bottom : 0, left : 0 },
    plotPadding : { top : 10, right : 0, bottom : 10, left : 0 },
    legendHeight : 11,
    legendGap   : 15,
    labels      : [ 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 
                    'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 
                    'S', 'M' ],
    values      : [ 122, 140, 99, 85, 68, 54, 50, 45, 43,  30,  28, 25, 26, 25, 27, 27, 30,
                     36,  31, 25, 24, 32, 38, 47, 61, 84, 102, 111, 90, 61 ],
    metadata    : [ { a :  1 }, { a :  2 }, { a :  3 }, { a :  4 }, { a :  5 }, { a :  6 }, { a :  7 }, { a :  8 }, { a :  9 }, { a : 10 }, { a : 11 }, { a : 12 }, 
                    { a : 13 }, { a : 14 }, { a : 15 }, { a : 16 }, { a : 17 }, { a : 18 }, { a : 19 }, { a : 20 }, { a : 21 }, { a : 22 }, { a : 23 }, { a : 24 },
                    { a : 25 }, { a : 26 }, { a : 27 }, { a : 28 }, { a : 29 }, { a : 30 }  ]
    // data : [ [ 'M',  61 ] ]
  }

}( jQuery, LineChart ) );