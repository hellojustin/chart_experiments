( function( $, R ) {

	function LineChart( element, opts ) {

    this.element  = element;
    this.opts     = opts;
    this.canvas   = R( this.element );
    this.width    = this.canvas.width;
    this.height   = this.canvas.height;
    this.labels   = this.extract( 'key',   opts.data );
    this.values   = this.extract( 'value', opts.data );
    this.gridInfo = this.computeGridInfo();
    this.plotInfo = this.computePlotInfo();

    this.grid     = this.drawGrid().attr( { 
      'fill'   : opts.gridColor,
      'stroke' : opts.gridColor
    } );

    this.dataPoints = this.drawDataPoints()

    this.dataLine = this.canvas.path().attr( {
      'path'   : this.drawDataLine(),
      'stroke' : opts.dataColor,
      'stroke-width' : 2
    } );
  }

  LineChart.prototype.computeGridInfo = function() {
    var numSpaces   = this.values.length + 1,
        origin      = { x : this.opts.padding.left, 
                        y : this.height - this.opts.padding.bottom - this.opts.legendHeight - this.opts.legendGap },
        topLeft     = { x : origin.x,
                        y : this.opts.padding.top },
        topRight    = { x : this.width - this.opts.padding.right,
                        y : this.opts.padding.top },
        spaceWidth  = ( topRight.x - origin.x ) / numSpaces - this.opts.gridGap,
        spaceHeight = ( origin.y - topRight.y );

    return {
      gap         : this.opts.gridGap,
      origin      : origin,
      topLeft     : topLeft,
      topRight    : topRight,
      numSpaces   : numSpaces,
      spaceWidth  : spaceWidth,
      spaceHeight : spaceHeight
    }
  }

  LineChart.prototype.computePlotInfo = function() {
    var gridInfo = this.gridInfo,
        opts     = this.opts,
        max      = this.arrayMax( this.values ),
        min      = 0,
        range    = max - min,
        origin   = { x : gridInfo.origin.x + (gridInfo.spaceWidth + gridInfo.gap),
                     y : gridInfo.origin.y - opts.plotPadding.bottom },
        topRight = { x : gridInfo.topRight.x - (gridInfo.spaceWidth + gridInfo.gap), 
                     y : gridInfo.topRight.y + opts.plotPadding.top },
        scale    = { x : ( topRight.x - origin.x ) / ( this.values.length-1 ),
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

  LineChart.prototype.drawDataPoints = function() {
    var points = this.canvas.set();
    for ( var i = 0; i < this.values.length; i++ ) {
      points.push( this.drawIndividualDataPoint( i, this.values[i], this.labels[i] ) );
    }
    return points;
  }

  LineChart.prototype.drawIndividualDataPoint = function( index, value, label ) {
    var pi     = this.plotInfo,
        gi     = this.gridInfo,
        point  = this.canvas.set(),
        pointX = pi.origin.x + pi.scale.x * index,
        pointY = pi.origin.y - pi.scale.y * ( value - pi.min ),
        labelY = gi.origin.y + this.opts.legendGap,
        hotspotWidth = gi.spaceWidth + gi.gap;

    point.push( this.canvas.path().attr( {
      'path'   : [ 'M', pointX, gi.topLeft.y, 
                   'L', pointX, gi.origin.y + this.opts.legendGap + this.opts.legendHeight ],
      'stroke' : '#ffffff',
      'stroke-width' : this.opts.gridGap
    } ) )

    point.push( this.canvas.circle( pointX, pointY, 4 ).attr({
      'stroke' : this.opts.dataColor,
      'fill'   : this.opts.dataColor
    }) );

    point.push( this.canvas.circle( pointX, labelY, this.opts.legendHeight/2+1 ).attr( {
      'fill' : '#000000'
    } ) );

    point.push( this.canvas.text( pointX, labelY, label ).attr( {
      'stroke' : '#ffffff',//this.opts.dataColor,
      'fill'   : '#ffffff',//this.opts.dataColor,
      'font-size' : this.opts.legendHeight
    } ) );

    point.push( this.canvas.rect(
      pointX - hotspotWidth/2, 
      gi.topLeft.y,
      hotspotWidth,
      gi.origin.y - gi.topLeft.y + this.opts.legendGap + this.opts.legendHeight
    ).attr( {
      'stroke' : 'rgba( 0, 0, 0, 0.0 )',
      'fill'   : 'rgba( 0, 0, 0, 0.0 )'
    } ) );

    return point;
  }

  LineChart.prototype.drawDataLine = function() {
    var pi = this.plotInfo,
        p  = [];
    for ( var i = 0; i < this.values.length; i++ ) {
      p = p.concat( [ ( i == 0 ) ? "M" : "L",
                    pi.origin.x + pi.scale.x * i, 
                    pi.origin.y - pi.scale.y * ( this.values[i] - pi.min ) ] );
    }
    return p;
  }

  LineChart.prototype.drawGrid = function(s) {
    var gi = this.gridInfo;
    return this.canvas.rect( gi.topLeft.x,
                             gi.topLeft.y,
                             gi.topRight.x - gi.topLeft.x,
                             gi.origin.y - gi.topLeft.y );
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