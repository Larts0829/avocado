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
import org.json.JSONException;

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
    private static final float DEFAULT_CONFIDENCE_THRESHOLD = 0.5f;
    private static final Map<String, Float> FRUIT_CONFIDENCE_THRESHOLDS = new HashMap<String, Float>() {{
        put("Healthy fruit", 0.50f);
        put("scab", 0.50f);
        put("anthracnose", 0.60f);
        put("borer", 0.50f);
    }};
    
    private Interpreter tflite = null;
    private List<String> labels = new ArrayList<>();
    private int inputSize = 640; // Default for object detection models
    private boolean isObjectDetectionModel = true;
    private boolean isFruitModel = false;

    @PluginMethod
    public void loadModel(PluginCall call) {
        String modelPath = call.getString("modelPath");
        String labelPath = call.getString("labelPath");
        
        // Check if this is a fruit model
        isFruitModel = modelPath != null && modelPath.contains("fruit");
        Log.d(TAG, "Loading model. isFruitModel: " + isFruitModel);

        if (modelPath == null || labelPath == null) {
            call.reject("Model path and label path are required");
            return;
        }

        try {
            AssetManager assetManager = getContext().getAssets();

            // Prepend the public/assets path if not already present
            if (!modelPath.startsWith("public/")) {
                modelPath = "public/assets/" + modelPath;
            }
            if (!labelPath.startsWith("public/")) {
                labelPath = "public/assets/" + labelPath;
            }

            Log.d(TAG, "Loading model: " + modelPath);

            // Load model
            MappedByteBuffer modelBuffer = loadModelFile(assetManager, modelPath);

            // Configure interpreter options for better performance
            Interpreter.Options options = new Interpreter.Options();
            options.setNumThreads(4); // Use 4 threads for better performance

            tflite = new Interpreter(modelBuffer, options);

            // Load labels
            labels = loadLabels(assetManager, labelPath);

            // Check model input shape to determine if it's object detection or classification
            int[] inputShape = tflite.getInputTensor(0).shape();
            inputSize = inputShape[1]; // Typically [1, height, width, 3]

            Log.d(TAG, "Model loaded successfully. Input size: " + inputSize);
            Log.d(TAG, "Labels loaded: " + labels.size());

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

            // Remove data URL prefix if present
            if (base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }

            // Decode base64 to bitmap
            byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);

            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }

            // Preprocess image
            Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, true);

            // Prepare input tensor
            ByteBuffer inputBuffer = convertBitmapToByteBuffer(scaledBitmap);

            // Run inference
            Map<Integer, Object> outputs = new HashMap<>();

            // Check output tensor count to determine model type
            int outputTensorCount = tflite.getOutputTensorCount();

            if (outputTensorCount >= 4) {
                // Object detection model (SSD, YOLO, etc.)
                float[][][] outputLocations = new float[1][10][4];
                float[][] outputClasses = new float[1][10];
                float[][] outputScores = new float[1][10];
                float[] numDetections = new float[1];

                outputs.put(0, outputLocations);
                outputs.put(1, outputClasses);
                outputs.put(2, outputScores);
                outputs.put(3, numDetections);

                tflite.runForMultipleInputsOutputs(new Object[]{inputBuffer}, outputs);

                // Process detections
                JSArray detections = processDetections(
                    outputLocations[0],
                    outputClasses[0],
                    outputScores[0],
                    (int) numDetections[0],
                    bitmap.getWidth(),
                    bitmap.getHeight()
                );

                // Return first detection if available
                if (detections.length() > 0) {
                    try {
                        // Get the first detection from the array
                        org.json.JSONObject jsonObj = detections.getJSONObject(0);
                        JSObject firstDetection = JSObject.fromJSONObject(jsonObj);
                        call.resolve(firstDetection);
                    } catch (Exception e) {
                        call.reject("Failed to get detection result: " + e.getMessage());
                    }
                } else {
                    call.reject("No detections found");
                }

            } else {
                // YOLO Detection model - output shape [1, (4+numClasses), 8400]
                // First 4 values are box coords (x,y,w,h), rest are class scores
                int[] outputShape = tflite.getOutputTensor(0).shape();
                int numOutputs = outputShape[1]; // e.g. 7 = 4 box coords + 3 classes
                int numBoxes = outputShape[2];   // e.g. 8400
                int numClasses = numOutputs - 4; // Subtract 4 box coordinates
                
                Log.d(TAG, "YOLO output shape: [" + outputShape[0] + ", " + numOutputs + ", " + numBoxes + "]");
                Log.d(TAG, "Detected " + numClasses + " classes (output=" + numOutputs + " - 4 box coords)");
                
                float[][][] output = new float[1][numOutputs][numBoxes];
                tflite.run(inputBuffer, output);

                // Find the detection with highest confidence
                int maxClassIndex = 0;
                float maxConfidence = 0;
                int maxBoxIndex = 0;

                for (int boxIdx = 0; boxIdx < numBoxes; boxIdx++) {
                    // Skip first 4 values (box coordinates), check class scores
                    for (int classIdx = 0; classIdx < numClasses; classIdx++) {
                        float confidence = output[0][4 + classIdx][boxIdx]; // Start from index 4
                        if (confidence > maxConfidence) {
                            maxConfidence = confidence;
                            maxClassIndex = classIdx;
                            maxBoxIndex = boxIdx;
                        }
                    }
                }

                // Get the appropriate threshold for this class
                String detectedClass = labels.get(maxClassIndex);
                float threshold = isFruitModel ? 
                    FRUIT_CONFIDENCE_THRESHOLDS.getOrDefault(detectedClass, DEFAULT_CONFIDENCE_THRESHOLD) :
                    DEFAULT_CONFIDENCE_THRESHOLD;
                    
                Log.d(TAG, String.format("Detected: %s (%.2f), Threshold: %.2f", 
                    detectedClass, maxConfidence, threshold));
                
                // Check if confidence meets threshold
                if (maxConfidence < threshold) {
                    Log.d(TAG, "Detection confidence " + maxConfidence + " below threshold " + threshold);
                    JSObject result = new JSObject();
                    result.put("label", "No object detected");
                    result.put("confidence", 0.0f);
                    call.resolve(result);
                    return;
                }

                // Get label
                String predictedLabel;
                if (maxClassIndex < labels.size()) {
                    predictedLabel = labels.get(maxClassIndex);
                } else {
                    predictedLabel = "Class " + maxClassIndex;
                }

                Log.d(TAG, "Best detection: class=" + maxClassIndex + " (" + predictedLabel + "), confidence=" + maxConfidence);

                JSObject result = new JSObject();
                result.put("label", predictedLabel);
                result.put("confidence", maxConfidence);
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

            // Decode base64 to bitmap
            byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);

            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }

            // Preprocess image
            Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, true);

            // Prepare input tensor
            ByteBuffer inputBuffer = convertBitmapToByteBuffer(scaledBitmap);

            // Run inference
            Map<Integer, Object> outputs = new HashMap<>();
            
            // Check output tensor count to determine model type
            int outputTensorCount = tflite.getOutputTensorCount();
            
            if (outputTensorCount >= 4) {
                // Object detection model (SSD, YOLO, etc.)
                float[][][] outputLocations = new float[1][10][4]; // [batch, detections, coords]
                float[][] outputClasses = new float[1][10]; // [batch, detections]
                float[][] outputScores = new float[1][10]; // [batch, detections]
                float[] numDetections = new float[1]; // [batch]

                outputs.put(0, outputLocations);
                outputs.put(1, outputClasses);
                outputs.put(2, outputScores);
                outputs.put(3, numDetections);

                tflite.runForMultipleInputsOutputs(new Object[]{inputBuffer}, outputs);

                // Process detections
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
                // Classification model
                float[][] output = new float[1][labels.size()];
                tflite.run(inputBuffer, output);

                // Find the index of max confidence
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

    private Bitmap resizeAndPad(Bitmap source, int targetWidth, int targetHeight) {
        // Calculate the aspect ratio of the source image
        float sourceAspect = (float) source.getWidth() / source.getHeight();
        float targetAspect = (float) targetWidth / targetHeight;
        
        int newWidth, newHeight;
        int xOffset = 0, yOffset = 0;
        
        if (sourceAspect > targetAspect) {
            // Source is wider than target aspect ratio
            newWidth = targetWidth;
            newHeight = (int) (targetWidth / sourceAspect);
            yOffset = (targetHeight - newHeight) / 2;
        } else {
            // Source is taller than target aspect ratio
            newHeight = targetHeight;
            newWidth = (int) (targetHeight * sourceAspect);
            xOffset = (targetWidth - newWidth) / 2;
        }
        
        // Create a new bitmap with the target dimensions
        Bitmap result = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888);
        android.graphics.Canvas canvas = new android.graphics.Canvas(result);
        
        // Fill with black (or any other color you prefer)
        canvas.drawColor(0xFF000000);
        
        // Draw the resized image centered on the canvas
        android.graphics.Rect src = new android.graphics.Rect(0, 0, source.getWidth(), source.getHeight());
        android.graphics.RectF dst = new android.graphics.RectF(xOffset, yOffset, xOffset + newWidth, yOffset + newHeight);
        canvas.drawBitmap(source, src, dst, null);
        
        return result;
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
                // Normalize pixel values to [0, 1]
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
        // Use the same confidence threshold as defined at class level
        float confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD; // 0.5f threshold

        for (int i = 0; i < Math.min(numDetections, 10); i++) {
            if (scores[i] < confidenceThreshold) {
                continue;
            }

            float top = locations[i][0] * imageHeight;
            float left = locations[i][1] * imageWidth;
            float bottom = locations[i][2] * imageHeight;
            float right = locations[i][3] * imageWidth;

            JSObject detection = new JSObject();
            
            int classIndex = (int) classes[i];
            if (classIndex >= 0 && classIndex < labels.size()) {
                detection.put("label", labels.get(classIndex));
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
        try (InputStream inputStream = assetManager.open(path)) {
            // For assets, we need to read into byte array first
            byte[] bytes = new byte[inputStream.available()];
            inputStream.read(bytes);
            
            ByteBuffer buffer = ByteBuffer.allocateDirect(bytes.length);
            buffer.put(bytes);
            buffer.rewind();
            
            return (MappedByteBuffer) buffer;
        }
    }

    private List<String> loadLabels(AssetManager assetManager, String labelPath) throws IOException {
        List<String> labelList = new ArrayList<>();
        try (InputStream is = assetManager.open(labelPath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                labelList.add(line.trim());
            }
        }
        Log.d(TAG, "Loaded " + labelList.size() + " labels");
        return labelList;
    }
}