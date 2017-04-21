var $$ = Dom7;
var myDB;
myApp = new Framework7({
    material: true, //Activamos Material
    swipePanel: 'left', //Activamos la acción slide para el menú
     pushState: true
});
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    domCache: true //Activamos el DOM cache, para pages inline
});
var app = {
    initialize: function() {
        document.addEventListener("deviceready", this.init, false);
    },
    init: function() {
        myDB = window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myDB.transaction(function(transaction) {
            transaction.executeSql('CREATE TABLE IF NOT EXISTS contacto (id integer primary key, nombre text, apellidos text, email text, horas integer)', [],
            function(tx, result) {
            },
            function(error) {
            });
        });
    },
    eliminarContacto: function(email){
        myDB.transaction(function(transaction) {
        transaction.executeSql('DELETE FROM contacto WHERE email=?', [email],
            function (tx, results) {
                myApp.addNotification({ message: 'Contacto eliminado con éxito.', hold: 2000});
            },
            function(error){
                myApp.addNotification({ message: 'Ha ocurrido un error al eliminar el contacto.', hold: 2000});
            });
        });
    },
    modificarContacto: function(email){
        alert("VOY A MODIFICAR");
        var nombreActual;
        var apellidosActual;
        var horasActual;
        myDB.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM contacto WHERE email=?', [email],
            function (tx, results) {
                //Se obtienen los valores del contacto a actualizar
                nombreActual = results.rows.item(0).nombre;
                apellidosActual = results.rows.item(0).apellidos;
                horasActual = results.rows.item(0).horas;
                //Se muestran en el formulario de editar contacto
                document.getElementById("editarNombre").value = nombreActual;
                document.getElementById("editarApellidos").value = apellidosActual;
                document.getElementById("editarEmail").value = email;
                document.getElementById("editarHoras").value = horasActual;

                mainView.router.loadPage({pageName: 'editarContacto' , ignoreCache: true, force: true});
            },
            function(error){
                myApp.addNotification({ message: 'Ha ocurrido un error al conectarse con la base de datos', hold: 2000});
            });
         });
    }

};
myApp.onPageInit("contactos", function(){
    $$('#irNuevoContactoButton').on('click', function(event){
        mainView.router.loadPage({pageName: 'nuevoContacto', ignoreCache: true, force: true});
    });
});
myApp.onPageBeforeAnimation("contactos", function(){
    var listItems = [];
    myDB.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM contacto', [], function (tx, results) {
            var len = results.rows.length, i;
            for (i = 0; i < len; i++){
                listItems.push({
                    nombre: results.rows.item(i).nombre,
                    apellidos: results.rows.item(i).apellidos,
                    email: results.rows.item(i).email,
                    horas: results.rows.item(i).horas
                });
            }
            myApp.virtualList('#contactosList', {
                    // Array with items data
                    items: listItems,
                    // Template 7 template to render each item
                    template: '<li class="swipeout">'+
                          '<div class="swipeout-content">'+
                              '<a href="#" class="item-link item-content">'+
                                  '<div class="item-inner">'+
                                      '<div class="item-title">{{nombre}} {{apellidos}} - {{email}} </div>'+
                                      '<div class="item-after"><span class="badge">{{horas}}h</span></div>'+
                                  '</div>'+
                              '</a>'+
                          '</div>'+
                          '<div class="swipeout-actions-right">'+
                              '<a class="bg-green" onclick="app.modificarContacto(\'{{email}}\');">Editar</a>'+
                              '<a onclick="app.eliminarContacto(\'{{email}}\');" class="swipeout-delete"'+
                              '>Borrar</a>'+
                          '</div>'+
                      '</li>'
                });
        }, null);
    });
});
myApp.onPageBeforeAnimation("nuevoContacto", function(){
     $$('#nuevoContactoForm')[0].reset();
});

myApp.onPageInit("nuevoContacto", function(){
    $$('#nuevoContactoButton').on('click', function(event){
        event.preventDefault();

        var nombre = $("#nombre").val();
        var apellidos = $("#apellidos").val();
        var email = $("#email").val();
        var horas = $("#horas").val();

        //Para añadir un nuevo contacto en sqlite primero se verifica que el email no este repetido.
        myDB.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM contacto WHERE email=?', [email],
            function (tx, results) {
                var len = results.rows.length;
                if(len == 0){
                    myDB.transaction(function(transaction) {
                        var executeQuery = "INSERT INTO contacto (nombre, apellidos, email, horas) VALUES (?,?,?,?)";
                        transaction.executeSql(executeQuery, [nombre, apellidos, email, horas]
                            , function(tx, result) {
                                myApp.addNotification({ message: 'Nuevo miembro del equipo añadido con éxito', hold: 2000});
                                mainView.router.loadPage({pageName: 'contactos', ignoreCache: true, force: true});
                            },
                            function(error){
                                myApp.addNotification({ message: 'Ha ocurrido un error al añadir el nuevo miembro', hold: 2000});
                                });
                        });
                   }
                 else{
                    myApp.addNotification({ message: 'Este email ya está en uso.', hold: 2000});
                 }
            },
            function(error){
                myApp.addNotification({ message: 'Ha ocurrido un error al conectarse con la base de datos', hold: 2000});
            });
         });
    });
});

myApp.onPageInit("editarContacto", function(){
    $$('#editarContactoButton').on('click', function(event){
        event.preventDefault();

        var nombre = $("#editarNombre").val();
        var apellidos = $("#editarApellidos").val();
        var horas = $("#editarHoras").val();

        myDB.transaction(function(transaction) {
            var executeQuery = "UPDATE contacto SET nombre=?, apellidos=?, horas=?) WHERE id=?";
            transaction.executeSql(executeQuery, [nombre, apellidos, horas, id]
                , function(tx, result) {
                    myApp.addNotification({ message: 'Se ha editado el con éxito', hold: 2000});
                    mainView.router.loadPage({pageName: 'contactos', ignoreCache: true, force: true});
                },
                function(error){
                    myApp.addNotification({ message: 'Ha ocurrido un error al editar el contacto', hold: 2000});
                    });
            });

    });
});