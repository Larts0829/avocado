package io.ionic.avocado;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;

import org.tensorflow.lite.Interpreter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.MappedByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "TFLiteNative")
public class TFLiteNative extends Plugin {

    private static final String TAG = "TFLiteNative";
    private static final float DEFAULT_CONFIDENCE_THRESHOLD = 0.50f;
    
    // Fruit model labels from fruit_labels.txt: Healthy fruit, anthracnose, scab
    private static final Map<String, Float> FRUIT_CONFIDENCE_THRESHOLDS;
    static {
        Map<String, Float> map = new HashMap<>();
        map.put("Healthy fruit", 0.60f);
        map.put("scab", 0.77f);
        map.put("anthracnose", 0.70f);
        map.put("Healthy Fruit", 0.60f);
        map.put("Scab", 0.77f);
        map.put("Anthracnose", 0.70f);
        FRUIT_CONFIDENCE_THRESHOLDS = map;
    }
    
    // Leaf model labels from leaf_labels.txt: healthy, anthracnose leaf, mites, powdery mildew
    // Lower thresholds for better detection - especially anthracnose leaf which has high mAP50 (0.851)
    private static final Map<String, Float> LEAF_CONFIDENCE_THRESHOLDS;
    static {
        Map<String, Float> map = new HashMap<>();
        map.put("healthy", 0.90f);
        map.put("anthracnose leaf", 0.20f);  // Lowered from 0.25 to catch more detections
        map.put("mites", 0.35f);
        map.put("powdery mildew", 0.30f);
        map.put("Healthy", 0.90f);
        map.put("Healthy Leaf", 0.90f);
        map.put("Anthracnose Leaf", 0.20f);  // Lowered from 0.25 to catch more detections
        map.put("Mites", 0.35f);
        map.put("Powdery Mildew", 0.30f);
        map.put("Spider Mites", 0.35f);
        LEAF_CONFIDENCE_THRESHOLDS = map;
    }
    
    // Tree model label from tree_labels.txt: borer
    private static final float TREE_CONFIDENCE_THRESHOLD = 0.55f;
    
    private Interpreter tflite = null;
    private List<String> labels = new ArrayList<>();
    private int inputSize = 640;
    private boolean isFruitModel = false;
    private boolean isLeafModel = false;
    private boolean isTreeModel = false;

    @PluginMethod
    public void loadModel(PluginCall call) {
        String modelPath = call.getString("modelPath");
        String labelPath = call.getString("labelPath");
        
        isFruitModel = modelPath != null && modelPath.contains("fruit");
        isLeafModel = modelPath != null && modelPath.contains("leaf");
        isTreeModel = modelPath != null && modelPath.contains("tree");
        
        String modelType = isFruitModel ? "fruit" : isLeafModel ? "leaf" : isTreeModel ? "tree" : "unknown";
        Log.d(TAG, "Loading model type: " + modelType);

        if (modelPath == null || labelPath == null) {
            call.reject("Model path and label path are required");
            return;
        }

        try {
            AssetManager assetManager = getContext().getAssets();

            if (!modelPath.startsWith("public/")) {
                modelPath = "public/assets/" + modelPath;
            }
            if (!labelPath.startsWith("public/")) {
                labelPath = "public/assets/" + labelPath;
            }

            Log.d(TAG, "Loading model: " + modelPath);

            MappedByteBuffer modelBuffer = loadModelFile(assetManager, modelPath);

            Interpreter.Options options = new Interpreter.Options();
            options.setNumThreads(4);

            tflite = new Interpreter(modelBuffer, options);

            labels = loadLabels(assetManager, labelPath);

            int[] inputShape = tflite.getInputTensor(0).shape();
            inputSize = inputShape[1];

            Log.d(TAG, "Model loaded successfully. Input size: " + inputSize);
            Log.d(TAG, "Labels loaded: " + labels.size());
            for (int i = 0; i < labels.size(); i++) {
                Log.d(TAG, String.format("Label index %d: '%s'", i, labels.get(i)));
            }

            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to load model", e);
            call.reject("Failed to load model: " + e.getMessage());
        }
    }

    @PluginMethod
    public void runModelOnImage(PluginCall call) {
        if (tflite == null) {
            call.reject("Model not loaded. Call loadModel first.");
            return;
        }

        try {
            String base64Image = call.getString("imageBase64");
            if (base64Image == null) {
                call.reject("Image data is required");
                return;
            }

            if (base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }

            byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);

            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }

            Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, true);

            ByteBuffer inputBuffer = convertBitmapToByteBuffer(scaledBitmap);

            Map<Integer, Object> outputs = new HashMap<>();

            int outputTensorCount = tflite.getOutputTensorCount();

            if (outputTensorCount >= 4) {
                float[][][] outputLocations = new float[1][10][4];
                float[][] outputClasses = new float[1][10];
                float[][] outputScores = new float[1][10];
                float[] numDetections = new float[1];

                outputs.put(0, outputLocations);
                outputs.put(1, outputClasses);
                outputs.put(2, outputScores);
                outputs.put(3, numDetections);

                tflite.runForMultipleInputsOutputs(new Object[]{inputBuffer}, outputs);

                JSArray detections = processDetections(
                    outputLocations[0],
                    outputClasses[0],
                    outputScores[0],
                    (int) numDetections[0],
                    bitmap.getWidth(),
                    bitmap.getHeight()
                );

                if (detections.length() > 0) {
                    try {
                        JSObject firstDetection = null;
                        for (int i = 0; i < detections.length(); i++) {
                            org.json.JSONObject jsonObj = detections.getJSONObject(i);
                            JSObject detection = JSObject.fromJSONObject(jsonObj);
                            String label = detection.getString("label");
                            
                            if (label == null || label.trim().isEmpty()) {
                                continue;
                            }
                            
                            if (isLeafModel && (label.equalsIgnoreCase("healthy") || 
                                                label.equalsIgnoreCase("Healthy Leaf"))) {
                                continue;
                            }
                            
                            firstDetection = detection;
                            break;
                        }
                        
                        if (firstDetection != null) {
                            call.resolve(firstDetection);
                        } else {
                            call.reject("No avocado or disease detected.");
                        }
                    } catch (Exception e) {
                        call.reject("Failed to get detection result: " + e.getMessage());
                    }
                } else {
                    call.reject("No detections found");
                }

            } else {
                // YOLO Detection model
                int[] outputShape = tflite.getOutputTensor(0).shape();
                int numOutputs = outputShape[1];
                int numBoxes = outputShape[2];
                int numClasses = numOutputs - 4;
                
                Log.d(TAG, "YOLO output shape: [" + outputShape[0] + ", " + numOutputs + ", " + numBoxes + "]");
                Log.d(TAG, "Detected " + numClasses + " classes (output=" + numOutputs + " - 4 box coords)");
                
                float[][][] output = new float[1][numOutputs][numBoxes];
                tflite.run(inputBuffer, output);

                // First pass: Find max confidence for each class
                // Also log sample values to understand the output format
                float[] maxClassConfidences = new float[numClasses];
                int[] maxClassBoxIndices = new int[numClasses];
                
                // Log sample raw outputs for first few boxes to debug
                Log.d(TAG, "=== Sample Raw Outputs (first 5 boxes) ===");
                for (int boxIdx = 0; boxIdx < Math.min(5, numBoxes); boxIdx++) {
                    StringBuilder sb = new StringBuilder("Box " + boxIdx + ": ");
                    sb.append("coords=[").append(output[0][0][boxIdx]).append(",")
                      .append(output[0][1][boxIdx]).append(",")
                      .append(output[0][2][boxIdx]).append(",")
                      .append(output[0][3][boxIdx]).append("] ");
                    sb.append("classes=[");
                    for (int classIdx = 0; classIdx < numClasses; classIdx++) {
                        float conf = output[0][4 + classIdx][boxIdx];
                        sb.append(String.format("%.3f", conf));
                        if (classIdx < numClasses - 1) sb.append(",");
                    }
                    sb.append("]");
                    Log.d(TAG, sb.toString());
                }
                Log.d(TAG, "==========================================");
                
                for (int classIdx = 0; classIdx < numClasses; classIdx++) {
                    float maxConf = 0;
                    int maxBoxIdx = 0;
                    float sumConf = 0;
                    int nonZeroCount = 0;
                    
                    for (int boxIdx = 0; boxIdx < numBoxes; boxIdx++) {
                        float confidence = output[0][4 + classIdx][boxIdx];
                        if (confidence > maxConf) {
                            maxConf = confidence;
                            maxBoxIdx = boxIdx;
                        }
                        if (confidence > 0.001f) {  // Count non-zero values
                            sumConf += confidence;
                            nonZeroCount++;
                        }
                    }
                    maxClassConfidences[classIdx] = maxConf;
                    maxClassBoxIndices[classIdx] = maxBoxIdx;
                    
                    // Log statistics for each class
                    if (isLeafModel && classIdx < labels.size()) {
                        String labelName = labels.get(classIdx);
                        float avgConf = nonZeroCount > 0 ? sumConf / nonZeroCount : 0;
                        Log.d(TAG, String.format("Class %d (%s) stats: max=%.3f, avg_nonzero=%.3f, nonzero_count=%d/%d", 
                            classIdx, labelName, maxConf, avgConf, nonZeroCount, numBoxes));
                    }
                }
                
                // Enhanced logging with threshold information
                Log.d(TAG, "=== All Class Confidences ===");
                for (int i = 0; i < numClasses && i < labels.size(); i++) {
                    String labelName = labels.get(i);
                    float threshold = getThresholdForLabel(labelName);
                    
                    boolean meetsThreshold = maxClassConfidences[i] >= threshold;
                    Log.d(TAG, String.format("Class %d (%s): %.3f (threshold: %.2f) %s", 
                        i, labelName, maxClassConfidences[i], threshold, 
                        meetsThreshold ? "✓ PASS" : "✗ FAIL"));
                }
                Log.d(TAG, "============================");

                // Second pass: Find best class that meets threshold
                int bestClassIndex = -1;
                float bestConfidence = 0;
                int bestBoxIndex = 0;
                
                for (int classIdx = 0; classIdx < numClasses && classIdx < labels.size(); classIdx++) {
                    String className = labels.get(classIdx);
                    if (className == null || className.trim().isEmpty()) {
                        continue;
                    }
                    
                    // ONLY skip healthy for leaf model
                    if (isLeafModel && (className.equalsIgnoreCase("healthy") || 
                                        className.equalsIgnoreCase("Healthy Leaf"))) {
                        Log.d(TAG, String.format("Skipping healthy class: %s", className));
                        continue;
                    }
                    
                    float confidence = maxClassConfidences[classIdx];
                    float threshold = getThresholdForLabel(className);
                    
                    if (isLeafModel) {
                        Log.d(TAG, String.format("Leaf model - checking %s: conf=%.3f, thresh=%.2f", 
                            className, confidence, threshold));
                    }
                    
                    if (confidence >= threshold) {
                        Log.d(TAG, String.format("Class %d (%s) PASSES threshold: %.3f >= %.2f", 
                            classIdx, className, confidence, threshold));
                        if (confidence > bestConfidence) {
                            bestConfidence = confidence;
                            bestClassIndex = classIdx;
                            bestBoxIndex = maxClassBoxIndices[classIdx];
                            Log.d(TAG, String.format("NEW BEST: %s with confidence %.3f", className, confidence));
                        }
                    } else {
                        Log.d(TAG, String.format("Class %d (%s) FAILS threshold: %.3f < %.2f", 
                            classIdx, className, confidence, threshold));
                    }
                }
                
                if (bestClassIndex == -1) {
                    Log.w(TAG, "No class met its threshold");
                    call.reject("No avocado or disease detected.");
                    return;
                }
                
                String detectedClass = labels.get(bestClassIndex);
                
                Log.d(TAG, String.format("SELECTED: Class %d (%s) with confidence %.3f", 
                    bestClassIndex, detectedClass, bestConfidence));

                String predictedLabel;
                if (bestClassIndex < labels.size()) {
                    predictedLabel = labels.get(bestClassIndex);
                } else {
                    predictedLabel = "Class " + bestClassIndex;
                }
                
                if (predictedLabel == null || predictedLabel.trim().isEmpty()) {
                    Log.w(TAG, "REJECTED: Empty/null label detected");
                    call.reject("No avocado or disease detected.");
                    return;
                }
                
                if (isLeafModel && (predictedLabel.equalsIgnoreCase("healthy") || 
                                    predictedLabel.equalsIgnoreCase("Healthy Leaf"))) {
                    Log.w(TAG, "REJECTED: Healthy leaf detected");
                    call.reject("No avocado or disease detected.");
                    return;
                }

                Log.d(TAG, "Best detection: class=" + bestClassIndex + " (" + predictedLabel + "), confidence=" + bestConfidence);

                JSObject result = new JSObject();
                result.put("label", predictedLabel);
                result.put("confidence", bestConfidence);
                call.resolve(result);
            }

        } catch (Exception e) {
            Log.e(TAG, "Failed to process image", e);
            call.reject("Failed to process image: " + e.getMessage());
        }
    }

    @PluginMethod
    public void predict(PluginCall call) {
        if (tflite == null) {
            call.reject("Model not loaded. Call loadModel first.");
            return;
        }

        try {
            String base64Image = call.getString("image");
            if (base64Image == null) {
                call.reject("Image data is required");
                return;
            }

            byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);

            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }

            Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, true);

            ByteBuffer inputBuffer = convertBitmapToByteBuffer(scaledBitmap);

            Map<Integer, Object> outputs = new HashMap<>();
            
            int outputTensorCount = tflite.getOutputTensorCount();
            
            if (outputTensorCount >= 4) {
                float[][][] outputLocations = new float[1][10][4];
                float[][] outputClasses = new float[1][10];
                float[][] outputScores = new float[1][10];
                float[] numDetections = new float[1];

                outputs.put(0, outputLocations);
                outputs.put(1, outputClasses);
                outputs.put(2, outputScores);
                outputs.put(3, numDetections);

                tflite.runForMultipleInputsOutputs(new Object[]{inputBuffer}, outputs);

                JSArray detections = processDetections(
                    outputLocations[0],
                    outputClasses[0],
                    outputScores[0],
                    (int) numDetections[0],
                    bitmap.getWidth(),
                    bitmap.getHeight()
                );

                JSObject result = new JSObject();
                result.put("detections", detections);
                call.resolve(result);

            } else {
                float[][] output = new float[1][labels.size()];
                tflite.run(inputBuffer, output);

                int maxIndex = 0;
                float maxProb = 0;
                for (int i = 0; i < labels.size(); i++) {
                    if (output[0][i] > maxProb) {
                        maxProb = output[0][i];
                        maxIndex = i;
                    }
                }

                String predictedLabel = labels.get(maxIndex);

                JSObject result = new JSObject();
                result.put("label", predictedLabel);
                result.put("confidence", maxProb);
                call.resolve(result);
            }

        } catch (Exception e) {
            Log.e(TAG, "Failed to process image", e);
            call.reject("Failed to process image: " + e.getMessage());
        }
    }

    private float getThresholdForLabel(String labelName) {
        Float threshold;
        String normalizedLabel = labelName.toLowerCase();
        
        if (isFruitModel) {
            threshold = FRUIT_CONFIDENCE_THRESHOLDS.get(labelName);
            if (threshold == null) {
                threshold = FRUIT_CONFIDENCE_THRESHOLDS.get(normalizedLabel);
            }
        } else if (isLeafModel) {
            threshold = LEAF_CONFIDENCE_THRESHOLDS.get(labelName);
            if (threshold == null) {
                threshold = LEAF_CONFIDENCE_THRESHOLDS.get(normalizedLabel);
            }
        } else if (isTreeModel) {
            return TREE_CONFIDENCE_THRESHOLD;
        } else {
            return DEFAULT_CONFIDENCE_THRESHOLD;
        }
        
        return threshold != null ? threshold : DEFAULT_CONFIDENCE_THRESHOLD;
    }

    private ByteBuffer convertBitmapToByteBuffer(Bitmap bitmap) {
        ByteBuffer byteBuffer = ByteBuffer.allocateDirect(4 * inputSize * inputSize * 3);
        byteBuffer.order(ByteOrder.nativeOrder());
        
        int[] intValues = new int[inputSize * inputSize];
        bitmap.getPixels(intValues, 0, bitmap.getWidth(), 0, 0, bitmap.getWidth(), bitmap.getHeight());
        
        int pixel = 0;
        for (int i = 0; i < inputSize; ++i) {
            for (int j = 0; j < inputSize; ++j) {
                final int val = intValues[pixel++];
                byteBuffer.putFloat(((val >> 16) & 0xFF) / 255.0f);
                byteBuffer.putFloat(((val >> 8) & 0xFF) / 255.0f);
                byteBuffer.putFloat((val & 0xFF) / 255.0f);
            }
        }
        return byteBuffer;
    }

    private JSArray processDetections(
        float[][] locations,
        float[] classes,
        float[] scores,
        int numDetections,
        int imageWidth,
        int imageHeight
    ) {
        JSArray detections = new JSArray();

        for (int i = 0; i < Math.min(numDetections, 10); i++) {
            if (scores[i] < DEFAULT_CONFIDENCE_THRESHOLD) {
                continue;
            }

            float top = locations[i][0] * imageHeight;
            float left = locations[i][1] * imageWidth;
            float bottom = locations[i][2] * imageHeight;
            float right = locations[i][3] * imageWidth;

            JSObject detection = new JSObject();
            
            int classIndex = (int) classes[i];
            String label;
            if (classIndex >= 0 && classIndex < labels.size()) {
                label = labels.get(classIndex);
                if (label == null || label.trim().isEmpty()) {
                    continue;
                }
                detection.put("label", label);
            } else {
                detection.put("label", "Unknown");
            }
            
            detection.put("confidence", scores[i]);

            JSObject boundingBox = new JSObject();
            boundingBox.put("x", left);
            boundingBox.put("y", top);
            boundingBox.put("width", right - left);
            boundingBox.put("height", bottom - top);
            detection.put("boundingBox", boundingBox);

            detections.put(detection);
        }

        return detections;
    }

    private MappedByteBuffer loadModelFile(AssetManager assetManager, String path) throws IOException {
        InputStream inputStream = null;
        try {
            inputStream = assetManager.open(path);
            byte[] bytes = new byte[inputStream.available()];
            int bytesRead = inputStream.read(bytes);
            if (bytesRead != bytes.length) {
                throw new IOException("Failed to read complete model file");
            }
            
            ByteBuffer buffer = ByteBuffer.allocateDirect(bytes.length);
            buffer.put(bytes);
            buffer.rewind();
            
            return (MappedByteBuffer) buffer;
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    Log.e(TAG, "Failed to close input stream", e);
                }
            }
        }
    }

    private List<String> loadLabels(AssetManager assetManager, String labelPath) throws IOException {
        List<String> labelList = new ArrayList<>();
        InputStream is = null;
        BufferedReader reader = null;
        try {
            is = assetManager.open(labelPath);
            reader = new BufferedReader(new InputStreamReader(is));
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (!trimmed.isEmpty()) {
                    labelList.add(trimmed);
                }
            }
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    Log.e(TAG, "Failed to close reader", e);
                }
            }
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    Log.e(TAG, "Failed to close input stream", e);
                }
            }
        }
        Log.d(TAG, "Loaded " + labelList.size() + " labels");
        return labelList;
    }
}