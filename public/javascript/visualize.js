(function( $, d3 ) {
  function Visualization() {
    this.isDomReady = false;
    this.isDataReady = false;
    this.isRatesReady = false;

    this.targetCurrency = "USD";
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

        var rate = fx( amount ).from( currency ).to( this.targetCurrency );
        if ( rate !== rate ) console.warn( "Could not convert ", amount, "from", currency );

        return Math.round( rate * 100 ) / 100;
      }
    },

    visualize: {
      value: function() {
        if ( !( this.isDataReady && this.isRatesReady && this.isDomReady ) ) return;

        var avgFee = 0, nFees = 0, maxFee = 0, minFee = 0;
        this.data.forEach( function( d ) {
          d.calc = {};

          if ( d.fee && d.currency ) {
            var f = this.normalizeMoney( d.fee, d.currency );
            d.calc.normFee = f

            avgFee += f;
            if ( f > maxFee ) maxFee = f;
            nFees++;
          }
        }.bind( this ) );
        avgFee = avgFee / nFees;

        var fees = this.data.reduce( function( dd, d ) {
          return d.calc.normFee === undefined ? dd : dd.concat( d.calc.normFee );
        }, [] );

        var svg = d3.select( "#fees" )
          .append( "svg" );
        svg.selectAll( "circle" )
          .data( fees )
          .enter()
            .append( "circle" )
            .attr( "cx", function( d ) { return d / maxFee * 100 + "%"; } )
            .attr( "cy", "50%" )
            .attr( "r", 5 );

        //d3.select( "#fees" )
          //.selectAll( "div" )
            //.data()
          //.enter()
            //.append( "div" )
            //.style( "width", function( d ) { return d.calc.normFee * 0.01 + "px"; } )
            //.text( function( d ) { return d.calc.normFee + this.targetCurrency; }.bind( this ) );
      }
    }
  } );



  var visualization = new Visualization();
  visualization.fetchData();

  $( function() {
    visualization.onDomReady();
    window.visualization = visualization;
  } );
})( jQuery, d3 );
