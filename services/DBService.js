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
        const [results] = await connection.query(query)
        return results
    } catch (error) {
        throw error
    }

}

module.exports = {
    runSQL
}