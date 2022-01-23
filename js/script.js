/*****************************
*    VARIABLES GLOBALES      * 
* ****************************/

let totalPedido = 0;
let carrito = [];
let stockComidas = [];


/*****************************
*       FUNCIONES            * 
* ****************************/

//Función para la carga de productos
function cargarProductos(){

    //Recorrido de array y colocación de elementos en html
    stockComidas.forEach((comida, indice) =>{
        $('#productos').append(`
        <div class="col tarjetasProductos">
            <div class="card mb-3" style="width: 18rem;">
                    <img src="./img/loading.gif" class="loading">
                    <img src="${comida.img}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">${comida.nombre}</h5>
                    <p class="card-text">${comida.descripcion}</p>
                    <button class="btn btn-primary btnProd" id="producto${indice}">$ ${comida.precio}</button>
                </div>
            </div>
        </div>
        `)

        // Animación que simula cargar los productos en la web
        $('.card-img-top').on('load', function (){
            $(this).hide();

            setTimeout(() => {
                $(this).show()
                $('.loading').hide()
            }, 2000);
        })

        $(`#producto${indice}`).click( () => {
            agregarComida(comida.id);
        })
    })
}

// Función que habilita comprar si hay productos en el carrito
function habilitarCarrito(){
    if(carrito.length == []){
        $('.btnCompra').prop('disabled', true);
    } else {
        $('.btnCompra').prop('disabled', false);
    }
}

//Función que agrega el producto que el usuario selecciona
function agregarComida(id){
    let agregado = carrito.find(elemento => elemento.id == id);

    if(agregado){
        agregado.cantidad = agregado.cantidad + 1;
        actualizoAviso();
        comprar();
        habilitarCarrito();
        localStorage.setItem('carrito', JSON.stringify(carrito))

    } else{
        let agregaComida = stockComidas.find(comida => comida.id == id);
        carrito.push(agregaComida);
        actualizoAviso();
        comprar(agregaComida);
        habilitarCarrito();
        localStorage.setItem('carrito', JSON.stringify(carrito))
    }
}

//Función que actualiza cada vez que se agrega o quita un producto (ícono bolsa de compra)
function actualizoAviso(){
    $('#avisoCompra').text(carrito.reduce((acc, elem) => acc + elem.cantidad,0));
}

//Función que muestra los productos en el carrito y permite eliminarlos
function comprar(){
        $('#tablaProductos').empty();
        
        $('#tablaProductos').html(`
        <tr>
              <td>Producto</td>
              <td>Cantidad</td>
              <td>Precio U.</td>
              <td> </td>
        </tr>
        `);

        carrito.forEach((comida) =>{
            $('#tablaProductos').append(`
                <tr id="comida${comida.id}">
                    <td>${comida.nombre}</td>
                    <td id="cantidad${comida.id}">${comida.cantidad}</td>
                    <td>$ ${comida.precio}</td>
                    <td><button class="btn" id="eliminar${comida.id}"><i class="fas fa-trash"></i> </button></td>
                </tr>
            `);

            totalPedido = carrito.reduce((acc, el) => acc + (el.precio * el.cantidad), 0)
            document.getElementById('totalCompra').innerHTML = `Total: $${totalPedido}`

            //Evento que elimina productos del carrito
            $(`#eliminar${comida.id}`).click(()=>{
                if(comida.cantidad == 1){
                    $(`#comida${comida.id}`).empty()
                    carrito = carrito.filter(elemento => elemento.id != comida.id);
                    totalPedido = carrito.reduce((acc, el) => acc + (el.precio * el.cantidad), 0)
                    actualizoAviso();
                } else{
                    comida.cantidad = comida.cantidad - 1;
                    $(`#cantidad${comida.id}`).empty();
                    $(`#cantidad${comida.id}`).append(`<td>${comida.cantidad}</td>`)
                    totalPedido = carrito.reduce((acc, el) => acc + (el.precio * el.cantidad), 0)
                    actualizoAviso();
                }

                if(carrito.length == []){
                    $(`#comida${comida.id}`).remove();
                    $('#tablaProductos').empty();
                    $('#tablaProductos').append(`
                        <tr>
                        <td> </td>
                        <td>Tu carrito está vacío</td>
                        <td> </td>
                        </tr>
                    `)
                }
                document.getElementById('totalCompra').innerHTML = `Total: $${totalPedido}`
                habilitarCarrito();
                localStorage.setItem('carrito', JSON.stringify(carrito))
                
            })
        });
}

//Función que trae todo el pedido si no se realizó la compra.
function recuperarLocalStorage(){
    let carritoStorage = JSON.parse(localStorage.getItem('carrito'));

    if(carritoStorage){
        carritoStorage.forEach(producto =>{
            carrito.push(producto);
            comprar(producto);
            actualizoAviso();
            habilitarCarrito();
        })
    }
}

//Función que valida los datos ingresado para el pago
function validarFormularioDatos(){
    let nombre = document.getElementById('nombreForm').value
    let celular = document.getElementById('celularForm').value
    let correo = document.getElementById('mailForm').value
    let domicilio = document.getElementById('domicilioForm').value
    let tarjeta = document.getElementById('nroTarjeta').value
    let vencimientoTarjeta = document.getElementById('vtoTarjeta').value
    let codigo = document.getElementById('cvc').value
    let nombreTitular = document.getElementById('nombreTitular').value
    let formularioDePago = document.getElementById('formularioDePago')

    if(nombre == "" || (celular  == "" || !Number(celular)) || correo == "" || domicilio == "" || (tarjeta == "" || !Number(tarjeta)) || (vencimientoTarjeta == "" || !Number(vencimientoTarjeta)) || (codigo == "" || !Number(codigo)) || nombreTitular == ""){
        compraError();
    } else {
        compraOK();
        $('#tablaProductos').empty();
        $('#totalCompra').empty();
        $('#tablaProductos').append(`
                        <tr>
                        <td> </td>
                        <td>Tu carrito está vacío</td>
                        <td> </td>
                        </tr>
        `);
        carrito = [];
        localStorage.clear();
        actualizoAviso();
        habilitarCarrito();
    }

    formularioDePago.reset();
}

//Funciones para alertar si el usuario ingresó bien o no los datos en el formulario
function compraOK(){
    swal({
        title: "Gracias por tu compra!",
        text: `Ya estamos preparando todo!\n El código de tu pedido es: ${codigoAleatorio(5)}`,
        icon: "success",
        button: "Aceptar",
      });
}

function compraError(){
    swal({
        title: "Algún dato es erróneo o está incompleto",
        icon: "error",
        button: "Aceptar",
      });
}

// Función que genera un código aleatorio para cuando se realiza el pago.
function codigoAleatorio(num){
    let resultado = Math.random().toString(36).substring(num);
    return(resultado);
}



/*****************************
*          EVENTOS           * 
* ****************************/

//Evento para realizar la compra
$('#btn-comprar').click(()=>{
        $('.misCompras').hide();
        $('#detalleDeCompra').empty();
        $('.box3').empty()
        carrito.forEach(producto =>{
            $('#detalleDeCompra').append(`
                <p>${producto.nombre}</p>
                <p class="cantProd">${producto.cantidad}</p>
                <p>$ ${producto.precio}</p>
                `)
            
        })
        $('.box3').append(`<p>Total a pagar: $${totalPedido}`);
       
})

//Evento finalización del pedido
$('#pagar').click(()=>{
    validarFormularioDatos();
})

// Evento con animación que muestra el carrito al hacer click en el ícono
$('#btnMuestraCompra').click(() =>{
    $('.misCompras').fadeIn(500);
});

// Evento con animación que cierra el carrito al hacer click en el ícono
$('#closeCart').click(() =>{
    $('.misCompras').fadeOut(500);
});



/*****************************
*       EJECUCIONES JS       * 
* ****************************/

$.getJSON('./js/stock.json', function(stock){
    stock.forEach(elemento => stockComidas.push(elemento));

    $(() => {
        cargarProductos();
    })
})


habilitarCarrito()
recuperarLocalStorage();
