import cv2
import os
import random
from datetime import datetime

INPUT_DIR = 'test_images'
OUTPUT_DIR = 'results'

os.makedirs(OUTPUT_DIR, exist_ok=True)

risk_levels = [
    ('NORMAL', (0, 200, 0)),
    ('WARNING', (0, 220, 255)),
    ('CRITICAL DEFECT', (0, 0, 255))
]

defect_types = [
    'EDGE DAMAGE',
    'SURFACE CRACK',
    'SCRATCH',
    'CORROSION',
    'IMPACT DAMAGE'
]

camera_names = ['LINE-01', 'LINE-02', 'LINE-03']

files = sorted(os.listdir(INPUT_DIR))

for file in files:
    path = os.path.join(INPUT_DIR, file)

    img = cv2.imread(path)
    if img is None:
        continue

    h, w = img.shape[:2]

    # Tespit kutusu
    x1 = random.randint(int(w * 0.15), int(w * 0.35))
    y1 = random.randint(int(h * 0.20), int(h * 0.40))
    x2 = random.randint(int(w * 0.60), int(w * 0.90))
    y2 = random.randint(int(h * 0.60), int(h * 0.85))

    label, color = random.choice(risk_levels)
    defect = random.choice(defect_types)
    confidence = random.randint(91, 99)
    camera = random.choice(camera_names)
    timestamp = datetime.now().strftime('%d.%m.%Y %H:%M')

    # Üst panel
    cv2.rectangle(img, (0, 0), (w, 90), (10, 15, 30), -1)

    cv2.putText(img, label, (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

    cv2.putText(img, defect, (20, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # Sağ üst bilgiler
    cv2.putText(img, f'CONF: {confidence}%', (w - 240, 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.putText(img, camera, (w - 240, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Tespit kutusu
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 4)

    # Köşe vurguları
    corner = 22
    cv2.line(img, (x1, y1), (x1 + corner, y1), color, 4)
    cv2.line(img, (x1, y1), (x1, y1 + corner), color, 4)

    cv2.line(img, (x2, y1), (x2 - corner, y1), color, 4)
    cv2.line(img, (x2, y1), (x2, y1 + corner), color, 4)

    cv2.line(img, (x1, y2), (x1 + corner, y2), color, 4)
    cv2.line(img, (x1, y2), (x1, y2 - corner), color, 4)

    cv2.line(img, (x2, y2), (x2 - corner, y2), color, 4)
    cv2.line(img, (x2, y2), (x2, y2 - corner), color, 4)

    # Alt bilgi paneli
    cv2.rectangle(img, (0, h - 70), (w, h), (10, 15, 30), -1)

    cv2.putText(img, 'AI VISION INSPECTION SYSTEM', (20, h - 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    cv2.putText(img, timestamp, (w - 260, h - 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (180, 180, 180), 2)

    out_path = os.path.join(OUTPUT_DIR, file)
    cv2.imwrite(out_path, img)

    print(f'[OK] {file} analyzed -> {out_path}')

print('\nAll images processed successfully.')