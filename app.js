(function () {
    var useMocks = false;
    var noisy = false;

    var serverUrl = useMocks ? "/" : "http://medicinalia.geton.ro/api/";

    var injectedModules = ["ui.bootstrap", "ngTagsInput", "ngAnimate"];
    if(useMocks){
        injectedModules.push("medicinalia-mocks");
    }

    var app = angular.module("medicinalia", injectedModules);

    app.controller("MainController", function ($scope, $http, $modal, $timeout) {
        $scope.searchInProgress = false;
        $scope.plantQueriesToDo = NaN;
        $scope.plantQueriesFinished = 0;

        $scope.searchTextBox = $('#search-textbox');
        $scope.searchButton = $('#search-button');
        $scope.searchResults = {};
        $scope.searchResultsData = {};
        $scope.selectedPlantId = 0;
        $scope.modalOpen = false;
        $scope.sortingOptions = {
            column: 'name',
            descending: true
        };
        $scope.shownHeaders = {
            description: true,
            vitcMg: false,
            calciumMg: false,
            protein: false
        };
        $scope.showAdBar = false;
        $scope.showAdBarDelay = 0;
        $scope.adBarPlantId = "";
        $scope.filterData = {
            zones : {
                friendlyName: 'Found in zone',
                value: '',
                filterAutocomplete: []
            },
            forDisease : {
                friendlyName: 'Relative to disease',
                value: '',
                filterAutocomplete: []
            },
            dietaryRestrictions : {
                friendlyName: 'Dietary restriction',
                value: '',
                filterAutocomplete: []
            }
        };

        $scope.toggleSearchButton = function(searching){
            if(searching){
                $scope.searchButton.html("Searching...");
                $scope.searchInProgress = true;
            } else {
                $scope.searchButton.html("Search");
                $scope.searchInProgress = false;
            }
        };

        $scope.initAutocompleteValues = function (){
            var filterNameToQueryMap = {
                zones : serverUrl + "zones?callback=JSON_CALLBACK",
                forDisease : serverUrl + "diseases?callback=JSON_CALLBACK",
                dietaryRestrictions : serverUrl + "dietary-restrictions?callback=JSON_CALLBACK"
            };

            function setupTypeAhead(filterName) {
                $http.jsonp(filterNameToQueryMap[filterName])
                    .success(function (data) {
                        $scope.filterData[filterName].filterAutocomplete = data;
                        $("#input" + filterName).typeahead({
                            source: function () {
                                return $scope.filterData[filterName].filterAutocomplete;
                            },
                            items: 3
                        });
                    })
                    .error(function (data, status, headers, config) {
                        noisy && alert("Error fetching autocomplete data for "+ filterName+": " + status + " " + data);
                    });
            }

            for(var filterName in filterNameToQueryMap){
                setupTypeAhead(filterName);
            }
        };

        $('#headers-dropdown').multiselect({
            dropRight: true,
            buttonClass: 'btn',
            selectedClass: 'headers-selected',
            buttonText: function(options, select) {
                return '<span class="glyphicon glyphicon-th-list green-font" aria-hidden="true"></span>';
            },
            onChange: function(option, checked, select) {
                $scope.shownHeaders[$(option).val()] = checked;
                $scope.$digest();
            }
        });

        function searchObjectToQueryParams(searchObject) {
            var queryParamsObject = {
                callback: "JSON_CALLBACK"
            };

            for (var index in searchObject){
                var searchString = searchObject[index].text;
                var filterName = null;

                for(var possibleFilterName in $scope.filterData){
                    if(searchString.indexOf($scope.filterData[possibleFilterName].friendlyName+ ": ") == 0){
                        filterName = possibleFilterName;
                    }
                }

                if(filterName) {
                    queryParamsObject[filterName] = searchString.split(":")[1].trim().toLowerCase();
                } else {
                    queryParamsObject["name"] = searchString.trim().toLowerCase();
                }
            }

            return "?" + $.param(queryParamsObject);
        }

        $scope.searchProhibited = function (searchObject) {
            if($scope.searchInProgress){
                return true;
            }

            return (!searchObject) || (searchObject.length <= 0 && !$($scope.searchTextBox).find('.tags .input').val());
        };

        $scope.performSearch = function (searchObject) {
            $scope.plantQueriesToDo = NaN;
            $scope.plantQueriesFinished = 0;
            $scope.toggleSearchButton(true);

            var queryUrl = serverUrl + "plants/search" + searchObjectToQueryParams(searchObject);

            $http.jsonp(queryUrl)
                .success(function (data) {
                    $scope.searchResults.results = data;

                    if(data.length){
                        $scope.plantQueriesToDo = data.length;

                        $scope.searchResults.results.forEach(function (plantId) {
                            $scope.fetchPlantData(plantId);
                        });
                    } else {
                        $scope.toggleSearchButton(false);
                    }
                })
                .error(function (data, status, headers, config) {
                    $scope.searchResults.results = [];
                    $scope.toggleSearchButton(false);
                    noisy && alert("Error fetching search results: { queryUrl: " + queryUrl + " status: " + status + ", data: " + data + " }");
                });
        };

        $scope.fetchPlantData = function (plantId) {
            var queryUrl = serverUrl + plantId + "/plants?callback=JSON_CALLBACK";

            $http.jsonp(queryUrl)
                .success(function (data) {
                    $scope.searchResultsData[plantId] = data;
                    handlePlantQueryUpdate();
                })
                .error(function (data, status, headers, config) {
                    handlePlantQueryUpdate();
                    noisy && alert("Error fetching plant data: " + status + " " + data);
                });

            var handlePlantQueryUpdate = function () {
                $scope.plantQueriesFinished++;

                if ($scope.plantQueriesToDo == $scope.plantQueriesFinished) {
                    $scope.toggleSearchButton(false);
                }
            };
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
                return 'green-font clickable';
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

        $scope.addFilter = function (searchObject, filter){
            var friendlyName = $scope.filterData[filter].friendlyName;
            var value = $scope.filterData[filter].value;
            $scope.searchObject.push({
                text: friendlyName + ": " + value
            });
        };

        /* Search plants with high Vitamin C for the ad */
        $timeout(function (){
            var searchObject = [{ text: "" }];
            var queryUrl = serverUrl + "plants/search" + searchObjectToQueryParams(searchObject);
            var plantQueriesToDo = NaN;
            var plantQueriesFinished = 0;
            var resultsWithVitC = [];

            $http.jsonp(queryUrl)
                .success(function (data) {
                    plantQueriesToDo = data.length;
                    data.forEach(function (plantId) {
                        fetchVitaminC(plantId);
                    });
                })
                .error(function (data, status, headers, config) {
                    noisy && alert("Error fetching search results: { queryUrl: " + queryUrl + " status: " + status + ", data: " + data + " }");
                });

            var fetchVitaminC = function (plantId){
                var queryUrl = serverUrl + plantId + "/plants?callback=JSON_CALLBACK";

                $http.jsonp(queryUrl)
                    .success(function (data) {
                        if(data && data.metadata && data.metadata.vitamins && data.metadata.vitamins.VitcMg){
                            resultsWithVitC.push({
                                id: plantId,
                                vitcMg: data.metadata.vitamins.VitcMg
                            });
                        }
                        handlePlantQueryUpdate();
                    })
                    .error(function (data, status, headers, config) {
                        noisy && alert("Error fetching plant data: " + status + " " + data);
                        handlePlantQueryUpdate();
                    });
            };

            var handlePlantQueryUpdate = function () {
                plantQueriesFinished++;

                if (plantQueriesToDo == plantQueriesFinished) {
                    resultsWithVitC.sort(function (firstEntry, secondEntry) {
                        return secondEntry.vitcMg - firstEntry.vitcMg;
                    });

                    var randomTop7 = Math.floor(Math.random() * 6.5);
                    var chosenPlantIndex = randomTop7 < resultsWithVitC.length ? randomTop7 : resultsWithVitC.length - 1;
                    var chosenPlantId = resultsWithVitC[chosenPlantIndex].id;
                    var queryUrl = serverUrl + chosenPlantId + "/plants?callback=JSON_CALLBACK";

                    $http.jsonp(queryUrl)
                        .success(function (data) {
                            $scope.searchResultsData[chosenPlantId] = data;
                            $scope.adBarPlantId = chosenPlantId;
                            $scope.showAdBar = true;
                        })
                        .error(function (data, status, headers, config) {
                            noisy && alert("Error fetching plant data: " + status + " " + data);
                        });
                }
            };

        }, $scope.showAdBarDelay);

    });

    app.filter('sortUsingOptions', function () {
        return function (items, options, searchResultsData) {
            if (items) {
                return items.sort(function (firstId, secondId) {
                    var firstPlant = searchResultsData[firstId];
                    var secondPlant = searchResultsData[secondId];

                    if (firstPlant && secondPlant) {
                        if(options.column == 'name'){
                            return comparePlantsByName(firstPlant, secondPlant, options);
                        } else {
                            return comparePlantsByPercentages(firstPlant, secondPlant, options);
                        }
                    }
                    return 0;
                });
            }
        };

        function comparePlantsByName(firstPlant, secondPlant, options){
            var firstField;
            var secondField;
            if(firstPlant[options.column]) {
                var firstField = firstPlant[options.column].toLowerCase();
            }
            if(secondPlant[options.column]) {
                var secondField = secondPlant[options.column].toLowerCase();
            }

            var firstField = firstField || "zzzzzzzzzzzzzzzz";
            var secondField = secondField || "zzzzzzzzzzzzzzzz";

            if (firstField < secondField) return options.descending ? -1 : 1;
            if (firstField > secondField) return options.descending ? 1 : -1;
            return 0;
        }

        function comparePlantsByPercentages(firstPlant, secondPlant, options){
            var firstField;
            var secondField;
            if(firstPlant.metadata.vitamins) {
                firstField = parseFloat(firstPlant.metadata.vitamins[options.column]);
            }
            if(secondPlant.metadata.vitamins) {
                secondField = parseFloat(secondPlant.metadata.vitamins[options.column]);
            }
            var firstField = firstField || 0;
            var secondField = secondField || 0;

            return options.descending ? firstField - secondField : secondField - firstField;
        }
    });

    app.filter('showMilligramsPer100Grams', function () {
        return function (item) {
            return item ? item + 'mg / 100g' : '';
        }
    });

    app.filter('thumbnailWithDefault', function () {
        return function (pictureLink) {
            return pictureLink ? pictureLink : 'images/no-photo.png';
        }
    });

    app.directive('stopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        };
    });

    app.controller('PlantDetailsWindowController', function ($scope, $modalInstance, parentScope) {
        $scope.plantId = parentScope.selectedPlantId;
        $scope.plantData = parentScope.searchResultsData[parentScope.selectedPlantId];

        $scope.close = function () {
            $modalInstance.close();
        };
    });

})();