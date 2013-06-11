( function( $, R ) {

  $.fn.gauge = function( options ) {

    function degreesToRadians( degrees ) {
      return degrees * Math.PI/180;
    }

    function calculateCircleInfo( canvas, opts ) {
      var center   = { x : canvas.width/2, y : canvas.height/2 },
          radius   = Math.min( center.x, center.y ) 
                   - Math.max( opts.padding.horizontal,
                               opts.padding.vertical    ),
          bottom   = { x : center.x, y : center.y + radius },
          labelGap = 360 - opts.track.degrees;

      return { 
        center   : center,
        radius   : radius,
        bottom   : bottom,
        labelGap : labelGap
      }
    }

    function calculateHypotenuse( sideA, sideB ) {
      return Math.sqrt( Math.pow( sideA, 2 ) + Math.pow( sideB, 2 ) );
    }

    function calculateFullAngle( quadrant, sideA, sideB ) {
      var quadrantAngle      = quadrant * Math.PI / 2,
          offsetFromQuadrant = ( quadrant % 2 == 0 ) 
                                 ? Math.atan( sideA / sideB )  //in quadrants 0 & 2, sideA is opposite and sideB is adjacent
                                 : Math.atan( sideB / sideA ); //in quadrants 1 & 3, sideB is opposite and sideA is adjacent

      return quadrantAngle + offsetFromQuadrant;
    }

    function angularOffset( point, offsetAngle, center ) {
      var sideA       = Math.abs( point.x - center.x ), 
          sideB       = Math.abs( point.y - center.y ),
          radius      = calculateHypotenuse( sideA, sideB ),
          quadrant    = ( point.x >= center.x ) 
                          ? ( point.y < center.y ) ? 0 : 1
                          : ( point.y > center.y ) ? 2 : 3,
          startAngle  = calculateFullAngle( quadrant, sideA, sideB ),
          newAngle    = startAngle + offsetAngle,
          newQuadrant = Math.floor( newAngle / (Math.PI/2) ) % 4,
          quadAngle   = newAngle - ( newQuadrant * (Math.PI/2) ),
          xDist       = 0.0,
          yDist       = 0.0;
          
          if ( newQuadrant % 2 == 0 ) {
            xDist = Math.cos( quadAngle ) * radius;
            yDist = Math.sin( quadAngle ) * radius;
          } else {
            xDist = Math.sin( quadAngle ) * radius;
            yDist = Math.cos( quadAngle ) * radius;
          }

          if ( newQuadrant == 2 || newQuadrant == 3 ) { xDist = xDist * -1 }
          if ( newQuadrant == 0 || newQuadrant == 3 ) { yDist = yDist * -1 }

      return { 
        x : center.x + xDist, 
        y : center.y + yDist
      }
    }
    
    function drawTrack( canvas, element, opts ) {
      var circle     = calculateCircleInfo( canvas, opts ),
          startPoint = angularOffset( 
                         circle.bottom, 
                         degreesToRadians( circle.labelGap/2 ), 
                         circle.center ),
          endPoint   = angularOffset( 
                         startPoint, 
                         degreesToRadians( opts.track.degrees ), 
                         circle.center ),
          p          = [],
          path       = canvas.path();

      p = p.concat( [ "M", startPoint.x, startPoint.y ] );
      p = p.concat( [ "A", circle.radius, circle.radius, 0, 1, 1, endPoint.x, endPoint.y ] ); 

      return path.attr( { 
        'path'         : p,
        'stroke'       : opts.track.color,
        'stroke-width' : opts.track.width
      } );
    }

    function drawData( canvas, element, opts ) {
      var circle      = calculateCircleInfo( canvas, opts ),
          dataDegrees = opts.data.numerator 
                      / opts.data.denominator 
                      * opts.track.degrees,
          startPoint  = angularOffset(
                          circle.bottom,
                          degreesToRadians( circle.labelGap/2 ),
                          circle.center ),
          endPoint    = angularOffset(
                          startPoint,
                          degreesToRadians( dataDegrees ),
                          circle.center ),
          p           = [],
          path        = canvas.path();

      p = p.concat( [ "M", startPoint.x, startPoint.y ] );
      p = p.concat( [ "A", circle.radius, circle.radius, 0, 0, 1, endPoint.x, endPoint.y ] ); 

      return path.attr( { 
        'path'         : p,
        'stroke'       : opts.data.color,
        'stroke-width' : opts.data.width
      } );
      
    }

    function drawTicks( canvas, element, opts ) {
    }

    function drawLabel( canvas, element, opts ) {
      var labelElement = $( opts.label.html );
      $( element ).css( 'position', 'relative' );
      labelElement.css( {
        'position'   : 'absolute',
        'top'        : '125px',
        'left'       : '125px',
        'text-align' : 'center'
      } );
      $( element ).append( labelElement )
    }

    var options = $.extend( $.fn.gauge.defaults, options );

    $.each( this, function( index, element ) {
      var canvas = R( element );
      drawTrack( canvas, element, options );
      drawData(  canvas, element, options );
      drawTicks( canvas, element, options );
      drawLabel( canvas, element, options );
    } );

    return this;
  }

  $.fn.gauge.defaults = {
    data    : { 
                numerator   : 33, 
                denominator : 100,
                color       : "#EE3524",
                width       : "30px",
                animate     : true
              },
    track   : {
                color       : "#F1E3C5",
                width       : "30px",
                degrees     : 270
              },
    ticks   : [ { label : "60 shirts by Friday", value : 60 },
                { label : "Goal", value : 100 } ],
    label   : { 
                html        : "<div class='gauge-label'><div class='gauge-value'>3</div><div class='gauge-sub-label'>days to go</div></div>",
              },
    padding : {
                horizontal  : 15,
                vertical    : 15
              }
  }

}( jQuery, Raphael ) );
