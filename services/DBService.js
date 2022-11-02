const mysql = require('mysql2/promise');
let connection = null

const connect = (async () => {
    try {
        connection = await mysql.createConnection({
            host: 'containers-us-west-63.railway.app',
            port: 7250,
            user: 'root',
            password: 'qpnXBA1w6rxIosfIyQFB',
            database: 'railway',
        })
        console.log('DB connected')
    } catch (error) {
        if(error) throw new Error('SQL DB connection fail')
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