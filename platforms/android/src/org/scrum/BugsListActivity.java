package org.scrum;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.media.MediaScannerConnection;
import android.os.Bundle;
import android.os.Environment;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.ListView;
import android.widget.ProgressBar;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.JsonHttpResponseHandler;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.scrum.util.Bug;
import org.scrum.util.BugAdapter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import cz.msebera.android.httpclient.Header;

public class BugsListActivity extends AppCompatActivity {

    private static final int PERMISO_EXTERNAL = 1 ;
    private List<Bug> bugsList;
    private ListView listView;
    private CoordinatorLayout coordinator;
    private String sprintName;
    private String sprintPasswd;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bugs_list);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        this.listView = (ListView) findViewById(R.id.bugsList);
        this.coordinator = (CoordinatorLayout) findViewById(R.id.coordinatorBugsList);
        this.progressBar = (ProgressBar) findViewById(R.id.cargandoLista);

        if (ContextCompat.checkSelfPermission(this,  Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {

            } else {
                ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.WRITE_EXTERNAL_STORAGE}, PERMISO_EXTERNAL);
            }
        }

        Intent intent= this.getIntent();
        if (intent.hasExtra("items")){
            String[] valores = intent.getExtras().getStringArrayList("items").get(0).toString().split("@");
            this.sprintName = valores[0];
            this.sprintPasswd = valores[1];
        }
        crearBugsList();

    }

    @Override
    public void onRequestPermissionsResult(int requestCode,String permissions[], int[] grantResults) {
        switch (requestCode) {
            case PERMISO_EXTERNAL: {
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                }
            }
        }
    }

    private void crearBugsList() {

        bugsList = new ArrayList<Bug>();
        AsyncHttpClient client = new AsyncHttpClient();
        client.get("https://appscrum.herokuapp.com/bugs/" + sprintName, new JsonHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, JSONArray response) {
                if(response.length() >= 1){
                    try {
                        JSONObject respuesta = (JSONObject) response.get(0);
                        if(respuesta.has("bugs")){
                            JSONArray bugs = respuesta.getJSONArray("bugs");
                            for (int i=0; i<bugs.length();i++){
                                Bug bug = new Bug();
                                bug.setTitulo(bugs.getJSONObject(i).getString("titulo"));
                                bug.setDescripcion(bugs.getJSONObject(i).getString("descripcion"));
                                bug.setEstado(bugs.getJSONObject(i).getString("estado"));
                                bug.setEstimacion(bugs.getJSONObject(i).getInt("estimacion"));
                                bug.setPrioridad(bugs.getJSONObject(i).getInt("prioridad"));
                                bugsList.add(bug);
                            }
                            BugAdapter adapter = new BugAdapter(getApplicationContext(), bugsList);
                            listView.setAdapter(adapter);
                            progressBar.setVisibility(View.GONE);
                        }

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }
            @Override
            public void onFailure(int statusCode, Header[] headers, Throwable throwable, JSONObject errorResponse) {
                Snackbar bar = Snackbar.make(coordinator, "Error al conectarse con la base de datos.", Snackbar.LENGTH_LONG)
                        .setAction("CLOSE", new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                            }
                        });
                bar.show();
            }
        });
    }



}
