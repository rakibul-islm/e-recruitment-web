package com.bd.erecruitment;

import android.Manifest;
import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

@CapacitorPlugin(
    name = "FileSaver",
    permissions = { @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "storage") }
)
public class FileSaverPlugin extends Plugin {

    @PluginMethod
    public void save(PluginCall call) {
        if (call.getString("data") == null || call.getString("filename") == null) {
            call.reject("data and filename are required");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q || getPermissionState("storage") == PermissionState.GRANTED) {
            saveNow(call);
            return;
        }
        requestPermissionForAlias("storage", call, "storagePermissionResult");
    }

    @PermissionCallback
    private void storagePermissionResult(PluginCall call) {
        if (getPermissionState("storage") == PermissionState.GRANTED) {
            saveNow(call);
        } else {
            fail(call, "Storage permission denied");
        }
    }

    private void saveNow(PluginCall call) {
        String filename = call.getString("filename");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        try {
            byte[] bytes = Base64.decode(call.getString("data"), Base64.DEFAULT);
            String uri = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? saveWithMediaStore(bytes, filename, mimeType)
                : saveToPublicDownloads(bytes, filename);
            toast("Saved to Downloads: " + filename);
            JSObject result = new JSObject();
            result.put("uri", uri);
            call.resolve(result);
        } catch (Exception e) {
            fail(call, e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        }
    }

    private String saveWithMediaStore(byte[] bytes, String filename, String mimeType) throws IOException {
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
        values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
        values.put(MediaStore.Downloads.IS_PENDING, 1);
        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new IOException("Could not create file in Downloads");
        }
        try (OutputStream out = resolver.openOutputStream(uri)) {
            if (out == null) {
                throw new IOException("Could not open file in Downloads");
            }
            out.write(bytes);
        }
        ContentValues done = new ContentValues();
        done.put(MediaStore.Downloads.IS_PENDING, 0);
        resolver.update(uri, done, null, null);
        return uri.toString();
    }

    private String saveToPublicDownloads(byte[] bytes, String filename) throws IOException {
        File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IOException("Could not create Downloads folder");
        }
        File file = uniqueFile(dir, filename);
        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(bytes);
        }
        MediaScannerConnection.scanFile(getContext(), new String[] { file.getAbsolutePath() }, null, null);
        return Uri.fromFile(file).toString();
    }

    private File uniqueFile(File dir, String filename) {
        File file = new File(dir, filename);
        int dot = filename.lastIndexOf('.');
        String base = dot > 0 ? filename.substring(0, dot) : filename;
        String ext = dot > 0 ? filename.substring(dot) : "";
        for (int i = 1; file.exists(); i++) {
            file = new File(dir, base + " (" + i + ")" + ext);
        }
        return file;
    }

    @PluginMethod
    public void open(PluginCall call) {
        String data = call.getString("data");
        String filename = call.getString("filename");
        String mimeType = call.getString("mimeType", "application/pdf");
        if (data == null || filename == null) {
            call.reject("data and filename are required");
            return;
        }
        try {
            File dir = new File(getContext().getCacheDir(), "viewer");
            if (!dir.exists() && !dir.mkdirs()) {
                call.reject("Could not create cache folder");
                return;
            }
            File file = new File(dir, filename);
            try (FileOutputStream out = new FileOutputStream(file)) {
                out.write(Base64.decode(data, Base64.DEFAULT));
            }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, mimeType);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("NO_VIEWER");
        } catch (IOException | IllegalArgumentException e) {
            call.reject(e.getMessage() != null ? e.getMessage() : "Open failed");
        }
    }

    private void fail(PluginCall call, String reason) {
        toast("Download failed: " + reason);
        call.reject(reason);
    }

    private void toast(String message) {
        getActivity().runOnUiThread(() -> Toast.makeText(getContext(), message, Toast.LENGTH_LONG).show());
    }
}
