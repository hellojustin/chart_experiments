( function( $, Gauge ) {

  $.fn.gauge = function( options ) {
    var options = $.extend( $.fn.gauge.defaults, options );
    return new Gauge( this[0], options );
  }

  $.fn.gauge.defaults = {
    animate        : 'now',
    animation      : 2000,
    startNumerator : 0, 
    numerator      : 30,
    denominator    : 50,
    dataColor      : "#f37321",
    trackColor     : "#f5f2f0",
    bgColor        : "#ffffff",
    degrees        : 359.9999,
    ticks          : [ { label : 'none', value : 0 } ],
    scale          : {
                       dataTip : {
                         size               : 0.4
                       },
                       label : {
                         valueFontSize      : 0.42,
                         valueLineHeight    : 0.41,
                         valueLetterSpacing : 0,
                         defaultLineHeight  : 0.08,
                         defaultFontSize    : 0.08,
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