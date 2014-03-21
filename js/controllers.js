"use strict";

var lanternControllers = angular.module('lanternControllers', []);

lanternControllers.controller('SearchCtrl', ['$scope', '$rootScope', '$http', 'geolocation', 'geoencoder',
    function ($scope, $rootScope, $http, geolocation, geoencoder) {
    	$scope.findme = function() {
			geoencoder('address').then(function(address) {
				$rootScope.address = $scope.address = address[0];
				$rootScope.county = address[1];
				$rootScope.state = address[2];
			});
		}

		$scope.toggleMenu = function() {
            if($rootScope.menu == "open") {
               $rootScope.menu = "close";
            } else {
               $rootScope.menu = "open";
            }

            return false;
		}
    }
]);

lanternControllers.controller('MainCtrl', ['$scope', '$rootScope', '$http', 'geolocation', 'geoencoder',
    function ($scope, $rootScope, $http, geolocation, geoencoder) {
    	$scope.progressShown = true;
    	
    	$scope.camera = function($event) {
    		$event.preventDefault();

			navigator.camera.getPicture(onSuccess, onFail, { quality: 60 }); 
			
			function onSuccess(imageData) {
				$rootScope.photo = "data:image/jpeg;base64," + imageData;
			}

			function onFail(message) {
			}
		}

		$scope.openTwitter = function($event) {
			$event.preventDefault();
			window.open(encodeURI("partials/twitter.html"), '_blank', 'location=no,enableViewportScale=yes','closebuttoncaption=back');
		}
		
		$scope.openTips = function($event) {
			$event.preventDefault();
			window.open("http://energy.gov/oe/community-guidelines-energy-emergencies", '_blank', 'location=no,enableViewportScale=yes','closebuttoncaption=back');
		}

		$rootScope.backstate = "";
		$rootScope.navstate = "";
		$scope.id = "main";
		$scope.animate = "scale"
		$scope.show = false;
		$scope.progressShown = false;
    }
]);

lanternControllers.controller('StationListCtrl', ['$scope', '$rootScope', '$http', 'loadstations',
    function ($scope, $rootScope, $http, loadstations) {
    	$scope.progressShown = true;

		if($rootScope.stations == null) {
	        loadstations().then(function(data) {
	        	$rootScope.stations = $scope.stations = data;
	        	$scope.progressShown = false;
	        });
		} else {
			$scope.stations = $rootScope.stations;
			$scope.progressShown = false;
		}

   		$scope.tagCancel = function() {  			
			$scope.toggleModal();
		};

		$scope.tagStation = function(id, status) {
			$scope.toggleModal();
			navigator.notification.alert('', '', 'Station Status Reported', 'Close');
			
			if ($scope.status == "open") {
				$http.get('http://doelanternapi.parseapp.com/gasstations/fuelstatus/tag/' + $scope.stationid + '/closed').success(function (data) {
			        loadstations().then(function(data) {
			        	$rootScope.stations = data;
			        });						
				});				
			} else {
				$http.get('http://doelanternapi.parseapp.com/gasstations/fuelstatus/tag/' + $scope.stationid + '/open').success(function (data) {
			        loadstations().then(function(data) {
			        	$rootScope.stations = data;			        	
			        });
				});			
			}

			$scope.showdetails = ""; 
		};

		$scope.tagOpenWindow = function(id, status) {
			if(status != "red") {
				$scope.status = "open";
			} else {
				$scope.status = "closed";
			}

			$scope.stationid = id;
			$scope.toggleModal();
		};

		$scope.getDirections = function(url) {
			window.open(encodeURI(url) + '&saddr=' + encodeURI($rootScope.address), '_system', 'location=no,enableViewportScale=yes');
		}
		
		$rootScope.typestate = true;
		$rootScope.backstate = "visible";
		$rootScope.navstate = "visible";
		$rootScope.navbtnlabel = "Map";
		$rootScope.navtext = "OPEN GAS STATIONS";
		$rootScope.navclass = "gas";
		$rootScope.navtarget = "station-map";
		$scope.id = "station-list";
		$scope.animate = "scale";		
		$scope.saddr = encodeURI($rootScope.address);
    }
]);

lanternControllers.controller('StationMapCtrl', ['$scope', '$rootScope', '$http', 'geolocation', 'geoencoder', 'loadstations',
    function ($scope, $rootScope, $http, geolocation, geoencoder, loadstations) {	
    	$scope.progressShown = true;
		var station_markers = null;

		$scope.loadMarkers = function() {
			var stations = $rootScope.stations;
			var size = new google.maps.Size(25,40);

			station_markers = new Array();

			for(var i=0; i < stations.length; i++) {
				station_markers.push({
					"id" : stations[i].id,
					"station" : stations[i].station,
					"operatingStatus" : stations[i].operatingStatus,
					"address" : stations[i].address,
					"city" : stations[i].city,
					"region" : stations[i].region,
					"zip" : stations[i].zip,
					"latitude" : stations[i].lat,
					"longitude" : stations[i].lng,					
					"icon" : {
						url: 'img/pin-' + stations[i].operatingStatus.toLowerCase() + '.png',
						scaledSize: size
					}
				});
			}
			
			$scope.markers = station_markers;			
		}

		$scope.getDirections = function(url) {
			window.open(encodeURI(url) + '&saddr=' + encodeURI($rootScope.address), '_system', 'location=no,enableViewportScale=yes');
		}

   		$scope.tagCancel = function() {  			
			$scope.toggleModal();
		}

		$scope.tagStation = function(id, status) {
			$scope.toggleModal();
			
			navigator.notification.alert('','', 'Station Status Reported', 'Close');
			
			if ($scope.status == "open") {
				$http.get('http://doelanternapi.parseapp.com/gasstations/fuelstatus/tag/' + $scope.stationid + '/closed').success(function (data) {
			        loadstations().then(function(data) {
			        	$rootScope.stations = data;
			        	$scope.showdetails = "";
			        });	
				});				
			} else {
				$http.get('http://doelanternapi.parseapp.com/gasstations/fuelstatus/tag/' + $scope.stationid + '/open').success(function (data) {
			        loadstations().then(function(data) {
			        	$rootScope.stations = data;
			        	$scope.showdetails = "";
			        });
				});			
			} 
		};

		$scope.tagOpenWindow = function(id, status) {
			if(status != "red") {
				$scope.status = "open";
			} else {
				$scope.status = "closed";
			}

			$scope.stationid = id
			$scope.toggleModal();
		};

		if($rootScope.stations == null) {
	        loadstations().then(function(data) {
	        	$rootScope.stations = data;
	        	$scope.loadMarkers();
	        	$scope.progressShown = false;
	        });
		} else {
        	$scope.loadMarkers();
        	$scope.progressShown = false;
		}	
		
		$rootScope.typestate = true;		
		$rootScope.backstate = "visible";
		$rootScope.navstate = "visible";
		$rootScope.navbtnlabel = "List";
		$rootScope.navtext = "OPEN GAS STATIONS";
		$rootScope.navclass = "gas";
		$rootScope.navtarget = "station-list";
		$scope.id = "station-map";
		$scope.animate = "scale";
    }
]);

lanternControllers.controller('OutageListCtrl', ['$scope', '$rootScope', '$http', 'loadoutages',
    function ($scope, $rootScope, $http, loadoutages) {
    	$scope.progressShown = true;

		if($rootScope.outages == null) {
	        loadoutages().then(function(data) {
	        	$rootScope.outages = $scope.outages = data;
	        	$scope.progressShown = false;
	        });
		} else {
			$scope.outages = $rootScope.outages;
			$scope.progressShown = false;
		}

		$scope.getMap = function($event, url) {
			$event.preventDefault();
			window.open(encodeURI(url), '_blank', 'location=no,enableViewportScale=yes','closebuttoncaption=back');
		}

		$rootScope.backstate = "visible";
		$rootScope.navstate = "visible";
		$rootScope.typestate = false;
		$rootScope.navtext = "POWER OUTAGES";
		$rootScope.navclass = "lightning";
		$rootScope.navtarget = "outage-map";
		$scope.id = "outage-list";
		$scope.animate = "scale"
    }
]);

lanternControllers.controller('DownedPowerLinesCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
    	$scope.progressShown = true;
    	document.getElementById("photo").attr("src", $rootScope.photo);

		$rootScope.backstate = "visible";
		$rootScope.navstate = "visible";
		$rootScope.typestate = false;
		$rootScope.navtext = "DOWNED POWERLINES";
		$rootScope.navclass = "camera";
		$rootScope.navtarget = "downed-powerlines";
		$scope.id = "downed-powerlines";
		$scope.animate = "scale"
		$scope.progressShown = false;
    }
]);