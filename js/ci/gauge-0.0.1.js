( function( $, R, Eskimo ) {

  function Gauge( element, opts ) {

    this.element   = element;
    this.canvas    = R( this.element );
    this.opts      = $.extend( opts, this.supplementalOpts( this.canvas, opts ) );
    this.center    = { x : this.canvas.width/2, y : this.canvas.height/2 };
    this.radius    = Math.min( this.center.x, this.center.y ) - opts.trackWidth;
    this.grid      = new Eskimo( this.center, this.radius, Eskimo.getRadians( 270 ), -1 );
    this.num       = this.opts.numerator;
    this.startNum  = ( this.opts.animate === 'never' ) ? this.num : this.opts.startNumerator;
    this.denom     = this.opts.denominator;
    this.degrees   = this.opts.degrees;

    this.canvas.customAttributes.arc    = this.arcDefinition( this.grid );
    this.canvas.customAttributes.tip    = this.tipDefinition( this.grid, opts );
    this.canvas.customAttributes.tipGap = this.tipGapDefinition( this.grid, opts );
    
    this.trackPath = this.drawTrack();
    this.dataPath  = this.drawData();
    this.dataTip   = this.drawDataTip();
    this.drawLabel();

    if ( this.opts.animate === 'now' ) { this.animate(); }
  }

  Gauge.prototype.animate = function() {
    eve( 'ci:gauge:animate', this, this.num );
  }

  Gauge.prototype.drawTrack = function() {
    return this.canvas.path().attr( { 
      'arc'          : this.trackArc( this.opts.degrees ),
      'stroke'       : this.opts.trackColor,
      'stroke-width' : this.opts.trackWidth
    } )
  }

  Gauge.prototype.trackArc = function( degrees ) {
    var gap   = Eskimo.getRadians( ( 360 - degrees ) / 2 ),
        start = this.grid.point( 'trackStart', gap ),
        end   = this.grid.point( 'trackEnd',   gap * -1 );

    return [ start.t, end.t ];
  }

  Gauge.prototype.drawData = function() {
    var opts = this.opts,
        data = null;

    data = this.canvas.path().attr( {
      'arc'          : this.dataArc( Math.min( this.startNum, this.denom ), this.denom, this.degrees ),
      'stroke'       : this.opts.dataColor,
      'stroke-width' : this.opts.dataWidth
    } );
    eve.on( 'ci:gauge:animate', function( numerator ) {
      var stopNumerator      = Math.min( numerator, this.denom ),
          stopNumetatorDelta = stopNumerator - this.startNum,
          fullNumeratorDelta = numerator - this.startNum,
          timeout            = stopNumetatorDelta * this.opts.animation / fullNumeratorDelta;
      data.animate( {
        'arc' : this.dataArc( stopNumerator, this.denom, this.degrees )
      }, timeout );
    } );

    return data;
  }

  Gauge.prototype.dataArc = function( numerator, denominator, totalDegrees ) {
    var num      = numerator,
        denom    = denominator,
        dataRads = Eskimo.getRadians( num / denom * totalDegrees ),
        start    = this.grid.point( 'dataStart', this.grid.point( 'trackStart' ).t ),
        end      = this.grid.point( 'dataEnd', start.t + dataRads );

    return [ start.t, end.t ];
  }

  Gauge.prototype.drawDataTip = function() {
    var tipSet = this.canvas.set(),
        tip    = null,
        tipGap = null,
        pos    = this.dataTipPos( this.startNum, this.denom, this.degrees, this.opts.dataWidth );

    tip = this.canvas.path().attr( {
      'tip'          : pos,
      'fill'         : this.opts.dataColor,
      'stroke'       : this.opts.dataColor,
      'stroke-width' : 1
    } );
    tipSet.push( tip );

    tipGap = this.canvas.path().attr( {
      'tipGap'       : pos,
      'stroke'       : this.opts.bgColor,
      'stroke-width' : Math.max( this.opts.dimension * this.opts.scale.ticks.strokeWidth, 
                                 this.opts.scale.ticks.minStrokeWidth )
    } );
    tipSet.push( tipGap );

    eve.on( 'ci:gauge:animate', function( numerator ) {
      var destinationDegrees = ( numerator - this.startNum ) * this.degrees / this.denom;
      tipSet.animate( {
        'transform' : ['r', destinationDegrees, this.center.x, this.center.y]
      }, this.opts.animation );
    } );

    return tipSet;
  }

  Gauge.prototype.dataTipPos = function( numerator, denominator, totalDegrees, dataWidth ) {
    var num     = numerator,
        denom   = denominator,
        start   = this.grid.point( 'trackStart' ),
        tipRads = Eskimo.getRadians( num / denom * totalDegrees ) + start.t,
        tipRads = tipRads % ( Math.PI*2 );

    return [ tipRads, dataWidth ];
  }

  Gauge.prototype.drawLabel = function() {
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

    var opts         = this.opts;
        labelHtml    = "<div class='gauge-label'><div class='gauge-value'>" + this.startNum + "</div>of " + opts.denominator + "</br>sold</div></div>"
        labelElement = $( labelHtml ),
        scale        = opts.scale.label,
        valueFontSize= opts.dimension * scale.valueFontSize,
        charAdj      = Math.min( 1, 2 / this.num.toString().length );

    $( this.element ).css( 'position', 'relative' );
    labelElement.css( {
      'position'       : 'absolute',
      'bottom'         : opts.dimension * scale.defaultBottom      + 'px',
      'width'          : '100%',
      'text-align'     : 'center',
      'font-size'      : opts.dimension * scale.defaultFontSize    + 'px',
      'line-height'    : opts.dimension * scale.defaultLineHeight  + 'px'
    } );

    labelElement.find( '.gauge-value' ).css( {
      'font-size'      : valueFontSize  * charAdj                  + 'px',
      'line-height'    : opts.dimension * scale.valueLineHeight    + 'px',
      'letter-spacing' : opts.dimension * scale.valueLetterSpacing + 'px'
    } );

    $( this.element ).append( labelElement )

    eve.on( 'ci:gauge:animate', function( numerator ) {
      updateValue( numerator, 
                   labelElement.find( '.gauge-value' ), 
                   valueFontSize, 
                   this.opts.animation / numerator );
    } );
  }

  Gauge.prototype.supplementalOpts = function( canvas, opts ) {
    var dimension  = Math.min( canvas.width, canvas.height ),
        trackWidth = dimension * opts.scale.track.width;

    return {
      dimension  : dimension,
      trackWidth : trackWidth,
      dataWidth  : trackWidth
    }
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
