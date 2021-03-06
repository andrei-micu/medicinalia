(function () {

    var app = angular.module("medicinalia-mocks", ["ngMockE2E"]);

    /************************************ MOCKS **************************************/

    app.run(function ($httpBackend) {
            $httpBackend.whenJSONP(/.*plants\/search.*/).respond([
                "id2",
                "id1",
                "id3"
            ]);

            $httpBackend.whenJSONP(/.*id1.*/).respond({
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

            $httpBackend.whenJSONP(/.*id2.*/).respond({
                "name": "Satureja",
                "description": "Satureja is a genus of aromatic plants of the family Lamiaceae, related to rosemary and thyme. There are about 30 species called savories, of which summer savory and winter savory are the most important in cultivation.",
                "photo_links": [
                    "http://commons.wikimedia.org/wiki/Special:FilePath/Satureja_montana0.jpg?width=300"
                ],
                "metadata": {
                    "vitamins": {
                        "VitcMg" : 4.2
                    }
                }
            });

            $httpBackend.whenJSONP(/.*id3.*/).respond({
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
        }
    );

})();