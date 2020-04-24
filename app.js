var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
// SDK de Mercado Pago
const mercadopago = require('mercadopago');
var app = express();
dotenv.config();
// Agrega credenciales
mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN
});
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/failure', function (req, res) {

    res.render('failure');
});
app.get('/pending', function (req, res) {

    res.render('pending');
});
app.get('/approved', function (req, res) {

    res.render('approved');
});

app.post('/payment-process', function (req, res) {
    var image_url = req.protocol + '://' + req.get('host') +req.body.img.substring(1);
    console.log(image_url)
    var item = { 
        id: "1234",
        title: req.body.title,
        unit_price: parseFloat(req.body.price),
        description: "Dispositivo móvil de Tienda e-commerce",
        picture_url: image_url,
        quantity:1,
    };
    //En este caso los datos del pagador etan hardcodeados pero se deberían obtener desde una base de datos o mediante el formulario.
    var payer = {
        name: "Lalo",
        surname:"Landa",
        identification: { type: "DNI", number: "22333444" },
        email: "test_user_63274575@testuser.com",
        phone: { area_code: "011", number: 22223333 },
        address: { zip_code: "1111", street_name: "Falsa", street_number: 123 }
    };
    var external_reference = 'ABCD1234';
    var fullUrl = req.protocol + '://' + req.get('host') + '/notifications';

    //back urls
    var s = req.protocol + '://' + req.get('host') + '/success';
    var p = req.protocol + '://' + req.get('host') + '/pending';
    var f = req.protocol + '://' + req.get('host') + '/failure';
    // Crea un objeto de preferencia
    let preference = {
        items: [
            item
        ],
        payer: payer,
        external_reference: external_reference,
        payment_methods: { excluded_payment_methods: [{ id: 'amex' }, { id: 'atm' }], installments: 6 },
        notification_url: fullUrl,
        back_urls:{
            success:s,
            pending:p,
            failure:f
        },
        redirect_urls:{
            success:s,
            pending:p,
            failure:f
        },
        auto_return:"approved"

    };
    console.log(fullUrl)
    mercadopago.preferences.create(preference).then((response) => {
        res.render('detail', {id:response.body.id, price:req.body.price, title:req.body.title, img:req.body.img});
        // res.status(200).send(response.body);
        console.log(response.body)
    }).catch((error) => {
        console.log(error)
        res.status(500).send(error);
    });

});


app.post('/notifications', (req,res)=>{
    var topic =req.body.topic;
    var id= req.body.id;
    //aca podemos procesar los datos recibidos;
    res.status(200).send('OK');
})

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(process.env.PORT || 3000);