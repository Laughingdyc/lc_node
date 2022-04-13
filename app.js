const express = require('express')
const mysql = require('mysql')
const app = express()

app.get('/', (req, res) => {
  res.send(
    new Date().toDateString()
  )
})

function connect () {
  return mysql.createConnection({
    host: 'gz-cynosdbmysql-grp-9sz5n7tl.sql.tencentcdb.com',
    port: '27306',
    user: 'root',
    password: 'zaq@6324333',
    database: 'light_community_db'
  })
}

app.get('/schoolList', (req, res) => {
  const conn = connect()
  conn.query('select * from lc_school', (err, results) => {
    if (err) {
      res.json({
        status: 1,
        msg: err
      })
    } else {
      res.json({
        status: 0,
        data: results
      })
    }
    conn.end()
  })
})

const server = app.listen(3000, () => {
  const host = server.address().address
  const port = server.address().port

  console.log("light-community server is listening at http://%s:%s", host, port)
})