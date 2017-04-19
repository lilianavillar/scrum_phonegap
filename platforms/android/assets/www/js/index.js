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
                              '<a class="bg-green" href="#">Modificar</a>'+
                              '<a href="#" class="swipeout-delete"'+
                              '>Delete</a>'+
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
    });
});
