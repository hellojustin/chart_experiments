( function( $, R, Eskimo ) {

  $.fn.gauge = function( options ) {

    function drawTrack( degrees, grid ) {
      var gap   = Eskimo.getRadians( ( 360 - degrees ) / 2 ),
          start = grid.point( 'trackStart', gap ),
          end   = grid.point( 'trackEnd',   gap * -1 );

      return [ start.t, end.t ];
    }

    function drawData( numerator, denominator, totalDegrees, grid ) {
      var num      = Math.min( numerator, denominator ),
          denom    = denominator,
          dataRads = Eskimo.getRadians( num / denom * totalDegrees ),
          start    = grid.point( 'dataStart', grid.point( 'trackStart' ).t ),
          end      = grid.point( 'dataEnd', start.t + dataRads );

      return [ start.t, end.t ];
    }

    function drawTicks( canvas, grid, opts ) {
      $.each( opts.ticks, function( index, tick )  {
        var path = canvas.path();
        drawTick( path, grid, tick, opts );
      } );
    }

    function drawTick( tickValue, trackValue, totalDegrees, length, grid ) {
      var start    = grid.point( 'trackStart' ),
          tickRads = Eskimo.getRadians( tickValue / trackValue * 
                                        totalDegrees ) + start.t;

      return [ tickRads, length ];
    }

    function drawLabel( element, opts ) {
      function updateValue( value, valueEl, timeout ) {
        var el         = $( valueEl ),
            currentVal = parseInt( el.html() );

        if ( currentVal < value ) {
          el.html( currentVal + 1 );
          setTimeout( function() { updateValue( value, valueEl, timeout ) }, timeout );
        }
      }

      var labelHtml    = "<div class='gauge-label'><div class='gauge-value'>0</div>of " + opts.data.denominator + "</div></div>"
          labelElement = $( labelHtml ),
          scale        = opts.scale.label;

      $( element ).css( 'position', 'relative' );
      labelElement.css( {
        'position'       : 'absolute',
        'bottom'         : opts.dimension * scale.defaultBottom      + 'px',
        'width'          : '100%',
        'text-align'     : 'center',
        'font-size'      : opts.dimension * scale.defaultFontSize    + 'px'
      } );

      labelElement.find( '.gauge-value' ).css( {
        'font-size'      : opts.dimension * scale.valueFontSize      + 'px',
        'line-height'    : opts.dimension * scale.valueLineHeight    + 'px',
        'letter-spacing' : opts.dimension * scale.valueLetterSpacing + 'px'
      } );

      $( element ).append( labelElement )
      updateValue( opts.data.numerator, labelElement.find( '.gauge-value' ), opts.animation / opts.data.numerator );
    }

    var options = $.extend( $.fn.gauge.defaults, options );

    $.each( this, function( index, element ) {
      var canvas     = R( element );
      
      canvas.customAttributes.arc = function( startT, endT ) {
        var arcFlag = Math.abs( Math.floor( ( endT - startT ) / Math.PI ) ),
            start   = grid.cartesian( startT ),
            end     = grid.cartesian( endT ),
            p       = [];

        p = p.concat( [ "M", start.x, start.y ] );
        p = p.concat( [ "A", grid.radius, grid.radius, 0, arcFlag, 1, end.x, end.y ] ); 

        return { path : p };
      }

      canvas.customAttributes.tick = function( theta, length ) {
        var innerPoint = grid.cartesian( theta, grid.radius - length/2 ),
            outerPoint = grid.cartesian( theta, grid.radius + length/2 ),
            p          = [],

        p = p.concat( [ "M", innerPoint.x, innerPoint.y ] );
        p = p.concat( [ "L", outerPoint.x, outerPoint.y ] );

        return { path : p };
      }







      var trackWidth = Math.min( canvas.width, canvas.height ) 
                     * options.scale.track.width;
      options.track.width = trackWidth;
      options.data.width  = trackWidth;
      options.dimension   = Math.min( $( element ).height(), $( element ).width() );



      var center     = { x : canvas.width/2, y : canvas.height/2 },
          radius     = Math.min( center.x, center.y ) - trackWidth,
          grid       = new Eskimo( center, radius, Eskimo.getRadians( 270 ), -1 ),
          trackPath  = canvas.path().attr( { 
            'arc'          : drawTrack( options.track.degrees, grid ),
            'stroke'       : options.track.color,
            'stroke-width' : options.track.width
          } ),
          dataPath   = canvas.path().attr( {
            'arc'          : drawData( 0, options.data.denominator, options.track.degrees, grid ),
            'stroke'       : options.data.color,
            'stroke-width' : options.data.width
          } ),
          tickPath   = canvas.path().attr( {
            'tick'         : drawTick( options.ticks[1].value, options.data.denominator, options.track.degrees, options.track.width, grid ),
            'stroke'       : '#FFFFFF',
            'stroke-width' : Math.max( options.dimension * options.scale.ticks.strokeWidth, 
                                       options.scale.ticks.minStrokeWidth )
          } ),
          tickAnim   = R.animation( {
            'tick' : drawTick( options.ticks[1].value, Math.max( options.data.numerator, options.data.denominator ), options.track.degrees, options.track.width, grid )
          }, options.animation/2, '>' ),
          dataAnim   = R.animation( { 
            'arc' : drawData( options.data.numerator, options.data.denominator, options.track.degrees, grid )
          }, options.animation/2, function() { tickPath.animate( tickAnim ) } );

      

      

      dataPath.animate( dataAnim );
      

      drawLabel( element, options );
    } );

    return this;
  }

  $.fn.gauge.defaults = {
    animation : 1000,
    data    : { 
                numerator   : 80, 
                denominator : 50,
                color       : "#F37321",
              },
    label   : { 
                html        : "<div class='gauge-value'>180</div>of 14</div>"
              },
    ticks   : [ { label : "Print", value : 10 },
                { label : "Goal",  value : 50 } ],
    track   : {
                color       : "#F1E3C5",
                degrees     : 300
              },
    scale   : {
                label : {
                  valueFontSize      : 0.45,
                  valueLineHeight    : 0.58,
                  valueLetterSpacing : 0,
                  defaultFontSize    : 0.1,
                  defaultBottom      : 0.1
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

}( jQuery, Raphael, Eskimo ) );
