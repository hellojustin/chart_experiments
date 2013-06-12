( function( $, R, Eskimo ) {

  $.fn.gauge = function( options ) {



    function drawTrack( canvas, grid, opts ) {
      var gap      = Eskimo.getRadians( ( 360 - opts.track.degrees ) / 2 );
          largeArc = Math.floor( gap / Math.PI ),
          start    = grid.point( 'trackStart', gap ),
          end      = grid.point( 'trackEnd', gap * -1 ),
          p        = [],
          path     = canvas.path();

      p = p.concat( [ "M", start.x, start.y ] );
      p = p.concat( [ "A", grid.radius, grid.radius, 0, 1, 1, end.x, end.y ] ); 

      return path.attr( { 
        'path'         : p,
        'stroke'       : opts.track.color,
        'stroke-width' : opts.track.width
      } );
    }



    function drawData( canvas, grid, opts ) {
      var dataRads = Eskimo.getRadians( opts.data.numerator /
                                        opts.data.denominator * 
                                        opts.track.degrees ),
          largeArc = Math.floor( dataRads / Math.PI ),
          start    = grid.point( 'dataStart', grid.point( 'trackStart' ).t ),
          end      = grid.point( 'dataEnd', start.t + dataRads ),
          p        = [],
          path     = canvas.path();

      p = p.concat( [ "M", start.x, start.y ] );
      p = p.concat( [ "A", grid.radius, grid.radius, 0, largeArc, 1, end.x, end.y ] ); 

      return path.attr( { 
        'path'         : p,
        'stroke'       : opts.data.color,
        'stroke-width' : opts.data.width
      } );
      
    }



    function drawTicks( canvas, opts ) {
      $.each( opts.ticks, function( index, tick )  {
        drawTick( canvas, tick, opts );
      } );
    }


    function drawTick( canvas, tick, opts ) {
      var start      = grid.point( 'trackStart' ),
          tickRads   = Eskimo.getRadians( tick.value / 
                                          opts.data.denominator * 
                                          opts.track.degrees ) + start.t,
          innerPoint = grid.cartesian( tickRads, grid.radius - opts.track.width ),
          outerPoint = grid.cartesian( tickRads, grid.radius + opts.track.width ),
          p          = [],
          path       = canvas.path();

      p = p.concat( [ "M", innerPoint.x, innerPoint.y ] );
      p = p.concat( [ "L", outerPoint.x, outerPoint.y ] );

      return path.attr( {
        'path'   : p,
        'stroke' : '#FFFFFF',
        'stroke-width' : Math.max( opts.dimension * 0.00625, 2 )
      } );
    }



    function drawLabel( element, opts ) {
      var labelHtml    = "<div class='gauge-label'>"+ opts.label.html +"</div>"
          labelElement = $( labelHtml );

      $( element ).css( 'position', 'relative' );
      labelElement.css( {
        'position'   : 'absolute',
        'bottom'     : opts.dimension * 0.17,
        'width'      : '100%',
        'text-align' : 'center',
        'font-size'  : opts.dimension * 0.1 + 'px'
      } );

      labelElement.find( '.gauge-value' ).css( {
        'font-size'      : opts.dimension * 0.45 + 'px',
        'line-height'    : opts.dimension * 0.4 + 'px',
        'letter-spacing' : opts.dimension * -0.05 + 'px'
      } );

      $( element ).append( labelElement )
    }



    var options = $.extend( $.fn.gauge.defaults, options );

    $.each( this, function( index, element ) {
      var canvas     = R( element ),
          center     = { x : canvas.width/2, y : canvas.height/2 },
          trackWidth = Math.min( canvas.width, canvas.height ) * 0.09
          radius     = Math.min( center.x, center.y ) - trackWidth,
          grid       = new Eskimo( center, radius, Eskimo.getRadians( 270 ), -1 );

      options.track.width = trackWidth;
      options.data.width  = trackWidth;
      options.dimension   = Math.min( $( element ).height(), $( element ).width() );

      drawTrack( canvas, grid, options );
      drawData(  canvas, grid, options );
      drawTicks( canvas, options );
      drawLabel( element, options );
    } );

    return this;
  }

  $.fn.gauge.defaults = {
    data    : { 
                numerator   : 80, 
                denominator : 100,
                color       : "#F37321",
                animate     : true
              },
    track   : {
                color       : "#F1E3C5",
                degrees     : 300
              },
    ticks   : [ { label : "60 shirts by Friday", value : 60 },
                { label : "Goal", value : 90 } ],
    label   : { 
                html        : "Day<div class='gauge-value'>30</div>of 14</div>"
              }
  }

}( jQuery, Raphael, Eskimo ) );
