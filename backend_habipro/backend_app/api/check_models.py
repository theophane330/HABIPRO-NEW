import google.generativeai as genai

# Votre clé API
GEMINI_API_KEY = "AIzaSyCoACjAyiZFpqWJkZfazfzzXAMpI3wRuXI"

try:
    genai.configure(api_key=GEMINI_API_KEY)
    
    print("🔍 Liste des modèles Gemini disponibles avec votre clé API:\n")
    
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✅ Nom du modèle: {model.name}")
            print(f"   Nom d'affichage: {model.display_name}")
            print(f"   Description: {model.description}")
            print("-" * 80)
            
except Exception as e:
    print(f"❌ Erreur: {e}")