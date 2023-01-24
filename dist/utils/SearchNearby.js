"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNearby = exports.calculateDistance = void 0;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
            * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));
    let r = 6371;
    return (c * r);
};
exports.calculateDistance = calculateDistance;
const isNearby = (lat1, lon1, lat2, lon2, threshold) => {
    let distance = (0, exports.calculateDistance)(lat1, lon1, lat2, lon2);
    if (distance <= threshold) {
        return true;
    }
    else {
        return false;
    }
};
exports.isNearby = isNearby;
//# sourceMappingURL=SearchNearby.js.map