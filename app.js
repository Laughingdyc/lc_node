const express = require('express')
const dayjs = require('dayjs')
const mysql = require('mysql')
const cors = require('cors')
const app = express()

app.use(cors())

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

function errorResJson(status, error) {
  return { status: status, msg: error }
}
function successResJson(data = []) {
  return { status: 0, data: data }
}

app.get('/schoolList', (req, res) => {
  const conn = connect()
  conn.query('select * from lc_school', (err, results) => {
    if (err) {
      res.json(errorResJson(1, err))
    } else {
      res.json(successResJson(results))
    }
    conn.end()
  })
})

/**
 * @param startDate 'YYYY-MM-DD'
 * @param endDate 'YYYY-MM-DD'
 * @description startDate <= endDate
 */
app.get('/homepageViews', (req, res) => {
  let startDate = ''
  let endDate   = ''
  if ( !homepageViews_params_isValid(req) ) { return }
  startDate = req.query.startDate
  endDate   = req.query.endDate
  let currentDate = startDate
  let selectCondition = ''
  const conn = connect()
  while ( !dayjs(currentDate).isAfter(endDate) ) {
    if ( currentDate === startDate ) {
      selectCondition += `home_views_date = '${currentDate}' `
    } else {
      selectCondition += `OR home_views_date = '${currentDate}'`
    }
    currentDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD')
  }
  conn.query(
    `SELECT * FROM lc_home_views WHERE ${selectCondition}`,
    (err, results) => {
      if (err) {} 
      else {
        const _res = []
        results.map((x) => {
          _res.push({
            date : dayjs(x.home_views_date).format('YYYY-MM-DD'),
            views: x.home_views_amount
          })
        })
        res.json(successResJson(_res))
      }
      conn.end()
    }
  )
})

function homepageViews_params_isValid (req) {
  if ( !req.query.startDate || !req.query.endDate ) {
    res.json(errorResJson(1, 'startDate 和 endDate 必须有效'))
    return false
  } else if ( dayjs(req.query.startDate).isAfter(dayjs(req.query.endDate)) ) {
    res.json(errorResJson(1, '开始时间必须早于结束时间'))
    return false
  } else {
    return true
  }
}

app.get('/updateViews', (req, res) => {
  const currentDay = dayjs().format('YYYY-MM-DD')
  const conn = connect()
  conn.query(`SELECT * FROM lc_home_views WHERE home_views_date = '${currentDay}'`, (err, results1) => {
    if (err) {
      res.json(errorResJson(1, err))
    } else {
      const views = results1[0].home_views_amount + 1 
      conn.query(`UPDATE lc_home_views set home_views_amount = ${views} where home_views_date = '${currentDay}'`, (err, results2) => {
        if (err) {
          res.json(errorResJson(1, err))
        } else {
          res.json(successResJson(results2))
        }
        conn.end()
      })
    }
  })
})

const server = app.listen(3000, () => {
  const host = server.address().address
  const port = server.address().port

  console.log("light-community server is listening at http://%s:%s", host, port)
})