var $$ = Dom7;
var myDB;
myApp = new Framework7({
    material: true, //Activamos Material
    swipePanel: 'left' //Activamos la acción slide para el menú
});
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    domCache: true //Activamos el DOM cache, para pages inline
});
var app = {
    /*
    Esta función initialize la llamamos desde index.html al final del documento,
    cuando esto se ejecute lanzará deviceready y su correspondiente función "init".
    */
    initialize: function() {
        document.addEventListener("deviceready", this.init, false);

    },
    init: function() {
        myApp.addNotification({
                                message: '0Ha ocurrido un problema durante el registro.',
                                hold: 4000})
        myDB = window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myApp.addNotification({
                                message: '1Ha ocurrido un problema durante el registro.',
                                hold: 4000})
        myDB.transaction(function(transaction) {
            transaction.executeSql('CREATE TABLE IF NOT EXISTS contacto (id integer primary key, nombre text, apellidos text, email text, horas integer)', [],
            function(tx, result) {
                myApp.addNotification({
                                message: '2Ha ocurrido un problema durante el registro.',
                                hold: 4000})
            },
            function(error) {
                myApp.addNotification({
                                message: '3Ha ocurrido un problema durante el registro.',
                                hold: 4000})
            });
        });

    }
};
myApp.onPageInit("nuevoContacto", function(){
    $$('#nuevoContactoButton').on('click', function(event){
        alert("HOLI");
        event.preventDefault();
        //var formData = myApp.formToData('#nuevoContactoForm');
        //alert(JSON.stringify(formData));
        var nombre = $("#nombre").val();
        var apellidos = $("#apellidos").val();
        var email = $("#email").val();
        var horas = $("#horas").val();
        myDB.transaction(function(transaction) {
            var executeQuery = "INSERT INTO contacto (nombre, apellidos, email, horas) VALUES (?,?,?,?)";
            transaction.executeSql(executeQuery, [nombre, apellidos, email, horas]
                , function(tx, result) {
                },
                function(error){
                    //filter(function(aSome) {alert('Error occurred');
                });
            });
        });

    });
