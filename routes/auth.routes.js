const router = require("express").Router()

const bcryptjs= require("bcryptjs")
const mongoose = require("mongoose")
const User = require('./../models/User.model')





// GET - Display the signup for
router.get("/signup", (req, res) => {
  res.render("auth/signup")
})
// POST - Process form data
router.post("/signup", (req, res) => {

    const { username, password } = req.body

    if (!username || !password) {
        return res.render('auth/signup', {
            msg: "Todos los campos son obligatorios"
        })
    }
 //verifica que el password es fuerte 
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    // Si el password no cumple con las expectativas del regex
    if (!regex.test(password)) {
        return res.status(500).render("auth/signup", {
            msg: "El password debe tener 6 caracteres mínimo y debe contener al menos un número, una minúscula y una mayúscula."
        })
    }



//Encriptación
bcryptjs
    .genSalt(10)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
        return User.create({
            username,
            passwordHash: hashedPassword
        })
    }) 
    .then(usuarioCreado => {
            console.log("El usuario que creamos fue:", usuarioCreado)
            res.redirect('/userprofile')
        })
        .catch(e => {
            if (e instanceof mongoose.Error.ValidationError) {
                res.status(500).render("auth/signup", {
                    msg: "Usa un email válido"
                })
            } else if (e.code === 11000) {
                res.status(500).render("auth/signup", {
                    msg: "El usuario y el correo ya existen. Intenta uno nuevo."
                })
            }
        })
})

//GET página actual del perfil

router.get('/userprofile', (req, res) => {
    res.render("user/user-profile", { usuarioActual: req.session.usuarioActual })
})

//GET - Mostrar el formulario login

router.get("/login", (req, res) => {
    res.render("auth/login")
})

// POST - PROCESO DE AUTENTICACIÓN

router.post("/login", (req, res) => {

    console.log(req.session)

    const { username, password } = req.body


    // VALIDAR EMAIL Y PASSWORD
    if (!username || !password) {
        return res.render("auth/login", {
            msg: "Por favor ingresa usuario y password."
        })
    }
    User.findOne({ username })
        .then((usuarioEncontrado) => {

            

        // 1. EL USUARIO NO EXISTE EN BASE DE DATOS
        if (!usuarioEncontrado) {
        return res.render("auth/login", {
            msg: "El usuario no fue encontrado"
        })
    }
    const autenticacionVerificada = bcryptjs.compareSync(password, usuarioEncontrado.passwordHash)
    //2. SI EL USUARIO SE EQUIVOCÓ EN LA CONTRASEÑA
    if (!autenticacionVerificada) {
        return res.render("auth/login", {
            msg: "La contraseña es incorrecta"
        })
    }

    // 3. SI EL USUARIO COINCIDE LA CONTRASEÑA CON LA BASE DE DATOS

        //vamos a crear en nuestro objeto SESSION una propiedad nueva que se llame usuarioActual
        
        req.session.usuarioActual = usuarioEncontrado

        console.log("sesión actualidad", req.session)
        return res.redirect("/userprofile")

    
       
      })
    .catch((e) => console.log(e))
  })


  //POST - CERRAR SESIÓN

  router.post('/logout', (req, res) => {
    req.session.destroy(e => {
      if(e){
        console.log(e)
      }
      res.redirect("/")
    })
  
  })

module.exports = router