( function( $, R, Eskimo ) {

  function Gauge( element, opts ) {

    this.element    = element;
    this.canvas     = R( this.element );

    opts.dimension  = Math.min( this.canvas.width, this.canvas.height );
    opts.trackWidth = opts.dimension * opts.scale.track.width;
    opts.dataWidth  = opts.trackWidth;

    this.center     = { x : this.canvas.width/2, y : this.canvas.height/2 };
    this.radius     = Math.min( this.center.x, this.center.y ) - opts.trackWidth;
    this.grid       = new Eskimo( this.center, this.radius, Eskimo.getRadians( 270 ), -1 );

    this.canvas.customAttributes.arc    = this.arcDefinition( this.grid );
    this.canvas.customAttributes.tick   = this.tickDefinition( this.grid );
    this.canvas.customAttributes.tip    = this.tipDefinition( this.grid, opts );
    this.canvas.customAttributes.tipGap = this.tipGapDefinition( this.grid, opts );
        
    var animTimeout = ( opts.numerator > opts.denominator ) ? opts.animation/2 : opts.animation,
        trackPath   = this.canvas.path().attr( { 
          'arc'          : this.drawTrack( opts.degrees ),
          'stroke'       : opts.trackColor,
          'stroke-width' : opts.trackWidth
        } ),

        dataPath      = this.canvas.path().attr( {
          'arc'          : this.drawData( opts.startNumerator, 
                                          opts.denominator, 
                                          opts.degrees ),
          'stroke'       : opts.dataColor,
          'stroke-width' : opts.dataWidth
        } ),

        dataTip       = this.canvas.path().attr( {
          'tip'          : this.drawTip( opts.startNumerator,
                                         opts.denominator,
                                         opts.degrees,
                                         opts.dataWidth ),
          'fill'         : opts.dataColor,
          'stroke'       : opts.dataColor,
          'stroke-width' : 1
        } ),

        dataTipGap    = this.canvas.path().attr( {
          'tipGap'       : this.drawTip( opts.startNumerator,
                                         opts.denominator,
                                         opts.degrees,
                                         opts.dataWidth ),
          'stroke'       : opts.bgColor,
          'stroke-width' : Math.max( opts.dimension * opts.scale.ticks.strokeWidth, 
                                     opts.scale.ticks.minStrokeWidth )
        } ),

        tickPath      = this.canvas.path().attr( {
          'tick'         : this.drawTick( opts.ticks[1].value, 
                                          opts.denominator, 
                                          opts.degrees, 
                                          opts.trackWidth ),
          'stroke'       : opts.bgColor,
          'stroke-width' : Math.max( opts.dimension * opts.scale.ticks.strokeWidth, 
                                     opts.scale.ticks.minStrokeWidth )
        } ),

        tickAnim      = R.animation( {
          'tick'         : this.drawTick( opts.ticks[1].value, 
                                          Math.max( opts.numerator, opts.denominator ), 
                                          opts.degrees, 
                                          opts.trackWidth )
        }, animTimeout, '>' ),

        dataAnim      = R.animation( { 
          'arc'          : this.drawData( opts.numerator, 
                                          opts.denominator, 
                                          opts.degrees )
        }, animTimeout, function() { tickPath.animate( tickAnim ) } ),

        dataTipAnim   = R.animation( {
          'tip'          : this.drawTip( opts.numerator,
                                         opts.denominator,
                                         opts.degrees,
                                         opts.dataWidth )
        }, animTimeout ),

        dataTipGapAnim = R.animation( {
          'tipGap'       : this.drawTip( opts.numerator,
                                         opts.denominator,
                                         opts.degrees,
                                         opts.dataWidth )
        }, animTimeout );

    dataPath.animate( dataAnim );
    dataTip.animate( dataTipAnim );
    dataTipGap.animate( dataTipGapAnim );
    this.drawLabel( opts );

  }

  Gauge.prototype.drawTrack = function( degrees ) {
    var gap   = Eskimo.getRadians( ( 360 - degrees ) / 2 ),
        start = this.grid.point( 'trackStart', gap ),
        end   = this.grid.point( 'trackEnd',   gap * -1 );

    return [ start.t, end.t ];
  }

  Gauge.prototype.drawData = function( numerator, denominator, totalDegrees ) {
    var num      = Math.min( numerator, denominator ),
        denom    = denominator,
        dataRads = Eskimo.getRadians( num / denom * totalDegrees ),
        start    = this.grid.point( 'dataStart', this.grid.point( 'trackStart' ).t ),
        end      = this.grid.point( 'dataEnd', start.t + dataRads );

    return [ start.t, end.t ];
  }

  Gauge.prototype.drawTip = function( numerator, denominator, totalDegrees, dataWidth ) {
    var num     = Math.min( numerator, denominator ),
        denom   = denominator,
        tipRads = Eskimo.getRadians( num / denom * totalDegrees );

    return [ tipRads, dataWidth ];
  }

  Gauge.prototype.drawTick = function( tickValue, trackValue, totalDegrees, length ) {
    var start    = this.grid.point( 'trackStart' ),
        tickRads = Eskimo.getRadians( tickValue / trackValue * 
                                      totalDegrees ) + start.t;

    return [ tickRads, length ];
  }

  Gauge.prototype.drawLabel = function( opts ) {
    function updateValue( value, valueEl, timeout ) {
      var el         = $( valueEl ),
          currentVal = parseInt( el.html() );

      if ( currentVal < value ) {
        el.html( currentVal + 1 );
        setTimeout( function() { updateValue( value, valueEl, timeout ) }, timeout );
      }
    }

    var labelHtml    = "<div class='gauge-label'><div class='gauge-value'>0</div>of " + opts.denominator + "</div></div>"
        labelElement = $( labelHtml ),
        scale        = opts.scale.label;

    $( this.element ).css( 'position', 'relative' );
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

    $( this.element ).append( labelElement )
    updateValue( opts.numerator, labelElement.find( '.gauge-value' ), opts.animation / opts.numerator );
  }

  /* 
   * Define functions that will become custom Raphael path attributes that 
   * allow us to define and animate elements of the graph easily.
   */

  Gauge.prototype.arcDefinition = function( grid ) {
    return function( startT, endT ) {
      var arcFlag = Math.abs( Math.floor( ( endT - startT ) / Math.PI ) ),
          start   = grid.cartesian( startT ),
          end     = grid.cartesian( endT ),
          p       = [];

      p = p.concat( [ "M", start.x, start.y ] );
      p = p.concat( [ "A", grid.radius, grid.radius, 0, arcFlag, 1, end.x, end.y ] ); 

      return { path : p };
    }
  }

  Gauge.prototype.tickDefinition = function( grid ) {
    return function( theta, length ) {
      var innerPoint = grid.cartesian( theta, grid.radius - length/2 ),
          outerPoint = grid.cartesian( theta, grid.radius + length/2 ),
          p          = [],

      p = p.concat( [ "M", innerPoint.x, innerPoint.y ] );
      p = p.concat( [ "L", outerPoint.x, outerPoint.y ] );

      return { path : p };
    }
  }

  Gauge.prototype.tipDefinition = function( grid, opts ) {
    return function( theta, dataWidth ) {
      var dataWidth  = dataWidth - 2,
          circumf    = ( 2 * Math.PI * grid.radius )
          tipSize    = ( dataWidth / circumf ) * ( 2 * Math.PI ) * opts.scale.dataTip.size,
          innerPoint = grid.cartesian( theta, grid.radius - dataWidth/2 ),
          outerPoint = grid.cartesian( theta, grid.radius + dataWidth/2 ),
          tipPoint   = grid.cartesian( theta + tipSize ),
          p          = [],

      p = p.concat( [ "M", innerPoint.x, innerPoint.y ] );
      p = p.concat( [ "L", outerPoint.x, outerPoint.y ] );
      p = p.concat( [ "L", tipPoint.x,   tipPoint.y ] );
      p = p.concat( [ "Z" ] );

      return { path : p };
    }
  }

  Gauge.prototype.tipGapDefinition = function( grid, opts ) {
    return function( theta, dataWidth ) {
      var dataWidth  = dataWidth + 3,
          circumf    = ( 2 * Math.PI * grid.radius )
          tipSize    = ( dataWidth / circumf ) * ( 2 * Math.PI ) * opts.scale.dataTip.size,
          innerPoint = grid.cartesian( theta, grid.radius - dataWidth/2 ),
          outerPoint = grid.cartesian( theta, grid.radius + dataWidth/2 ),
          tipPoint   = grid.cartesian( theta + tipSize ),
          p          = [],

      p = p.concat( [ "M", outerPoint.x, outerPoint.y ] );
      p = p.concat( [ "L", tipPoint.x,   tipPoint.y ] );
      p = p.concat( [ "L", innerPoint.x, innerPoint.y ] );

      return { path : p };
    }
  }
   
  window.Gauge = Gauge;

  return Gauge; 

}( jQuery, Raphael, Eskimo ) );
