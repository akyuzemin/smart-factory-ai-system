from ultralytics import YOLO
import cv2
import os

# Crack detection modeli
MODEL_PATH = "crack.pt"

# Test görüntüsü
IMAGE_PATH = "test_images/test2.jpg"

# Çıktı
OUTPUT_DIR = "results"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "crack_result.jpg")

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("AI Vision Inspection başlatılıyor...")
print(f"Model: {MODEL_PATH}")
print(f"Görüntü: {IMAGE_PATH}")

# Modeli yükle
model = YOLO(MODEL_PATH)

# Tahmin
results = model.predict(
    source=IMAGE_PATH,
    conf=0.25,
    imgsz=640,
    verbose=True
)

result = results[0]

# Tespit bilgileri
boxes = result.boxes

print("\n========== ANALİZ SONUCU ==========")

if boxes is None or len(boxes) == 0:
    print("NORMAL")
    print("Herhangi bir çatlak tespit edilmedi.")

else:
    print(f"⚠️ {len(boxes)} çatlak tespit edildi.")

    for i, box in enumerate(boxes):
        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        class_name = model.names[class_id]

        print(
            f"Defect #{i + 1}: "
            f"{class_name} | "
            f"Confidence: {confidence:.2%}"
        )

# YOLO tarafından işaretlenmiş görüntü
annotated = result.plot()

# Kaydet
cv2.imwrite(OUTPUT_PATH, annotated)

print("===================================")
print(f"Sonuç kaydedildi: {OUTPUT_PATH}")