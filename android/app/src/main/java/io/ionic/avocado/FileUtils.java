package io.ionic.avocado;

import android.content.Context;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.IOException;

public class FileUtils {
    public static String copyAssetToFile(Context context, String assetName) throws IOException {
        File file = new File(context.getCacheDir(), assetName);
        try (InputStream in = context.getAssets().open(assetName);
             FileOutputStream out = new FileOutputStream(file)) {
            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
        }
        return file.getAbsolutePath();
    }
}
