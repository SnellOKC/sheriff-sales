<template>
<v-app>
  <div class="header"><h2>Upcoming Sheriff Sales</h2><span>Last Updated Mar 29th, 2019.</span><br/><span>For more information please visit the official <a href="https://docs.oklahomacounty.org/sheriff/SheriffSales/" target="_blank">Sheriff Sales website.</a></span></div>
  <div class="slider">
    <p style="padding:0; padding-bottom: 5px; margin:0; text-align: center;">Appraisal Value</p>
    <v-text-field
        class="slider-align"
        v-model="price[0]"
        label="Min"
        outline
        v-on:change="makeMap"
      ></v-text-field>

    <v-text-field
        class="slider-align"
        v-model="price[1]"
        label="Max"
        outline
        v-on:change="makeMap"
      ></v-text-field>
  </div>
  <div id="mapid"></div>
</v-app>
</template>

<script>
import PostsService from '@/services/PostsService'
import {LMap, LTileLayer, LMarker} from 'vue2-leaflet'

function getHomeBase(lats, lngs) {
  let maxLat = Math.max(...lats)
  let minLat = Math.min(...lats)
  let maxLng = Math.max(...lngs)
  let minLng = Math.min(...lngs)

  return [(maxLat + minLat) / 2, (maxLng + minLng) / 2]
}

function getMinimumAppraisalAmount(field) {
  let x = parseInt(field.replace(/,/g, '')) * .66
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function stripCommas(field) {
  return parseInt(field.replace(/,/g, ''))
}

const defaultIcon = new L.Icon({
  iconUrl: 'https://i.imgur.com/0OlbZuV.png',
  shadowUrl: 'https://i.imgur.com/cpMIIA1.png',

  iconSize: [20, 20],
  shadowSize: [22, 22],
  iconAnchor: [10, 10],
  shadowAnchor: [11, 10],
  popupAnchor: [-1, -10]
});

const currentIcon = new L.Icon({
  iconUrl: 'https://i.imgur.com/WsYC9Pr.png',
  shadowUrl: 'https://i.imgur.com/cpMIIA1.png',

  iconSize: [20, 20],
  shadowSize: [22, 22],
  iconAnchor: [10, 10],
  shadowAnchor: [11, 10],
  popupAnchor: [-1, -10]
});

const visitedIcon = new L.Icon({
  iconUrl: 'https://i.imgur.com/XigHHeR.png',
  shadowUrl: 'https://i.imgur.com/cpMIIA1.png',

  iconSize: [20, 20],
  shadowSize: [22, 22],
  iconAnchor: [10, 10],
  shadowAnchor: [11, 10],
  popupAnchor: [-1, -10]
});

var clickedMarker;
var mymap = null;

export default {
  name: 'home',
  data () {
    return {
      sales: [],
      locations: [],
      homeBase: [35.4563724,-97.5114003], // Devon building if no average
      price: [0, 1000000],
      maxValue: 1000000,
      minValue: 0,
      items: [0, 10000, 50000, 100000]
    }
  },
  mounted () {
    this.makeMap();
  },
  methods: {
    async fetchPosts () {
      const response = await PostsService.fetchPosts()

      const locations = []
      let latitudes = []
      let longitudes = []
      this.sales = response.data
      this.total = response.data.length

      for (let i=0; i<= response.data.length - 1; i++) {
        let d = response.data[i]

        // Rough boundary to remove any lat/lngs that Google got way wrong.
        if (d.latitude < 40 && d.latitude > 30 && d.longitude < -90 && d.longitude > -100) { 
          locations.push({
            lat: d.latitude, 
            lng: d.longitude,
            popup: '<b>Sale Date: </b>' + d.saledate + '<br/><b>Address:</b> ' + d.address + '<br/><b>Appraisal Value:</b> $' + d.appraisalvalue + ' (Min. Bid: $' + getMinimumAppraisalAmount(d.appraisalvalue) + ')'+ '<br/><b>Case Number: </b>' + d.casenumber + '<br/><a href="' + d.assessedvalue + '" target="_blank">County Assessor</a> / <a href="' + d.taxes + '" target="_blank">Taxes</a> ',
            saledate: d.saledate,
            appraisalvalue: stripCommas(d.appraisalvalue)
          })

          latitudes.push(d.latitude)
          longitudes.push(d.longitude)
        }
			}
      this.locations = locations

      this.homeBase = getHomeBase(latitudes, longitudes)
    },
    async makeMap() {
      await this.fetchPosts()
      if (mymap !== null) {
        mymap.remove();
      }
      
      function updateMap(e) {
        mymap.setView(e.target.getLatLng());

        if(clickedMarker) {
          clickedMarker.setIcon(visitedIcon);
        }
        let layer = e.target;
        e.target.setIcon(currentIcon);
        clickedMarker = e.target;
      }
      var cities = L.layerGroup();
      var cities2 = L.layerGroup();
      var cities3 = L.layerGroup();
      
      for(let i = 0; i < this.locations.length; i++) {
        if (this.price[1] >= this.locations[i].appraisalvalue && this.price[0] <= this.locations[i].appraisalvalue) {
          if (this.locations[i].lat && this.locations[i].saledate == '4/4/2019') {
            L.marker([this.locations[i].lat, this.locations[i].lng], {icon: defaultIcon}).addTo(cities3).bindPopup(this.locations[i].popup).on('click', updateMap);
          }
          if (this.locations[i].lat && this.locations[i].saledate == '4/18/2019') {
            L.marker([this.locations[i].lat, this.locations[i].lng], {icon: defaultIcon}).addTo(cities2).bindPopup(this.locations[i].popup).on('click', updateMap);
          }
          if (this.locations[i].lat && this.locations[i].saledate == '5/2/2019') {
            L.marker([this.locations[i].lat, this.locations[i].lng], {icon: defaultIcon}).addTo(cities).bindPopup(this.locations[i].popup).on('click', updateMap);
          }
        }
      }
      const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

      const grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
        streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

      mymap = L.map('mapid', {
        center: this.homeBase,
        zoom: 11,
        layers: [grayscale, cities, cities2, cities3]
      });

      const baseLayers = {
        "Grayscale": grayscale,
        "Streets": streets
      };

      const overlays = {
        "4/4/2019": cities3,
        "4/18/2019": cities2,
        "5/2/2019": cities
      };

      L.control.layers(baseLayers, overlays, {collapsed:false}).addTo(mymap);
    },
    nFormatter(num, digits) {
      var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
      ];
      var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var i;
      for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
          break;
        }
      }
      return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }
  }
}
</script>

<style type="text/css">

.header {
  position: absolute;
  top: 5px;
  left: 60px;
  z-index: 1000;
  font-weight: thin;
}

#mapid { 
  height: 100vh;
}

.slider {
  padding-top: 10px;
  padding-left: 5px;
  position: absolute;
  right: 120px;
  top: 10px;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 5px;
  z-index: 1000;
  background-color: white;
  width: 200px;
  height: 118px;
}

.slider-align {
  display: inline-block;
  width: 90px;
}
</style>

