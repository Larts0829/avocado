package io.ionic.avocado;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the TFLiteNative plugin BEFORE calling super
        registerPlugin(TFLiteNative.class);
        
        super.onCreate(savedInstanceState);
    }
}
