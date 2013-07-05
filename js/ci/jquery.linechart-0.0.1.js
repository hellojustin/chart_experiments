( function( $, LineChart ) {

  $.fn.lineChart = function( options ) {

    var options = $.extend( $.fn.lineChart.defaults, options );

    $.each( this, function( index, element ) {
      var lineChart = new LineChart( element, options );
    } );

  }

  $.fn.lineChart.defaults = {
    bgColor     : "#ffffff",
    dataColor   : "#f37321",
    gridColor   : "#f5f2f0",
    gridGap     : 5,
    padding     : { top : 0, right : 0, bottom : 0, left : 0 },
    plotPadding : { top : 10, right : 0, bottom : 10, left : 0 },
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
                    [ 'M',  61 ] ]    
  }

}( jQuery, LineChart ) );