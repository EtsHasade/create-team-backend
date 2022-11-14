const { dbConnectionDetails} = require('../config')
const mysql = require('mysql2/promise');
let connection = null

const connect = (async () => {
    try {
        connection = await mysql.createConnection(dbConnectionDetails)
        console.log('DB connected')
    } catch (error) {
        console.error(error);
    }
})
connect()

async function runSQL(query) {
    try {
        if (!connection) await connect()
        console.log('RUN SQL:\n' + query);
        const [results] = await connection.query(query)
        console.log("🚀 ~ file: DBService.js ~ runSQL ~ results", results)
        return results
    } catch (error) {
        throw error
    }

}

module.exports = {
    runSQL
}