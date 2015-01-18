(function () {
    var serverUrl = "";

    var app = angular.module("medicinalia", ["ngMockE2E", "ngAnimate", "ui.bootstrap"]);

    app.controller("MainController", function ($scope, $http, $modal) {
        $scope.searchResults = {};
        $scope.searchResultsData = {};
        $scope.selectedPlantId = 0;
        $scope.modalOpen = false;

        $scope.performSearch = function (searchString){
            $http.jsonp(serverUrl+"/plants/searches")
                .success(function (data) {
                    $scope.searchResults.results = data.results;

                    data.results.forEach(function(plantId){
                        $scope.fetchPlantData(plantId);
                    });
                })
                .error(function (data, status, headers, config) {
                    alert("Error fetching search results: " + status + " " + data);
                });
        };

        $scope.fetchPlantData = function (plantId){
            $http.jsonp(serverUrl+"/plants/"+plantId)
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

            $modal.open({
                templateUrl: 'plant-details-template.html',
                controller: 'PlantDetailsWindowController',
                size: 'lg',
                resolve: {
                    parentScope: function () {
                        return $scope;
                    }
                }
            });
        };
    });

    app.controller('PlantDetailsWindowController', function ($scope, $modalInstance, parentScope) {
        $scope.plantData = parentScope.searchResultsData[parentScope.selectedPlantId];

        $scope.close = function () {
            parentScope.modalOpen = false;
            $modalInstance.close();
        };
    });



    /************************************ MOCKS **************************************/

    app.run(function ($httpBackend) {
            $httpBackend.whenJSONP('/plants/searches').respond({
                results: [
                    "id1",
                    "id2",
                    "id3"
                ]
            });

            $httpBackend.whenJSONP('/plants/id1').respond({
                "name": "Mentha",
                "description": "Mentha (also known as mint, from Greek míntha, Linear B mi-ta) is a genus of plants in the family Lamiaceae (mint family). The species are not clearly distinct and estimates of the number of species varies from 13 to 18. Hybridization between some of the species occurs naturally. Many other hybrids, as well as numerous cultivars, are known in cultivation.The genus has a subcosmopolitan distribution across Europe, Africa, Asia, Australia, and North America.Mints are aromatic, almost exclusively perennial, rarely annual, herbs. They have wide-spreading underground and overground stolons and erect, square, branched stems. The leaves are arranged in opposite pairs, from oblong to lanceolate, often downy, and with a serrated margin. Leaf colors range from dark green and gray-green to purple, blue, and sometimes pale yellow. The flowers are white to purple and produced in false whorls called verticillasters. The corolla is two-lipped with four subequal lobes, the upper lobe usually the largest. The fruit is a nutlet, containing one to four seeds.While the species that make up the Mentha genus are widely distributed and can be found in many environments, most grow best in wet environments and moist soils. Mints will grow 10–120 cm tall and can spread over an indeterminate area. Due to their tendency to spread unchecked, some mints are considered invasive.",
                "photo_links": [
                    "http://commons.wikimedia.org/wiki/Special:FilePath/Mentha_longifolia_2005.08.02_09.53.56.jpg?width=300",
                    "http://img1.sunset.timeinc.net/sites/default/files/image/1999/01/mint-main-m-x.jpg",
                    "http://www.sniffapalooza.com/wp-content/uploads/2011/07/Mint_leaves.jpg",
                    "http://upload.wikimedia.org/wikipedia/commons/9/94/Mint_lemonade.jpg"
                ],
                "metadata": {
                    "vitamins": [
                        {
                            "vitcMg" : 9.5
                        }
                    ]
                }
            });

            $httpBackend.whenJSONP('/plants/id2').respond({
                "name": "Satureja",
                "description": "Satureja is a genus of aromatic plants of the family Lamiaceae, related to rosemary and thyme. There are about 30 species called savories, of which summer savory and winter savory are the most important in cultivation.",
                "photo_links": [
                    "http://commons.wikimedia.org/wiki/Special:FilePath/Satureja_montana0.jpg?width=300"
                ],
                "metadata": {
                    "vitamins": {
                        "vitcMg" : 4.2
                    }
                }
            });

            $httpBackend.whenJSONP('/plants/id3').respond({
                "name": "Tanacetum parthenium",
                "description": "Tanacetum parthenium is a traditional medicinal herb which is commonly used to prevent migraine headaches, and is also occasionally grown for ornament. The plant grows into a small bush up to around 46 cm high with citrus-scented leaves, and is covered by flowers reminiscent of daisies. It spreads rapidly, and they will cover a wide area after a few years. It is also commonly seen in the literature by its synonyms, Chrysanthemum parthenium and Pyrethrum parthenium. It is also sometimes referred to as bachelor's buttons or featherfew.",
                "photo_links": [
                    "https://www.googleapis.com/freebase/v1/image/m/02f8wvh?key=AIzaSyCQVC9yA72POMg2VjiQhSJQQP1nf3ToZTs&maxwidth=960"
                ],
                "metadata": {
                    "vitamins": [
                    ]
                }
            });

            /*
             $httpBackend.whenPOST('/plants').respond(function (method, url, data) {
             var phone = angular.fromJson(data);
             phones.push(phone);
             return [200, phone, {}];
             });
             */
        }
    );

})();