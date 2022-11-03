const DBService = require('../services/DBService')

module.exports = {
    getSqlTimestamp,
    getJsTimestamp,
    removeMultiWhere,
    getWhereSql
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


async function removeMultiWhere(tableName, fieldName, fieldValue, { exceptFieldName, exceptValues }) {

    console.log(tableName, fieldName, fieldValue);
    let sql = `DELETE FROM ${tableName}
                 WHERE (${fieldName} = ${fieldValue})`

    if (exceptFieldName && exceptValues?.length) {
        const exceptSql = ` AND (${exceptFieldName} NOT IN(${exceptValues.join()}))`
        sql += exceptSql
    }

    try {
        const okPacket = await DBService.runSQL(sql)
        console.log('After remove - okPacket:', okPacket);

        return okPacket
    } catch (error) {
        throw new Error(`Cannot deleted - rows in table "${tableName}" by: field "${fieldName}" = "${fieldValue}"`)
    }
}

function getWhereSql(criteria, txtFields = ['name', 'description']) {
    if (typeof criteria !== 'object') return ''
    if (!Object.keys(criteria).length) return ''

    let whereSql = ' WHERE 1=1'
    if (criteria.txt) {
        const namePart = criteria.txt || ''
        const txtFieldsStr = ` AND (${txtFields.map(field => `${field} LIKE '%${namePart}%'`).join(' OR ')} )`
        delete criteria.txt
        whereSql += txtFieldsStr
    }
    const criteriaStr = Object.keys(criteria).map(key => `${key} = "${criteria[key]}"`).join(' AND ')
    if (criteriaStr) whereSql += ` AND (${criteriaStr})`

    return whereSql
}