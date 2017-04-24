package org.scrum;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.ListView;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.JsonHttpResponseHandler;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.scrum.util.Bug;
import org.scrum.util.BugAdapter;

import java.util.ArrayList;
import java.util.List;

import cz.msebera.android.httpclient.Header;

public class BugsListActivity extends AppCompatActivity {

    private List<Bug> bugsList;
    private ListView listView;
    private CoordinatorLayout coordinator;
    private String sprintName;
    private String sprintPasswd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bugs_list);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        this.listView = (ListView) findViewById(R.id.bugsList);
        this.coordinator = (CoordinatorLayout) findViewById(R.id.coordinatorBugsList);

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });

        Intent intent= this.getIntent();
        if (intent.hasExtra("items")){
            String[] valores = intent.getExtras().getStringArrayList("items").get(0).toString().split("@");
            this.sprintName = valores[0];
            this.sprintPasswd = valores[1];
        }

        crearBugsList();
    }

    private void crearBugsList() {

        bugsList = new ArrayList<Bug>();
        AsyncHttpClient client = new AsyncHttpClient();

        client.get("https://appscrum.herokuapp.com/bugs/" + sprintName, new JsonHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, JSONArray response) {
                if(response.length() >= 1){
                    try {
                        JSONObject objeto = (JSONObject) response.get(0);
                        if(objeto.has("bugs")){
                            JSONArray bugs = objeto.getJSONArray("bugs");
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
