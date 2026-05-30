# ai-service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import pandas as pd
from sklearn.ensemble import IsolationForest
import uvicorn

app = FastAPI(title="Smart Factory AI Service")

# React ve Node.js'ten gelecek isteklere izin ver (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Docker'da çalışan PostgreSQL veritabanımızın bağlantı bilgileri
DB_CONFIG = {
    "dbname": "factory_db",
    "user": "admin",
    "password": "1234",
    "host": "postgres",  # Docker Compose'da servis adıyla erişim
    "port": "5432"
}

@app.get("/api/analyze/motor1")
def analyze_motor_temperature():
    try:
        # 1. Veritabanına Bağlan
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Son 50 sensör verisini getir (Modelin öğrenmesi için geçmiş veri)
        cursor.execute("SELECT value FROM sensor_logs WHERE sensor_id = 1 ORDER BY timestamp DESC LIMIT 50")
        records = cursor.fetchall()
        conn.close()

        # Pandas DataFrame'e dönüştür
        df = pd.DataFrame(records, columns=['value'])

        # Eğer yeterli veri yoksa modeli çalıştırma, bekle
        if len(df) < 20:
            return {
                "status": "waiting", 
                "message": f"Modelin eğitimi için veri toplanıyor. (Mevcut: {len(df)}/20)"
            }

        # 2. Makine Öğrenmesi (Isolation Forest) Kurulumu
        # contamination=0.1 -> Verilerin %10'unun anormal olabileceğini varsayıyoruz
        model = IsolationForest(contamination=0.1, random_state=42)
        
        # Modeli eğit
        X = df[['value']].values
        model.fit(X)
        
        # Veritabanına kaydedilen en son değeri analiz et
        latest_value = float(df.iloc[0]['value'])
        prediction = model.predict([[latest_value]])[0]

        # Sonuç: 1 ise Normal, -1 ise Anomali
        is_anomaly = bool(prediction == -1)

        return {
            "status": "success",
            "sensor": "Motor 1 Sıcaklığı",
            "latest_value": latest_value,
            "is_anomaly": is_anomaly,
            "ai_message": "⚠️ DİKKAT: Motorda anormal sıcaklık dalgalanması tespit edildi!" if is_anomaly else "✅ Değerler normal operasyon sınırları içinde."
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)