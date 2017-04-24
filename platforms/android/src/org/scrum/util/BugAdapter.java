package org.scrum.util;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import org.scrum.R;

import java.util.List;

/**
 * Created by Usuario on 24/04/2017.
 */

public class BugAdapter extends BaseAdapter{

    private Context context;
    private List<Bug> bugs;

    public BugAdapter(Context context, List<Bug> bugs) {
        this.context = context;
        this.bugs = bugs;
    }

    @Override
    public int getCount() {
        return this.bugs.size();
    }

    @Override
    public Object getItem(int position) {
        return this.bugs.get(position);
    }

    @Override
    public long getItemId(int position) {
        return this.bugs.get(position).getId();
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View rowView = convertView;
        if (convertView == null) {
            // Create a new view into the list.
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            rowView = inflater.inflate(R.layout.master_list_item, parent, false);
        }
        TextView titulo = (TextView) rowView.findViewById(R.id.itemTitulo);
        TextView descripcion = (TextView) rowView.findViewById(R.id.itemDescripcion);
        TextView estado = (TextView) rowView.findViewById(R.id.itemEstado);
        TextView prioridad = (TextView) rowView.findViewById(R.id.itemPrioridad);
        TextView estimacion = (TextView) rowView.findViewById(R.id.itemEstimacion);
        Bug bug = this.bugs.get(position);
        titulo.setText("Título: " + bug.getTitulo().toString());
        descripcion.setText("Descripcion: " + bug.getDescripcion().toString());
        estado.setText("Estado: " + bug.getEstado().toString());
        prioridad.setText("Prioridad: " + bug.getPrioridad());
        estimacion.setText("Estimación: " + bug.getEstimacion());

        return rowView;
    }
}
