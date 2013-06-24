( function( $, R ) {

	function LineChart( element, opts ) {

    this.element  = element;
    this.canvas   = R( this.element );
    this.width    = this.canvas.width;
    this.height   = this.canvas.height;
    this.labels   = this.extract( 'key',   opts.data );
    this.values   = this.extract( 'value', opts.data );
    this.range    = this.maxVal - this.minVal;
    this.origin   = { x : opts.padding.left, 
                      y : this.height - opts.padding.bottom };
    this.topRight = { x : this.width - opts.padding.right,
                      y : opts.padding.top };

    this.grid     = this.drawGrid( opts.data, 5 );
    this.grid.attr( { 
      'fill'   : opts.gridColor,
      'stroke' : opts.gridColor
    } );

    this.dataLine = this.canvas.path().attr( {
      'path'   : this.drawDataLine( this.values ),
      'stroke' : opts.dataColor,
      'stroke-width' : 2
    } );

    this.dataPoints = this.drawDataPoints( this.values );
    this.dataPoints.attr( { 
      'fill'   : opts.dataColor,
      'stroke' : opts.dataColor
    } );
  }

  LineChart.prototype.drawDataPoints = function( values ) {
    var max    = this.arrayMax( values ),
        min    = this.arrayMin( values ),
        range  = max - min,
        width  = this.topRight.x - this.origin.x,
        height = this.origin.y - this.topRight.y,
        xScale = width / ( values.length + 1 ),
        yScale = height / range,
        points = this.canvas.set();

    for ( var i = 0; i < values.length; i++ ) {
      points.push( this.canvas.circle( 
                      this.origin.x + xScale * (i+1), 
                      this.origin.y - yScale * ( values[i] - min ),
                      4 ) );
    }

    return points;
  }

  LineChart.prototype.drawDataLine = function( values ) {
    var max    = this.arrayMax( values ),
        min    = this.arrayMin( values ),
        range  = max - min,
        width  = this.topRight.x - this.origin.x,
        height = this.origin.y - this.topRight.y,
        xScale = width / ( values.length + 1 ),
        yScale = height / range,
        p      = [];

    for ( var i = 0; i < values.length; i++ ) {
      p = p.concat( [ ( i == 0 ) ? "M" : "L",
                      this.origin.x + xScale * (i+1), 
                      this.origin.y - yScale * ( values[i] - min ) ] );
    }

    return p;
  }

  LineChart.prototype.drawGrid = function( data, gap ) {
    var numSpaces   = data.length + 1,
        spaceWidth  = ( this.topRight.x - this.origin.x ) / numSpaces - gap,
        spaceHeight = ( this.origin.y - this.topRight.y ),
        gridRects   = this.canvas.set();

    for ( var i = 0; i < numSpaces; i++ ) {
      gridRects.push( 
        this.canvas.rect( this.origin.x + gap/2 + ( spaceWidth + gap ) * i,
                          this.origin.y - spaceHeight,
                          spaceWidth,
                          spaceHeight )
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