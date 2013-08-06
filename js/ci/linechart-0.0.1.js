( function( $, R, eve ) {

	function LineChart( element, opts ) {

    this.element       = element;
    this.opts          = opts;
    this.labels        = opts.labels;
    this.values        = opts.values;
    this.metadata      = opts.metadata;
    this.selectedIndex = opts.selectedIndex || this.values.length-1;

    this.sizeAndDraw();

  }

  LineChart.prototype.sizeAndDraw = function() {
    var opts = this.opts;

    this.canvas   = R( this.element );
    this.width    = this.canvas.width;
    this.height   = this.canvas.height;
    this.gridInfo = this.computeGridInfo();
    this.plotInfo = this.computePlotInfo();

    this.grid = this.drawGrid().attr( { 
      'fill'   : this.opts.gridColor,
      'stroke' : this.opts.gridColor
    } );

    this.dataLine   = this.drawDataLine();
    this.dataPoints = this.drawDataPoints();

    this.setSelectedIndex( this.selectedIndex );

    eve.on( 'selectIndex', function( value, label, metadata ) {
      var callback = opts.onSelect || $.noop,
          index    = this.valueOf();
      callback( index, value, label, metadata );
    } );
  }

  LineChart.prototype.resize = function() {
    eve.off();
    this.canvas.clear();
    this.canvas = null;
    this.sizeAndDraw();
  }

  LineChart.prototype.setSelectedIndex = function( index ) {
    eve( 'selectIndex', index, this.values[ index ], this.labels[ index ], this.metadata[ index ] );
  }

  LineChart.prototype.updateValues = function( values ) {
    this.values = values;
    eve( 'redrawValues', values, this.computePlotInfo() );
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
        topRight = { x : gridInfo.topRight.x, 
                     y : gridInfo.topRight.y + opts.plotPadding.top },
        scale    = { x : ( topRight.x - origin.x ) / this.values.length,
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
    var pi           = this.plotInfo,
        gi           = this.gridInfo,
        opts         = this.opts,
        point        = this.canvas.set(),
        pointX       = pi.origin.x + pi.scale.x * index,
        pointY       = pi.origin.y - pi.scale.y * ( value - pi.min ),
        labelY       = gi.origin.y + opts.legendGap,
        hotspotWidth = gi.spaceWidth + gi.gap,
        tickLine     = null,
        dataCircle   = null,
        labelCircle  = null,
        labelText    = null,
        hotspot      = null;

    tickLine = this.canvas.path().attr( {
      'path'         : [ 'M', pointX, gi.topLeft.y, 
                         'L', pointX, gi.origin.y + opts.legendGap ],
      'stroke'       : opts.bgColor,
      'stroke-width' : opts.gridGap
    } ).insertBefore( this.dataLine );
    point.push( tickLine );
    eve.on( 'selectIndex', function( index, tickLine ) {
      return function() {
        if ( this.valueOf() === index ) {
          tickLine.attr( { 'stroke' : opts.selectedColor } );
        } else {
          tickLine.attr( { 'stroke' : opts.bgColor } );
        }
      } 
    }( index, tickLine ) );

    dataCircle = this.canvas.circle( pointX, pointY, opts.dataCircle.radius ).attr( {
      'stroke-width' : opts.dataCircle.strokeWidth,
      'stroke'       : opts.dataColor,
      'fill'         : opts.dataColor
    } );
    point.push( dataCircle );
    eve.on( 'redrawValues', function( index, dataCircle ) {
      return function( pi ) {
        dataCircle.animate( {
          'cx' : pi.origin.x + pi.scale.x * index,
          'cy' : pi.origin.y - pi.scale.y * ( this[index] - pi.min )
        }, opts.animationTimeout, '<' );
      } 
    }( index, dataCircle ) );
    eve.on( 'selectIndex', function( index, dataCircle ) {
      return function() {
        if ( this.valueOf() === index ) {
          dataCircle.toFront();
          dataCircle.attr( {
            'r'            : opts.dataCircle.selectedRadius,
            'stroke-width' : opts.dataCircle.selectedStrokeWidth,
            'stroke'       : opts.bgColor,
            'fill'         : opts.selectedColor
          } );
        } else {
          dataCircle.attr( {
            'r'            : opts.dataCircle.radius,
            'stroke-width' : opts.dataCircle.strokeWidth,
            'stroke'       : opts.dataColor,
            'fill'         : opts.dataColor
          } );
        }
      } 
    }( index, dataCircle ) );

    labelCircle = this.canvas.circle( pointX, labelY, this.opts.legendHeight/2+2 ).attr( {
      'fill'   : 'rgba( 255, 255, 255, 0 )',
      'stroke' : 'rgba( 255, 255, 255, 0 )'
    } );
    point.push( labelCircle );
    eve.on( 'selectIndex', function( index, labelCircle ) {
      return function() {
        if ( this.valueOf() === index ) {
          labelCircle.toFront();
          labelCircle.attr( {
            'fill'   : opts.selectedColor,
            'stroke' : opts.selectedColor
          } );
        } else {
          labelCircle.attr( {
            'fill'   : 'rgba( 255, 255, 255, 0 )',
            'stroke' : 'rgba( 255, 255, 255, 0 )'
          } );
        }
      } 
    }( index, labelCircle ) );

    labelText = this.canvas.text( pointX, labelY, label ).attr( {
      'stroke'    : opts.labelColor,
      'fill'      : opts.labelColor,
      'font-size' : opts.legendHeight
    } );
    point.push( labelText );
    eve.on( 'selectIndex', function( index, labelText ) {
      return function() {
        if ( this.valueOf() === index ) {
          labelText.toFront();
          labelText.attr( {
            'stroke' : opts.bgColor,
            'fill'   : opts.bgColor
          } );
        } else {
          labelText.attr( {
            'stroke' : opts.labelColor,
            'fill'   : opts.labelColor
          } );
        }
      } 
    }( index, labelText ) );

    hotspot = this.canvas.rect(
      pointX - hotspotWidth/2, 
      gi.topLeft.y,
      hotspotWidth,
      gi.origin.y - gi.topLeft.y + this.opts.legendGap + this.opts.legendHeight
    ).attr( {
      'stroke' : 'rgba( 0, 0, 0, 0.0 )',
      'fill'   : 'rgba( 0, 0, 0, 0.0 )'
    } )
    point.push( hotspot );

    point.mouseover( function( lineChart ) {
      return function() {
        lineChart.setSelectedIndex( index );
      }
    }( this ) );

    return point;
  }

  LineChart.prototype.drawDataLine = function() {
    function calculateDataLinePoints( values, pi ) {
      var p  = [];
      for ( var i = 0; i < values.length; i++ ) {
        p = p.concat( [ ( i == 0 ) ? "M" : "L",
                      pi.origin.x + pi.scale.x * i, 
                      pi.origin.y - pi.scale.y * ( values[i] - pi.min ) ] );
      }
      return p;
    }

    var opts     = this.opts,
        plotInfo = this.plotInfo,
        dataLine = this.canvas.path().attr( {
      'path'            : calculateDataLinePoints( this.values, plotInfo ),
      'stroke'          : opts.dataColor,
      'stroke-width'    : opts.dataLineWidth,
      'stroke-linejoin' : 'round'
    } );

    eve.on( 'redrawValues', function( plotInfo ) {
      dataLine.animate( {
        'path' : calculateDataLinePoints( this, plotInfo )
      }, opts.animationTimeout, '<' );
    } );

    return dataLine;
  }

  LineChart.prototype.drawGrid = function(s) {
    var gi = this.gridInfo;
    return this.canvas.rect( gi.topLeft.x,
                             gi.topLeft.y,
                             gi.topRight.x - gi.topLeft.x,
                             gi.origin.y - gi.topLeft.y );
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
	
}( jQuery, Raphael, eve ) );