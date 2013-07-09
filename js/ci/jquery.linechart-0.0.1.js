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
    data        : [ [ 'S', 122 ],
                    [ 'M', 140 ],
                    [ 'T',  99 ],
                    [ 'W',  85 ],
                    [ 'T',  68 ],
                    [ 'F',  54 ],
                    [ 'S',  50 ],
                    [ 'S',  45 ],
                    [ 'M',  43 ],
                    [ 'T',  30 ],
                    [ 'W',  28 ],
                    [ 'T',  25 ],
                    [ 'F',  26 ],
                    [ 'S',  25 ],
                    [ 'S',  27 ],
                    [ 'M',  27 ],
                    [ 'T',  30 ],
                    [ 'W',  36 ],
                    [ 'T',  31 ],
                    [ 'F',  25 ],
                    [ 'S',  24 ],
                    [ 'S',  32 ],
                    [ 'M',  38 ],
                    [ 'T',  47 ],
                    [ 'W',  61 ],
                    [ 'T',  84 ],
                    [ 'F', 102 ],
                    [ 'S', 111 ],
                    [ 'S',  90 ],
                    [ 'M',  61 ] ],
    // data : [ [ 'M',  61 ] ]
  }

}( jQuery, LineChart ) );