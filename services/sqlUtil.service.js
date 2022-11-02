module.exports = {
    getSqlTimestamp,
    getJsTimestamp,
}

function getSqlTimestamp(jsTimestemp = Date.now()) {
    return new Date(jsTimestemp).toISOString().slice(0, 19).replace('T', ' ');
}



function getJsTimestamp(sqlTimestemp) {
    console.log("🚀 ~ file: sqlUtil.service.js ~ line 13 ~ getJsTimestamp ~ sqlTimestemp", sqlTimestemp)
    if (!sqlTimestemp) return Date.now()
    const timestemp = new Date(sqlTimestemp).getTime()
    if (!isNaN(timestemp)) return timestemp

    try {
        let sqlTimestempParts = sqlTimestemp.split(/[- :]/); // regular expression split that creates array with: year, month, day, hour, minutes, seconds values
        sqlTimestempParts[1]--; // monthIndex begins with 0 for January and ends with 11 for December so we need to decrement by one
        return new Date(...sqlTimestempParts).getTime(); // our Date object
    } catch (error) {
        throw new error('Invalid Sql timestamp: ' + sqlTimestemp)
    }
}