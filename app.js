(function () {
    var useMocks = true;

    var serverUrl = useMocks ? "" : "http://medicinalia.geton.ro/api";

    var injectedModules = ["ngTagsInput", "ngAnimate", "ui.bootstrap"];
    if(useMocks){
        injectedModules.push("medicinalia-mocks");
    }

    var app = angular.module("medicinalia", injectedModules);

    app.controller("MainController", function ($scope, $http, $modal) {
        $scope.searchResults = {};
        $scope.searchResultsData = {};
        $scope.selectedPlantId = 0;
        $scope.modalOpen = false;
        $scope.sortingOptions = {
            column: 'name',
            descending: true
        };

        function searchObjectToQueryParams(searchObject) {
            var queryParamsObject = {
                callback: "JSON_CALLBACK",
                name: searchObject[0].text
            };

            return "?" + $.param(queryParamsObject);
        };

        $scope.performSearch = function (searchObject) {
            var queryUrl = serverUrl + "/plants/search" + searchObjectToQueryParams(searchObject);

            $http.jsonp(queryUrl)
                .success(function (data) {
                    $scope.searchResults.results = data;

                    $scope.searchResults.results.forEach(function (plantId) {
                        $scope.fetchPlantData(plantId);
                    });
                })
                .error(function (data, status, headers, config) {
                    alert("Error fetching search results: { queryUrl: " + queryUrl + " status: " + status + ", data: " + data + " }");
                });
        };

        $scope.fetchPlantData = function (plantId) {
            var queryUrl = serverUrl + "/" + plantId + "/plants?callback=JSON_CALLBACK";

            $http.jsonp(queryUrl)
                .success(function (data) {
                    $scope.searchResultsData[plantId] = data;
                })
                .error(function (data, status, headers, config) {
                    alert("Error fetching plant data: " + status + " " + data);
                });
        };

        $scope.openPlantDetailsWindow = function (plantId) {
            $scope.modalOpen = true;
            $scope.selectedPlantId = plantId;

            var modalInstance = $modal.open({
                templateUrl: 'plant-details-template.html',
                controller: 'PlantDetailsWindowController',
                size: 'lg',
                backdrop: false,
                resolve: {
                    parentScope: function () {
                        return $scope;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.modalOpen = false;
            }, function () {
                $scope.modalOpen = false;
            });
        };

        $scope.getCaretClassForColumn = function (columnName) {
            if (columnName == $scope.sortingOptions.column) {
                return $scope.sortingOptions.descending ? 'caret caret-reversed' : 'caret';
            }
        };

        $scope.getColorClassForColumn = function (columnName) {
            if (columnName == $scope.sortingOptions.column) {
                return 'sort-active clickable';
            }
            return 'clickable';
        };

        $scope.changeSorting = function (columnName) {
            var sortingOptions = $scope.sortingOptions;

            if (sortingOptions.column == columnName) {
                sortingOptions.descending = !sortingOptions.descending;
            } else {
                sortingOptions.column = columnName;
                sortingOptions.descending = false;
            }
        };

    });

    app.filter('sortUsingOptions', function () {
        return function (items, options, searchResultsData) {
            if (items) {
                return items.sort(function (firstId, secondId) {
                    var firstPlant = searchResultsData[firstId];
                    var secondPlant = searchResultsData[secondId];

                    if (firstPlant && secondPlant) {
                        var firstField = firstPlant[options.column].toLowerCase();
                        var secondField = secondPlant[options.column].toLowerCase();

                        if (firstField < secondField) return options.descending ? -1 : 1;
                        if (firstField > secondField) return options.descending ? 1 : -1;
                    }
                    return 0;
                });
            }
        };
    });

    app.controller('PlantDetailsWindowController', function ($scope, $modalInstance, parentScope) {
        $scope.plantData = parentScope.searchResultsData[parentScope.selectedPlantId];

        $scope.close = function () {
            $modalInstance.close();
        };
    });

})();