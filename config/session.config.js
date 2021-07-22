const session = require('express-session')
const MongoStore = require('connect-mongo')

module.exports = app => {
//PARA GESTIONAR LA SEGURIDAD EN HEROKU.COM 
app.set("trusty proxy", 1)


// INSERTAR LA SESIÓN
//SE PUEDE USAR COOKIE SIN EL SECRET TAMBIÉN
//ES DOBLE SEGURIDAD...MI PALABRA SECRETA ESTA EN EL .ENV
app.use(
    session({
        secret: process.env.SESS_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {     //si estoy haciendo el login con password necesito verificar si viene del local o heroku
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 600000
      },
      store: MongoStore.create({
          mongoUrl: process.env.MONGODB_URI
      })
    })
  )
}
