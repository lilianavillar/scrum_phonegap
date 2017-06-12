package org.scrum;

import android.app.DialogFragment;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v7.widget.Toolbar;
import android.text.TextUtils;
import android.view.View;
import android.widget.ListView;

import com.google.gson.Gson;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.JsonHttpResponseHandler;

import org.apache.cordova.CordovaActivity;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.scrum.util.Bug;
import org.scrum.util.BugAdapter;

import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import cz.msebera.android.httpclient.Header;
import cz.msebera.android.httpclient.entity.StringEntity;

public class BugsMasterListActivity extends CordovaActivity{
    
    private List<Bug> bugsList;
    private ListView listView;
    private CoordinatorLayout coordinator;
    private String contrasenia;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bugs_master_list);
        Intent intent = this.getIntent();
        if (intent.hasExtra("items")){
            this.contrasenia = intent.getExtras().getStringArrayList("items").get(0).toString();
        }
        this.listView = (ListView) findViewById(R.id.masterBugsList);
        this.coordinator = (CoordinatorLayout) findViewById(R.id.coordinatorBugsMasterList);
        try {
            crearBugsList();
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        setResult(RESULT_OK, intent);

    }

    private void crearBugsList() throws JSONException, UnsupportedEncodingException {

        bugsList = new ArrayList<Bug>();

        final SQLiteDatabase db =  openOrCreateDatabase("mySQLite.db", MODE_PRIVATE, null);
        int numero = (int) (Math.random() *5) + 1;
        Cursor c = db.rawQuery("SELECT * FROM bug ORDER BY prioridad ASC LIMIT " + numero, null);
        JSONArray allBugs = cur2Json(c);
        //Aquí habría que hacer el procesamiento para elegir los bugs
        //de momento se seleccionan un numero aleatorio de bugs y se seleccionan los más prioritarios.
        //Mostramos por pantalla los bugs que van a formar parte del SPRINT
        Bug[] mcArray = new Gson().fromJson(allBugs.toString(), Bug[].class);
        bugsList = Arrays.asList(mcArray);
        listView.setAdapter(new BugAdapter(getApplicationContext(), bugsList));
        AsyncHttpClient client = new AsyncHttpClient();

        //Creamos el objeto SPRINT
        SimpleDateFormat timeStampFormat = new SimpleDateFormat("MMddHHmm");
        Date myDate = new Date();
        String hoy = timeStampFormat.format(myDate);
        JSONObject jsonObj = new JSONObject();
        jsonObj.put("inicio", hoy);
        jsonObj.put("nombre", "Sprint" + hoy);
        jsonObj.put("passwd", contrasenia);
        jsonObj.put("bugs", allBugs);

        //Se cambia el titulo de la activity
        Toolbar mActionBarToolbar = (Toolbar) findViewById(R.id.masterBugsToolbar);
        mActionBarToolbar.setTitle("Sprint" + hoy);
        //setSupportActionBar(mActionBarToolbar);
        //getSupportActionBar().setTitle("Sprint" + hoy);


        StringEntity entity = new StringEntity(jsonObj.toString());
        client.post(this, "https://appscrum.herokuapp.com/sprints", entity, "application/json", new JsonHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, JSONObject response) {
                try {
                    //Eliminamos los bugs que han entrado en el Sprint de la pila de producto
                    borrarBugsFromPilaProducto(db);
                    db.close();
                    //Notificación
                    Snackbar bar = Snackbar.make(coordinator, "El sprint se ha creado con éxito.", Snackbar.LENGTH_LONG);
                    bar.show();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onFailure(int statusCode, Header[] headers, Throwable throwable, JSONObject errorResponse) {
                super.onFailure(statusCode, headers, throwable, errorResponse);
                //Notificación
                Snackbar bar = Snackbar.make(coordinator, "Error al crear el sprint.", Snackbar.LENGTH_LONG)
                    .setAction("CLOSE", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                        }
                    });
                bar.show();
            }
        });
    }

    private void borrarBugsFromPilaProducto(SQLiteDatabase db) {
        String[] ids = new String[bugsList.size()];
        for(int i = 0; i<bugsList.size(); i++){
            ids[i] = String.valueOf(bugsList.get(i).getId());
        }
        String idsCSV = TextUtils.join(",", ids);
        db.delete("bug", "id IN (" + idsCSV + ")", null);
    }

    public JSONArray cur2Json(Cursor cursor) {

        JSONArray resultSet = new JSONArray();
        cursor.moveToFirst();
        while (cursor.isAfterLast() == false) {
            int totalColumn = cursor.getColumnCount();
            JSONObject rowObject = new JSONObject();
            for (int i = 0; i < totalColumn; i++) {
                if (cursor.getColumnName(i) != null) {
                    try {
                        rowObject.put(cursor.getColumnName(i),
                                cursor.getString(i));
                    } catch (Exception e) {
                    }
                }
            }
            resultSet.put(rowObject);
            cursor.moveToNext();
        }

        cursor.close();
        return resultSet;
    }

}
