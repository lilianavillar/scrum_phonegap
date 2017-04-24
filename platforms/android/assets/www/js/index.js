    var $$ = Dom7;
    var myDB;
    var emailCorporativo = null;
    myApp = new Framework7({
        material: true, //Activamos Material
        swipePanel: 'left', //Activamos la acción slide para el menú
        pushState: true,
        init: false
    });
    var mainView = myApp.addView('.view-main', {
        dynamicNavbar: true,
        domCache: true //Activamos el DOM cache, para pages inline
    });

    myApp.onPageInit("index", function(){
        $('#menuIcon').hide();
        $$('#masterButton').on('click', function(event){
            mainView.router.loadPage({pageName: 'bugs', ignoreCache: true, force: true});
            $('#menuIcon').show();
        });
        $$('#iniciarSesionButton').on('click', function(event){
            event.preventDefault();
            var email = document.getElementById("emailInicio").value;
            var nombre = document.getElementById("sprintInicio").value;
            var paswd = document.getElementById("passwdInicio").value;
            if(!email || !nombre || !passwd){
                alert("Debe rellenar todos los datos");
            } else {
            var dataForm = $('#inicioForm').serialize();
            $.ajax({
                url: 'https://appscrum.herokuapp.com/login',
                type: 'POST',
                dataType: 'json',
                data: dataForm,
                success: function(data){
                    console.log(data);
                    if(data == null){
                        myApp.addNotification({
                        message: 'Los datos no corresponden a ningún sprint',
                        hold: 4000});
                    }
                    else{
                        //El email corporativo que ha iniciado sesión, debemos pasarlo a android
                        //para poder asignarle los bugs cuando los escane

                        HybridBridge.addItem(nombre + "@" + passwd, "org.scrum.BugsListActivity", function(){console.log("Hybrid Bridge Success")},function(e){console.log("Hybrid Bridge Error" + e)});
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log("ERROR");
                    console.log(jqXHR.status + "\n" + textStatus + "\n" + errorThrown);
                    myApp.addNotification({
                        message: 'Ha ocurrido un problema verificando los datos de acceso.',
                        hold: 4000})
                }
            });
            }
        });
    });

    myApp.init();

    myApp.onPageInit("bugs", function(){
        $$('#irNuevoBugButton').on('click', function(event){
            mainView.router.loadPage({pageName: 'nuevoBug', ignoreCache: true, force: true});
        });
        $$('#iniciarSprintButton').on('click', function(event){
            HybridBridge.addItem(null, "org.scrum.BugsMasterListActivity", function(){console.log("Hybrid Bridge Success")},function(e){console.log("Hybrid Bridge Error" + e)});
        });
    });
    myApp.onPageBeforeAnimation("bugs", function(){
       cargarBugs();
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
           myDB.transaction(function(transaction) {
                transaction.executeSql('CREATE TABLE IF NOT EXISTS bug (id integer primary key, titulo text, descripcion text, estado text, prioridad integer, estimacion integer, horas integer, miembro_id integer, FOREIGN KEY(miembro_id) REFERENCES contacto(id))', [],
                function(tx, result) {
                },
                function(error) {
                });
            });
            myDB.transaction(function(transaction) {
                transaction.executeSql('CREATE TABLE IF NOT EXISTS passwd (passwd text)', [],
                function(tx, result) {
                },
                function(error) {
                });
            });
            myDB.transaction(function(transaction) {
                transaction.executeSql('SELECT * FROM passwd', [],
                    function (tx, results) {
                        //Se obtienen los valores del contacto a actualizar
                        passwdActual = results.rows.item(0).passwd;
                        //Se muestran en el formulario de editar contacto
                        document.getElementById("passwd").value = passwdActual;
                    },
                    function(error){
                        myApp.addNotification({ message: 'Ha ocurrido un error al conectarse con la base de datos', hold: 2000});
                    });
                });
            cargarBugs();
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
        },
        eliminarBug: function(email){
            myDB.transaction(function(transaction) {
            transaction.executeSql('DELETE FROM bug WHERE id=?', [email],
                function (tx, results) {
                    myApp.addNotification({ message: 'Bug eliminado con éxito.', hold: 2000});
                },
                function(error){
                    myApp.addNotification({ message: 'Ha ocurrido un error al eliminar el bug.', hold: 2000});
                });
            });
        },
        modificarBug: function(id){
            var tituloActual;
            var descripcionActual;
            var estimacionActual;
            var prioridadActual;
            myDB.transaction(function(transaction) {
            transaction.executeSql('SELECT * FROM bug WHERE id=?', [id],
                function (tx, results) {
                    //Se obtienen los valores del contacto a actualizar
                    tituloActual = results.rows.item(0).titulo;
                    descripcionActual = results.rows.item(0).descripcion;
                    estimacionActual = results.rows.item(0).estimacion;
                    prioridadActual = results.rows.item(0).prioridad;
                    //Se muestran en el formulario de editar contacto
                    document.getElementById("editarTituloBug").value = tituloActual;
                    document.getElementById("editarDescripcionBug").value = descripcionActual;
                    document.getElementById("editarPrioridadBug").value = prioridadActual;
                    document.getElementById("editarHorasBug").value = estimacionActual;
                    document.getElementById("editarBugButton").name = results.rows.item(0).id;

                    mainView.router.loadPage({pageName: 'editarBug' , ignoreCache: true, force: true});
                },
                function(error){
                    myApp.addNotification({ message: 'Ha ocurrido un error al conectarse con la base de datos', hold: 2000});
                });
             });
        },
        verBug: function(id){
              myDB.transaction(function(transaction) {
              transaction.executeSql('SELECT * FROM bug WHERE id=?', [id],
                  function (tx, results) {
                      //Se muestran en el formulario de editar contacto
                      document.getElementById("verTituloBug").value = results.rows.item(0).titulo;
                      document.getElementById("verDescripcionBug").value = results.rows.item(0).descripcion;
                      document.getElementById("verPrioridadBug").value = results.rows.item(0).estimacion;
                      document.getElementById("verHorasBug").value =results.rows.item(0).prioridad;
                      mainView.router.loadPage({pageName: 'verBug' , ignoreCache: true, force: true});
                  },
                  function(error){
                      myApp.addNotification({ message: 'Ha ocurrido un error al conectarse con la base de datos', hold: 2000});
                  });
               });
          }
    };

    function cargarBugs(){
        var listItems = [];
       myDB.transaction(function(transaction) {
           transaction.executeSql('SELECT * FROM bug', [], function (tx, results) {
               var len = results.rows.length, i;
               for (i = 0; i < len; i++){
                   listItems.push({
                       id: results.rows.item(i).id,
                       titulo: results.rows.item(i).titulo,
                       descripcion: results.rows.item(i).descripcion,
                       estado: results.rows.item(i).estado,
                       prioridad: results.rows.item(i).prioridad,
                       estimacion: results.rows.item(i).estimacion,
                       horas: results.rows.item(i).horas,
                       miembro: results.rows.item(i).miembro
                   });
               }
               myApp.virtualList('#bugsList', {
                       // Array with items data
                       items: listItems,
                       // Template 7 template to render each item
                       template: '<li class="swipeout">'+
                             '<div class="swipeout-content">'+
                                 '<a onclick="app.verBug(\'{{id}}\');" class="item-link item-content">'+
                                     '<div class="item-inner">'+
                                         '<div class="item-title">{{titulo}} {{estado}} - {{prioridad}} </div>'+
                                         '<div class="item-after"><span class="badge">{{estimacion}}h</span></div>'+
                                     '</div>'+
                                 '</a>'+
                             '</div>'+
                             '<div class="swipeout-actions-right">'+
                                 '<a class="bg-green" onclick="app.modificarBug(\'{{id}}\');">Editar</a>'+
                                 '<a onclick="app.eliminarBug(\'{{id}}\');" class="swipeout-delete"'+
                                 '>Borrar</a>'+
                             '</div>'+
                         '</li>'
                   });
           }, null);
       });
    }

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
                                transaction.executeSql(executeQuery, [nombre, apellidos, email, horas],
                                function(tx, result) {
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
                    }
                );
            });
        });
    });

    myApp.onPageInit("editarContacto", function(){
        $$('#editarContactoButton').on('click', function(event){
            event.preventDefault();
            var nombre = $("#editarNombre").val();
            var apellidos = $("#editarApellidos").val();
            var email = $("#editarEmail").val();
            var horas = $("#editarHoras").val();

            myDB.transaction(function(transaction) {
                var executeQuery = "UPDATE contacto SET nombre=?, apellidos=?, horas=? WHERE email=?";
                transaction.executeSql(executeQuery, [nombre, apellidos, horas, email],
                function(tx, result) {
                    myApp.addNotification({ message: 'Se ha editado el con éxito', hold: 2000});
                    mainView.router.loadPage({pageName: 'contactos', ignoreCache: true, force: true});
                },
                function(error){
                    myApp.addNotification({ message: 'Ha ocurrido un error al editar el contacto', hold: 2000});
                });
            });

        });
    });

    myApp.onPageBeforeAnimation("nuevoBug", function(){
         $$('#nuevoBugForm')[0].reset();
         document.getElementById("prioridadBug").value = 0;
         document.getElementById("horasBug").value = 1;
    });

    myApp.onPageInit("nuevoBug", function(){
        $$('#nuevoBugButton').on('click', function(event){
            event.preventDefault();

            var titulo = $("#tituloBug").val();
            var descripcion = $("#descripcionBug").val();
            var prioridad = $("#prioridadBug").val();
            var estimacion = $("#horasBug").val();
            var estado = "Pendiente";
            var horas= 0;

            myDB.transaction(function(transaction) {
                var executeQuery = "INSERT INTO bug (titulo, descripcion, estado, prioridad, estimacion, horas) VALUES (?,?,?,?,?,?)";
                transaction.executeSql(executeQuery, [titulo, descripcion, estado, prioridad, estimacion, horas],
                function(tx, result) {
                    myApp.addNotification({ message: 'Nuevo bug añadido con éxito', hold: 2000});
                    mainView.router.loadPage({pageName: 'bugs', ignoreCache: true, force: true});
                },
                function(error){
                    console.log(error);
                    myApp.addNotification({ message: 'Ha ocurrido un error al añadir el nuevo bug', hold: 2000});
                    });
            });
        });
    });

    myApp.onPageInit("editarBug", function(){
        $$('#editarBugButton').on('click', function(event){
            event.preventDefault();
            var titulo = $("#editarTituloBug").val();
            var descripcion = $("#editarDescripcionBug").val();
            var prioridad = $("#editarPrioridadBug").val();
            var horas = $("#editarHorasBug").val();
            var id = document.getElementById("editarBugButton").name;

            myDB.transaction(function(transaction) {
                var executeQuery = "UPDATE bug SET titulo=?, descripcion=?, prioridad=?, estimacion=? WHERE id=?";
                transaction.executeSql(executeQuery, [titulo, descripcion, prioridad, horas, id],
                function(tx, result) {
                    myApp.addNotification({ message: 'Se ha editado el bug con éxito', hold: 2000});
                    mainView.router.loadPage({pageName: 'bugs', ignoreCache: true, force: true});
                },
                function(error){
                    myApp.addNotification({ message: 'Ha ocurrido un error al editar el bug', hold: 2000});
                });
            });

        });
    });

    myApp.onPageBeforeAnimation("passwd", function(){
        var passwdActual;
            myDB.transaction(function(transaction) {
            transaction.executeSql('SELECT * FROM passwd', [],
                function (tx, results) {
                    //Se obtienen los valores del contacto a actualizar
                    passwdActual = results.rows.item(0).passwd;
                    //Se muestran en el formulario de editar contacto
                    document.getElementById("passwd").value = passwdActual;
                },
                function(error){
                    myApp.addNotification({ message: 'Ha ocurrido un error al conectarse con la base de datos', hold: 2000});
                });
            });
    });

    myApp.onPageInit("passwd", function(){
        $$('#nuevaPasswdButton').on('click', function(event){
            event.preventDefault();
            var passwd = $("#passwd").val();

            myDB.transaction(function(transaction) {
                transaction.executeSql('SELECT * FROM passwd', [],
                    function (tx, results) {
                        var len = results.rows.length;
                        if(len == 0){
                            myDB.transaction(function(transaction) {
                                var executeQuery = "INSERT INTO passwd (passwd) VALUES (?)";
                                transaction.executeSql(executeQuery, [passwd],
                                function(tx, result) {
                                    myApp.addNotification({ message: 'Nueva contraseña añadida con éxito', hold: 2000});
                                    mainView.router.loadPage({pageName: 'bugs', ignoreCache: true, force: true});
                                },
                                function(error){
                                    myApp.addNotification({ message: 'Ha ocurrido un error al añadir la contraseña', hold: 2000});
                                    });
                            });
                        }
                        else{
                            myDB.transaction(function(transaction) {
                                var executeQuery = "UPDATE passwd SET passwd=?";
                                transaction.executeSql(executeQuery, [passwd],
                                function(tx, result) {
                                    myApp.addNotification({ message: 'Contraseña modificada con éxito', hold: 2000});
                                    mainView.router.loadPage({pageName: 'bugs', ignoreCache: true, force: true});
                                },
                                function(error){
                                    myApp.addNotification({ message: 'Ha ocurrido un error al modificar la contraseña', hold: 2000});
                                    });
                            });
                        }
                    },
                    function(error){
                        myApp.addNotification({ message: 'Ha ocurrido un error al conectarse con la base de datos', hold: 2000});
                    }
                );
            });
        });
    });

