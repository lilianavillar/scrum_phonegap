package org.scrum.util;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Environment;
import android.support.design.widget.Snackbar;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.google.gson.Gson;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import org.scrum.R;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
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
        ImageView imageView = (ImageView) rowView.findViewById(R.id.imageBug);

        Bug bug = this.bugs.get(position);
        titulo.setText("Título: " + bug.getTitulo().toString());
        descripcion.setText("Descripcion: " + bug.getDescripcion().toString());
        estado.setText("Estado: " + bug.getEstado().toString());
        prioridad.setText("Prioridad: " + bug.getPrioridad());
        estimacion.setText("Estimación: " + bug.getEstimacion());

        Gson gson = new Gson();
        String json = gson.toJson(bug);

        Bitmap imagen = createQR(json.toString());
        saveImage(imagen,  bug.getTitulo().toString());
        imageView.setImageBitmap(imagen);

        return rowView;
    }

    private Bitmap createQR(String text) {
        QRCodeWriter writer = new QRCodeWriter();
        try {
            BitMatrix bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, 128, 128);
            int width = bitMatrix.getWidth();
            int height = bitMatrix.getHeight();
            Bitmap bmp = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    bmp.setPixel(x, y, bitMatrix.get(x, y) ? Color.BLACK : Color.WHITE);
                }
            }
            return bmp;
        } catch (WriterException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void saveImage(Bitmap ImageToSave, String titulo) {
        String file_path = Environment.getExternalStorageDirectory().getAbsolutePath() + "/bugs";
        File dir = new File(file_path);

        if (!dir.exists()) {
            dir.mkdirs();
        }

        File file = new File(dir, titulo + ".jpg");

        try {
            FileOutputStream fOut = new FileOutputStream(file);

            ImageToSave.compress(Bitmap.CompressFormat.JPEG, 85, fOut);
            fOut.flush();
            fOut.close();
            makeSureFileWasCreatedThenMakeAvabile(file);
            galleryAddPic(file_path + "/" + titulo + ".jpg");
        }

        catch(FileNotFoundException e) {

        }
        catch(IOException e) {
        }

    }

    private void galleryAddPic(String path) {
        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
        File f = new File(path);
        Uri contentUri = Uri.fromFile(f);
        mediaScanIntent.setData(contentUri);
        context.sendBroadcast(mediaScanIntent);
    }

    private void makeSureFileWasCreatedThenMakeAvabile(File file){
        MediaScannerConnection.scanFile(context,
            new String[] { file.toString() } , null,
            new MediaScannerConnection.OnScanCompletedListener() {
                public void onScanCompleted(String path, Uri uri) {
                }
            });
    }
}
