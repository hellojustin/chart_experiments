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
    this.canvas.customAttributes.tip    = this.tipDefinition( this.grid, opts );
    this.canvas.customAttributes.tipGap = this.tipGapDefinition( this.grid, opts );
        
    var num              = opts.numerator,
        startNum         = opts.startNumerator,
        denom            = opts.denominator,
        degrees          = opts.degrees,
        animationCycles  = Math.floor( (num - startNum) / denom ),
        animationCycles  = animationCycles + ( (num % denom) < (startNum % denom) ) ? 1 : 0,
        cycleTime        = opts.animation / ( num / denom ),
        lastCyclePct     = ( num % denom ) / denom,
        lastCycleTime    = ( num > denom ) ? lastCyclePct * cycleTime : opts.animation,
        animationTimeout = ( num > denom ) ? cycleTime : opts.animation,
        trackPathInit    = this.drawTrack( opts.degrees ),
        trackPath        = this.canvas.path().attr( { 
          'arc'          : trackPathInit,
          'stroke'       : opts.trackColor,
          'stroke-width' : opts.trackWidth
        } ),

        dataPathInit     = this.drawData( Math.min( startNum, denom ), denom, degrees ),
        dataPathFinal    = this.drawData( Math.min( num, denom ), denom, degrees ),
        dataPath         = this.canvas.path().attr( {
          'arc'          : dataPathInit,
          'stroke'       : opts.dataColor,
          'stroke-width' : opts.dataWidth
        } ),
        dataAnim         = R.animation( { 
          'arc'          : dataPathFinal
        }, animationTimeout ),

        dataTipInit      = this.drawTip( Math.min( startNum, denom ), denom, degrees, opts.dataWidth ),
        dataTipFinal     = this.drawTip( Math.min( num, denom ), denom, degrees, opts.dataWidth ),
        dataTip          = this.canvas.path().attr( {
          'tip'          : dataTipInit,
          'fill'         : opts.dataColor,
          'stroke'       : opts.dataColor,
          'stroke-width' : 1
        } ),
        dataTipAnim      = R.animation( {
          'tip'          : dataTipFinal
        }, animationTimeout ),

        dataTipGapInit   = this.drawTip( startNum, denom, degrees, opts.dataWidth ),
        dataTipGapReset  = this.drawTip( 0, denom, degrees, opts.dataWidth ),
        dataTipGapInterim= this.drawTip( denom, denom, degrees, opts.dataWidth ),
        dataTipGapFinal  = this.drawTip( num % denom, denom, degrees, opts.dataWidth ),
        dataTipGap       = this.canvas.path().attr( {
          'tipGap'       : dataTipGapInit,
          'stroke'       : opts.bgColor,
          'stroke-width' : Math.max( opts.dimension * opts.scale.ticks.strokeWidth, 
                                     opts.scale.ticks.minStrokeWidth )
        } ),
        dataTipGapAnimFin= R.animation( {
          'tipGap'       : dataTipGapFinal
        }, lastCycleTime ),
        dataTipGapAnim   = R.animation( {
          'tipGap'       : dataTipGapInterim
        }, animationTimeout, function() {

          animationCycles -= 1;
          if ( animationCycles > 0 ) {
            dataTipGap.attr( { 'tipGap' : dataTipGapReset } );
            dataTipGap.animate( dataTipGapAnim );
          } else if ( animationCycles == 0 ) {
            dataTipGap.attr( { 'tipGap' : dataTipGapReset } );
            dataTipGap.animate( dataTipGapAnimFin );
          }

        } );

    dataPath.animate( dataAnim );
    dataTip.animate( dataTipAnim );
    this.drawLabel( opts );
    
    if ( animationCycles > 0 ) { dataTipGap.animate( dataTipGapAnim ) }
    else                       { dataTipGap.animate( dataTipGapAnimFin ) }
  }

  Gauge.prototype.drawTrack = function( degrees ) {
    var gap   = Eskimo.getRadians( ( 360 - degrees ) / 2 ),
        start = this.grid.point( 'trackStart', gap ),
        end   = this.grid.point( 'trackEnd',   gap * -1 );

    return [ start.t, end.t ];
  }

  Gauge.prototype.drawData = function( numerator, denominator, totalDegrees ) {
    var num      = numerator,
        denom    = denominator,
        dataRads = Eskimo.getRadians( num / denom * totalDegrees ),
        start    = this.grid.point( 'dataStart', this.grid.point( 'trackStart' ).t ),
        end      = this.grid.point( 'dataEnd', start.t + dataRads );

    return [ start.t, end.t ];
  }

  Gauge.prototype.drawTip = function( numerator, denominator, totalDegrees, dataWidth ) {
    var num     = numerator,
        denom   = denominator,
        start   = this.grid.point( 'trackStart' ),
        tipRads = Eskimo.getRadians( num / denom * totalDegrees ) + start.t,
        tipRads = tipRads % ( Math.PI*2 );

    return [ tipRads, dataWidth ];
  }

  Gauge.prototype.drawLabel = function( opts ) {
    function updateValue( value, valueEl, initialFontSize, timeout ) {
      var el      = $( valueEl ),
          nextVal = parseInt( el.html() ) + 1,
          charAdj = Math.min( 1, 2 / nextVal.toString().length );
      
      if ( nextVal <= value ) {
        el.css( { 'font-size' : initialFontSize * charAdj + 'px' } );
        el.html( nextVal );
        setTimeout( function() { updateValue( value, valueEl, initialFontSize, timeout ) }, timeout );
      }
    }

    var labelHtml    = "<div class='gauge-label'><div class='gauge-value'>" + opts.startNumerator + "</div>of " + opts.denominator + "</div></div>"
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
      'line-height'    : opts.dimension * scale.valueLineHeight    + 'px',
      'letter-spacing' : opts.dimension * scale.valueLetterSpacing + 'px'
    } );

    $( this.element ).append( labelElement )
    updateValue( opts.numerator, 
                 labelElement.find( '.gauge-value' ), 
                 opts.dimension * scale.valueFontSize, 
                 opts.animation / opts.numerator );
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
