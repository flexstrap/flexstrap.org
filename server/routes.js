module.exports = (server) => {

  server.get('/grid', (req, res) => {

    res.render('grid', {layout: 'layouts/main'})

  })

  server.get('/', (req, res) => {

    res.render('home', {layout: 'layouts/main'})

  })

}
