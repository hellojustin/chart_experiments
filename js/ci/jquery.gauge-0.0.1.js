( function( $, Gauge ) {

  $.fn.gauge = function( options ) {

    var options = $.extend( $.fn.gauge.defaults, options );

    $.each( this, function( index, element ) {
      var gauge = new Gauge( element, options );
    } );

  }

  $.fn.gauge.defaults = {
    animation      : 2000,
    startNumerator : 0, 
    numerator      : 30,
    denominator    : 50,
    dataColor      : "#f37321",
    trackColor     : "#f5f2f0",
    bgColor        : "#ffffff",
    degrees        : 359.99999,
    ticks          : [ { label : "Print", value : 10 },
                       { label : "Goal",  value : 50 } ],
    scale          : {
                       dataTip : {
                         size               : 0.4
                       },
                       label : {
                         valueFontSize      : 0.45,
                         valueLineHeight    : 0.45,
                         valueLetterSpacing : 0,
                         defaultFontSize    : 0.1,
                         defaultBottom      : 0.2
                       },
                       ticks : {
                         strokeWidth        : 0.00625,
                         minStrokeWidth     : 2
                       },
                       track : {
                         width              : 0.09
                       }
                     }
  }

}( jQuery, Gauge ) );