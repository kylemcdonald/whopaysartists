(function( $, d3 ) {
  function ClientDatum( name ) {
    this.name = name;
    this.fees = [];
    this.feeSum = 0;
    this.experienceSum = 0;
    this.experienceNum = 0;
  }

  ClientDatum.findOrCreate = (function() {
    var all = {};

    return function( name ) {
      return all[ name ] = all[ name ] || new ClientDatum( name );
    };
  })();

  Object.defineProperties( ClientDatum.prototype, {
    addFee: {
      value: function( fee ) {
        this.fees.push( fee );
        this.fees.sort();
        this.feeSum += fee;
      }
    },

    numFees: {
      get: function() {
        return this.fees.length;
      }
    },

    avgFee: {
      get: function() {
        return this.feeSum / this.numFees;
      }
    },

    addExperience: {
      value: function( experience ) {
        this.experienceSum += this.quantifyExperience( experience );
        this.experienceNum++;
      }
    },

    avgExperience: {
      get: function() {
        return this.experienceSum / this.experienceNum;
      }
    },

    quantifyExperience: {
      value: function( experienceDescription ) {
        return {
          'unusually good': 2,
          'good': 1,
          'bad': -1,
          'unusually bad': -2
        }[ experienceDescription ] || 0;
      }
    },
  } );


  function Visualization( targetCurrency ) {
    this.isDomReady = false;
    this.isDataReady = false;
    this.isRatesReady = false;

    this.targetCurrency = targetCurrency;
  }

  Object.defineProperties( Visualization.prototype, {
    fetchData: {
      value: function() {
        d3.json( "/data.json", function( error, json ) {
          if ( error ) return console.error( error );

          this.data = json;
          this.onDataLoaded();
        }.bind( this ) );

        $.ajax( {
          dataType: 'jsonp',
          url: 'http://api.fixer.io/latest',
          success: function( data ) {
            fx.rates = data.rates;
            this.onRatesLoaded();
          }.bind( this )
        } );
      }
    },

    onDataLoaded: {
      value: function() {
        this.isDataReady = true;
        this.visualize();
      }
    },

    onRatesLoaded: {
      value: function() {
        this.isRatesReady = true;
        this.visualize();
      }
    },

    onDomReady: {
      value: function() {
        this.isDomReady = true;
        this.visualize();
      }
    },

    normalizeMoney: {
      value: function( amount, currency ) {
        if ( currency === "EUR" ) currency = "";
        var target = this.targetCurrency === "EUR" ? "" : this.targetCurrency;

        var rate = fx( amount ).from( currency ).to( target );
        if ( rate !== rate ) console.warn( "Could not convert ", amount, "from", currency );

        return Math.round( rate * 100 ) / 100;
      }
    },

    massageData: {
      value: function( data ) {
        var out = data.reduce( function( dd, d ) {
          if ( d.fee && d.currency ) {
            var f = this.normalizeMoney( d.fee, d.currency );
            dd.fees.push( f );

            dd.maxFee = Math.max( dd.maxFee, f );
            dd.minFee = Math.min( dd.minFee, f );

            if ( d.client ) {
              var c = ClientDatum.findOrCreate( d.client );
              if ( c.numFees === 0 ) dd.clients.push( c );

              c.addFee( f );
              c.addExperience( d.experience );


              dd.clientMaxNum = Math.max( dd.clientMaxNum, c.numFees );
              dd.clientMinNum = Math.min( dd.clientMinNum, c.numFees );
              dd.clientMaxSum = Math.max( dd.clientMaxSum, c.feeSum );
              dd.clientMinSum = Math.min( dd.clientMinSum, c.feeSum );
            }
          }

          return dd;
        }.bind( this ), {
          fees: [],
          clients: [],
          maxFee: Number.MIN_VALUE,
          minFee: Number.MAX_VALUE,
          clientMaxNum: Number.MIN_VALUE,
          clientMinNum: Number.MAX_VALUE,
          clientMaxSum: Number.MIN_VALUE,
          clientMinSum: Number.MAX_VALUE
        } );

        var extent = d3.extent( out.clients, function( d ) { return d.avgFee; } );
        out.clientMaxAvg = extent.pop();
        out.clientMinAvg = extent.pop();

        return out;
      }
    },

    drawFees: {
      value: function( data ) {
        var width = 1000, height = 1000, margin = width * 0.075;
        var svg = d3.select( "#fees" )
          .append( "svg" )
          .attr( "viewBox", "0 0 "+width+" "+height );

        var scale_r = d3.scale.linear()
          .domain( [ data.minFee, data.maxFee ] )
          .range( [ width * 0.01, width * 0.1 ] )
          .clamp( true );

        var scale_x = d3.scale.linear()
          .domain( [ data.clientMinAvg, data.clientMaxAvg ] )
          .rangeRound( [ 0 + margin, width - margin ] );

        var scale_y = d3.scale.linear()
          .domain( [ 2, -2 ] )
          .rangeRound( [ 0 + margin, height - margin ] );

        var scale_c = d3.scale.category20();

        var scale_textPlacement = d3.scale.linear()
          .domain( [ 0, 1 ] )
          .range( [ 0, 18 ] );

        var axis_x = d3.svg.axis()
          .scale( scale_x )
          .orient( "bottom" )
          .ticks( 5 );

        var axis_y = d3.svg.axis()
          .scale( scale_y )
          .orient( "left" )
          .ticks( 5 );

        var axisMargin = margin * 0.5;
        var labelOffset = 30;
        svg.append( "g" )
          .attr( "class", "axis" )
          .attr( "transform", "translate( 0,"+(height-axisMargin)+" )" )
          .call( axis_x );
        svg.append( "text" )
          .attr( "class", "axis-label" )
          .attr( "text-anchor", "middle" )
          .attr( "x", width * 0.8 )
          .attr( "y", height - axisMargin + labelOffset )
          .text( "average fee in " + this.targetCurrency );

        svg.append( "g" )
          .attr( "class", "axis" )
          .attr( "transform", "translate( "+axisMargin+",0 )" )
          .call( axis_y );
        svg.append( "text" )
          .attr( "class", "axis-label" )
          .attr( "text-anchor", "middle" )
          .attr( "transform", "rotate(-90)" )
          .attr( "x", -width * 0.2 )
          .attr( "y", axisMargin - labelOffset )
          .text( "average quality of experience" );

        var g = svg.selectAll( "g.client" )
          .data( data.clients )
          .enter()
            .append( "g" )
            .attr( "class", "client" )
            .attr( "transform", function( d ) {
              return "translate(" + scale_x( d.avgFee ) + "," + scale_y( d.avgExperience ) + ")";
            } )
        ;

        g.append( "text" )
          .attr( "class", "name" )
          .attr( "x", 0 )
          .attr( "y", -20 )
          .text( function( d ) { return d.name; } )
        ;

        g.selectAll( "circle" )
         .data( function( d ) { return d.fees; } )
         .enter()
           .append( "circle" )
           .attr( "r", function( d ) { return scale_r( d ); } )
           .attr( "stroke", function( d, i ) { return scale_c( i ); } )
           .attr( "stroke-width", function( d ) { return scale_r( d ) * 0.25; } )
           .attr( "cx", 0 )
           .attr( "cy", 0 )
        ;

        g.selectAll( "text.fees" )
          .data( function( d ) { return d.fees; } )
          .enter()
            .append( "text" )
            .attr( "class", "fees" )
            .attr( "x", 0 )
            .attr( "y", function( d, i ) { return scale_textPlacement( i ); } )
            .text( function( d ) { return d + this.targetCurrency; }.bind( this ) );
      }
    },

    visualize: {
      value: function() {
        if ( !( this.isDataReady && this.isRatesReady && this.isDomReady ) ) return;

        var data = this.massageData( this.data );
        this.drawFees( data );
      }
    }
  } );



  var params = getQueryParams( location.search );
  var currency = params[ "currency" ] || "USD";

  var visualization = new Visualization( currency );
  visualization.fetchData();

  $( function() {
    visualization.onDomReady();
    window.visualization = visualization;
  } );


  function getQueryParams( qs ) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
  }
})( jQuery, d3 );
