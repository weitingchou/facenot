var log = require('logule').init(module, 'Face Model');

function getRandom(range) {
    return Math.floor((Math.random() * 100) + 1) % range;
}

exports.detect = function(face, callback) {
    callback(null, {result:
        {
            cheek: {
                pimples: getRandom(5),
                spots: getRandom(3)
            },
            chin: {
                pimples: getRandom(5),
                spots: getRandom(3)
            },
            forehead: {
                pimples: getRandom(5),
                spots: getRandom(3)
            }
    }});
};

exports.genReport = function(faceStates, callback) {
    var report = '',
        score = 100,
        cheek = {
            totalPimples: 0,
            totalSpots: 0
        }
        chin = {
            totalPimples: 0,
            totalSpots: 0
        }
        forehead = {
            totalPimples: 0,
            totalSpots: 0
        };

    faceStates.forEach(function(faceState) {
        cheek.totalPimples += faceState.cheek.pimples;
        cheek.totalSpots += faceState.cheek.spots;
        chin.totalPimples += faceState.chin.pimples;
        chin.totalSpots += faceState.chin.spots;
        forehead.totalPimples += faceState.forehead.pimples;
        forehead.totalSpots += faceState.forehead.spots;
    });
    if ((cheek.totalPimples / faceStates.length) > 20) {
        report += 'As you are having many pimples, diet adjustment and professional advisor is needed. Some direct treatment to acnes is necessary.\n';
        score -= getRandom(25);
    }
    if ((cheek.totalPimples / faceStates.length) > 2) {
        report += 'Having pimples on your left cheek indicates the decreasing ability of detoxification which could be caused by abnormal liver function and poor blood circulation. Liver malfunctioning can lead to accumulation of “heat toxin”.\n';
        score -= getRandom(15);
    }
    if ((cheek.totalPimples+chin.totalPimples+forehead.totalPimples < 20) &&
        (cheek.totalSpots+chin.totalSpots+forehead.totalSpots > 5)) {
        report += 'Some long-term advices are: \n - Facilitate blood circulation. \n - Maintain a regular daily schedule and keep a good mood.\n - Keep your body from a hot and stuffy environment. Open the windows or turn on the fan when necessary and shower with water having temperature slightly lower than your body temperature. \n - Have more outdoor activities. \n - Consume food that is considered “cold”, such as loofah, winter melon\/white gourd, dried persimmon, and green beans.\n';
        score -= getRandom(10);
    }
    if ((forehead.totalPimples / faceStates.length) > 2) {
        report += 'Unattended and overwhelming stress could also lead to liver stagnation. Without a proper way to relieve the pressure, you could easily feel annoyed or irritated over trivial things, or even for no reason—this is a sign of liver stagnation.';
        score -= getRandom(10);
    }
    callback(null, {
        report: report,
        score: score
    });
};
