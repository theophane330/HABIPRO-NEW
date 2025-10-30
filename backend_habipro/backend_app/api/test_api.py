import requests
import sys

# Configuration
PDF_FILE = "informatique_fr.pdf"
QUESTION = "Quelle est la définition de licence professionnelle dans le document"
API_URL = "http://localhost:8000"

def test_api():
    
    print("📤 Upload du PDF...")
    with open(PDF_FILE, "rb") as f:
        response = requests.post(f"{API_URL}/upload-pdf/", files={"file": f})
    
    if response.status_code != 200:
        print(f"❌ Erreur upload: {response.json()}")
        sys.exit(1)
    
    print(f"✅ Upload réussi: {response.json()}")
    
    print(f"\n❓ Question: {QUESTION}")
    response = requests.post(
        f"{API_URL}/ask/",
        json={"question": QUESTION}
    )
    
    if response.status_code != 200:
        print(f"❌ Erreur question: {response.json()}")
        sys.exit(1)
    
    result = response.json()
    print(f"\n💬 Réponse:\n{result['answer']}")
    print(f"\n📄 Source: {result['source']}")
    print(f"🤖 Modèle: {result['model']}")

if __name__ == "__main__":
    test_api()