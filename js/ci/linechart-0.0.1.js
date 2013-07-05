( function( $, R ) {

	function LineChart( element, opts ) {

    this.element  = element;
    this.canvas   = R( this.element );
    this.width    = this.canvas.width;
    this.height   = this.canvas.height;
    this.labels   = this.extract( 'key',   opts.data );
    this.values   = this.extract( 'value', opts.data );
    this.gridInfo = this.computeGridInfo( this.values, opts );
    this.plotInfo = this.computePlotInfo( this.values, this.gridInfo, opts );
    this.grid     = this.drawGrid( this.gridInfo );
    this.grid.attr( { 
      'fill'   : opts.gridColor,
      'stroke' : opts.gridColor
    } );

    this.dataLine = this.canvas.path().attr( {
      'path'   : this.drawDataLine( this.values, this.plotInfo ),
      'stroke' : opts.dataColor,
      'stroke-width' : 2
    } );

    this.dataPoints = this.drawDataPoints( this.values, this.plotInfo );
    this.dataPoints.attr( { 
      'fill'   : opts.dataColor,
      'stroke' : opts.dataColor
    } );
  }

  LineChart.prototype.computeGridInfo = function( values, opts ) {
    var numSpaces   = values.length + 1,
        origin      = { x : opts.padding.left, 
                        y : this.height - opts.padding.bottom },
        topRight    = { x : this.width - opts.padding.right,
                        y : opts.padding.top }
        spaceWidth  = ( topRight.x - origin.x ) / numSpaces - opts.gridGap,
        spaceHeight = ( origin.y - topRight.y );

    return {
      gap         : opts.gridGap,
      origin      : origin,
      topRight    : topRight,
      numSpaces   : numSpaces,
      spaceWidth  : spaceWidth,
      spaceHeight : spaceHeight
    }
  }

  LineChart.prototype.computePlotInfo = function( values, gridInfo, opts ) {
    var max      = this.arrayMax( values ),
        min      = 0,
        range    = max - min,
        origin   = { x : gridInfo.origin.x + (gridInfo.spaceWidth + gridInfo.gap),
                     y : gridInfo.origin.y - opts.plotPadding.bottom },
        topRight = { x : gridInfo.topRight.x - (gridInfo.spaceWidth + gridInfo.gap), 
                     y : gridInfo.topRight.y + opts.plotPadding.top },
        scale    = { x : ( topRight.x - origin.x ) / (values.length-1),
                     y : ( origin.y - topRight.y ) / range };

    return {
      max      : max,
      min      : min,
      range    : range,
      origin   : origin,
      topRight : topRight,
      scale    : scale
    }
  }

  LineChart.prototype.drawDataPoints = function( values, plotInfo ) {
    var pi     = plotInfo,
        points = this.canvas.set();

    for ( var i = 0; i < values.length; i++ ) {
      points.push( this.canvas.circle( 
                   pi.origin.x + pi.scale.x * i, 
                   pi.origin.y - pi.scale.y * ( values[i] - pi.min ),
                   4 ) );
    }

    return points;
  }

  LineChart.prototype.drawDataLine = function( values, plotInfo ) {
    var pi = plotInfo,
        p  = [];

    for ( var i = 0; i < values.length; i++ ) {
      p = p.concat( [ ( i == 0 ) ? "M" : "L",
                    pi.origin.x + pi.scale.x * i, 
                    pi.origin.y - pi.scale.y * ( values[i] - pi.min ) ] );
    }

    return p;
  }

  LineChart.prototype.drawGrid = function( gridInfo ) {
    var gi        = gridInfo,
        gridRects = this.canvas.set();

    for ( var i = 0; i < gi.numSpaces; i++ ) {
      gridRects.push( 
        this.canvas.rect( gi.origin.x + gi.gap/2 + ( gi.spaceWidth + gi.gap ) * i,
                          gi.origin.y - gi.spaceHeight,
                          gi.spaceWidth,
                          gi.spaceHeight )
      );
    }

    return gridRects;
  }

  LineChart.prototype.extract = function( part, fromData ) {
    var pointIndex = ( part === 'key' ) ? 0 : 1;
    return $.map( fromData, function( point, index ) {
      return point[ pointIndex ];
    } );
  }

  LineChart.prototype.arrayMax = function( array ) {
    var max = array[0];
    for( var i = 0; i < array.length; i++ ) {
      if ( array[i] > max ) { max = array[i] }
    }
    return max;
  }

  LineChart.prototype.arrayMin = function( array ) {
    var min = array[0];
    for( var i = 0; i < array.length; i++ ) {
      if ( array[i] < min ) { min = array[i] }
    }
    return min;
  }

  window.LineChart = LineChart;

  return LineChart;
	
}( jQuery, Raphael ) );