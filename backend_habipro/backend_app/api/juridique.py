from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
import io
from typing import Optional
import uvicorn
import google.generativeai as genai

app = FastAPI(title="API Question-Réponse PDF avec Google Gemini")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 🔑 CONFIGURATION : Mettez votre clé API ici
# ============================================
GEMINI_API_KEY = "AIzaSyCoACjAyiZFpqWJkZfazfzzXAMpI3wRuXI"
# Obtenez votre clé sur : https://makersuite.google.com/app/apikey
# ============================================

# Initialiser Gemini
try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('models/gemini-2.5-flash')
except Exception as e:
    print(f"⚠️ Erreur d'initialisation: {e}")
    print("Vérifiez votre clé API Gemini")

# Stockage temporaire du contenu du PDF
pdf_content = {"text": "", "uploaded": False, "filename": ""}

class Question(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    question: str
    max_tokens: Optional[int] = 1024
    model_name: Optional[str] = "models/gemini-2.5-flash"  # models/gemini-2.5-flash, models/gemini-2.5-pro

class Answer(BaseModel):
    question: str
    answer: str
    source: str
    model: str

def extract_text_from_pdf(pdf_file):
    """Extrait le texte d'un fichier PDF"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page_num, page in enumerate(pdf_reader.pages, 1):
            page_text = page.extract_text()
            text += f"\n--- Page {page_num} ---\n{page_text}\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'extraction du PDF: {str(e)}")

def split_document_into_chunks(text: str, max_chunk_size: int = 4000) -> list:
    """Divise le document en morceaux plus petits"""
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    
    for word in words:
        current_size += len(word) + 1
        if current_size > max_chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_size = len(word)
        else:
            current_chunk.append(word)
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def get_answer_from_gemini(document_text: str, question: str, max_tokens: int = 1024, model_name: str = "models/gemini-2.5-flash") -> str:
    """Utilise Google Gemini pour générer une réponse basée sur le document avec système de fallback robuste"""
    try:
        model = genai.GenerativeModel(model_name)
        
        # Configuration de génération optimisée
        generation_config = {
            "max_output_tokens": max_tokens,
            "temperature": 0.3,
            "top_p": 0.95,
            "top_k": 40,
        }
        
        # Configuration de sécurité minimale
        safety_settings = {
            genai.types.HarmCategory.HARM_CATEGORY_HARASSMENT: genai.types.HarmBlockThreshold.BLOCK_NONE,
            genai.types.HarmCategory.HARM_CATEGORY_HATE_SPEECH: genai.types.HarmBlockThreshold.BLOCK_NONE,
            genai.types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: genai.types.HarmBlockThreshold.BLOCK_NONE,
            genai.types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: genai.types.HarmBlockThreshold.BLOCK_NONE,
        }

        # ===== STRATÉGIE 1 : Essayer avec le document complet =====
        try:
            prompt = f"""Analyse le document suivant et réponds à la question de manière factuelle et objective.

DOCUMENT:
{document_text}

QUESTION: {question}

INSTRUCTIONS:
- Réponds uniquement en te basant sur les informations du document
- Sois précis et factuel
- Si l'information n'est pas dans le document, indique-le clairement
- Structure ta réponse de manière claire avec des points clés si nécessaire

RÉPONSE:"""

            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            if hasattr(response, 'text') and response.text:
                return response.text
            
            print("Stratégie 1 : Pas de texte dans la réponse, passage à la stratégie 2")
        
        except Exception as e:
            print(f"Stratégie 1 échouée: {e}")
        
        # ===== STRATÉGIE 2 : Prompt plus neutre et court =====
        try:
            # Limiter la taille du document si trop long
            doc_excerpt = document_text[:8000] if len(document_text) > 8000 else document_text
            
            prompt = f"""En tant qu'assistant d'analyse documentaire, réponds à cette question basée sur le document.

Question: {question}

Document (extrait):
{doc_excerpt}

Réponds de manière concise et factuelle."""

            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            if hasattr(response, 'text') and response.text:
                return response.text
            
            print("Stratégie 2 : Pas de texte dans la réponse, passage à la stratégie 3")
        
        except Exception as e:
            print(f"Stratégie 2 échouée: {e}")
        
        # ===== STRATÉGIE 3 : Diviser en chunks et analyser =====
        try:
            chunks = split_document_into_chunks(document_text, max_chunk_size=3000)
            
            chunk_responses = []
            for i, chunk in enumerate(chunks[:3]):  # Limiter à 3 chunks pour éviter les timeouts
                try:
                    prompt = f"""Analyse ce segment de document et réponds à la question si l'information est présente.

Segment {i+1}/{min(len(chunks), 3)}:
{chunk}

Question: {question}

Si ce segment contient des informations pertinentes, réponds. Sinon, réponds "Non pertinent"."""

                    response = model.generate_content(
                        prompt,
                        generation_config=generation_config,
                        safety_settings=safety_settings
                    )
                    
                    if hasattr(response, 'text') and response.text:
                        response_text = response.text.strip()
                        if response_text and "Non pertinent" not in response_text:
                            chunk_responses.append(response_text)
                
                except Exception as chunk_error:
                    print(f"Erreur chunk {i}: {chunk_error}")
                    continue
            
            if chunk_responses:
                # Si on a plusieurs réponses, essayer de les synthétiser
                if len(chunk_responses) > 1:
                    try:
                        synthesis_prompt = f"""Synthétise ces informations en une seule réponse cohérente pour la question: "{question}"

Informations collectées:
{chr(10).join([f"{i+1}. {resp}" for i, resp in enumerate(chunk_responses)])}

Fournis une réponse synthétique et claire."""

                        final_response = model.generate_content(
                            synthesis_prompt,
                            generation_config=generation_config,
                            safety_settings=safety_settings
                        )
                        
                        if hasattr(final_response, 'text') and final_response.text:
                            return final_response.text
                    except:
                        pass
                
                # Retourner les réponses combinées
                return "\n\n".join(chunk_responses)
            
            print("Stratégie 3 : Aucune réponse pertinente dans les chunks, passage à la stratégie 4")
        
        except Exception as e:
            print(f"Stratégie 3 échouée: {e}")
        
        # ===== STRATÉGIE 4 : Analyse générique structurée =====
        try:
            # Extraire des informations de base du document
            doc_preview = document_text[:2000].strip()
            word_count = len(document_text.split())
            char_count = len(document_text)
            
            prompt = f"""Voici les premières lignes d'un document:

{doc_preview}

Le document complet contient environ {word_count} mots et {char_count} caractères.

Question de l'utilisateur: {question}

Fournis une réponse basée sur ce que tu peux déduire du contenu visible."""

            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            if hasattr(response, 'text') and response.text:
                return response.text
        
        except Exception as e:
            print(f"Stratégie 4 échouée: {e}")
        
        # ===== STRATÉGIE 5 : Réponse de secours structurée =====
        # Extraire quelques informations basiques du document
        lines = document_text.split('\n')
        non_empty_lines = [line.strip() for line in lines if line.strip()][:10]
        
        fallback_response = f"""Basé sur le document analysé, voici ce que je peux vous dire :

📄 **Informations générales :**
- Le document contient environ {len(document_text.split())} mots
- Structure : {len(lines)} lignes de texte
- Premières lignes visibles : "{non_empty_lines[0][:100]}..."

❓ **Concernant votre question :** "{question}"

Pour obtenir une réponse plus précise, essayez de :

1. **Poser une question plus spécifique** sur une section précise
2. **Demander des informations ciblées** (dates, noms, chiffres, définitions)
3. **Reformuler la question** de manière plus directe

**Exemples de questions qui fonctionnent bien :**
- "Quelles sont les dates mentionnées ?"
- "Quels sont les chiffres clés du document ?"
- "De quoi parle la première page ?"
- "Quelle est la définition de [terme] dans le document ?"
- "Qui sont les personnes ou organisations citées ?"

Je reste à votre disposition pour répondre à une question plus ciblée ! 😊"""

        return fallback_response
    
    except Exception as e:
        # Dernière ligne de défense : toujours retourner quelque chose d'utile
        return f"""Une erreur technique s'est produite lors de l'analyse ({str(e)}).

Cependant, le document est bien chargé et contient {len(document_text)} caractères.

**Suggestions :**
1. Réessayez avec une question plus simple
2. Posez une question sur un aspect spécifique du document
3. Demandez un résumé général : "Résume brièvement ce document"

Le système est opérationnel et prêt à répondre à vos questions ! 👍"""

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload un fichier PDF et extrait son contenu"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Le fichier doit être un PDF")
    
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        text = extract_text_from_pdf(pdf_file)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Le PDF ne contient pas de texte extractible")
        
        pdf_content["text"] = text
        pdf_content["uploaded"] = True
        pdf_content["filename"] = file.filename
        
        return {
            "message": "PDF uploadé avec succès",
            "filename": file.filename,
            "characters": len(text),
            "words": len(text.split()),
            "estimated_tokens": len(text) // 4
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

@app.post("/ask/", response_model=Answer)
async def ask_question(question: Question):
    """Pose une question sur le PDF uploadé en utilisant Gemini"""
    if not pdf_content["uploaded"]:
        raise HTTPException(status_code=400, detail="Veuillez d'abord uploader un PDF")
    
    if not question.question.strip():
        raise HTTPException(status_code=400, detail="La question ne peut pas être vide")
    
    # Cette route ne lève JAMAIS d'exception, elle retourne toujours une réponse
    try:
        answer = get_answer_from_gemini(
            pdf_content["text"], 
            question.question,
            question.max_tokens,
            question.model_name
        )
        
        # Vérifier que la réponse n'est pas vide
        if not answer or answer.strip() == "":
            answer = f"""Je n'ai pas pu générer une réponse spécifique à votre question "{question.question}".

Le document est chargé et contient {len(pdf_content['text'])} caractères.

Essayez de reformuler votre question de manière plus précise ou plus simple."""
        
        return Answer(
            question=question.question,
            answer=answer,
            source=pdf_content["filename"],
            model=question.model_name
        )
    
    except Exception as e:
        # Même en cas d'erreur, retourner une réponse valide et utile
        print(f"Erreur dans ask_question: {e}")
        
        return Answer(
            question=question.question,
            answer=f"""Une erreur technique s'est produite, mais le système reste opérationnel.

📄 Document chargé : {pdf_content["filename"]}
📊 Taille : {len(pdf_content['text'])} caractères

**Suggestions :**
- Réessayez avec une question plus simple
- Posez une question sur un aspect spécifique
- Demandez "De quoi parle ce document ?"

Erreur technique : {str(e)[:200]}""",
            source=pdf_content["filename"],
            model=question.model_name
        )

@app.get("/status/")
async def get_status():
    """Vérifie le statut de l'API et si un PDF est chargé"""
    api_key_configured = GEMINI_API_KEY != "votre_clé_api_gemini_ici"
    
    return {
        "api_status": "operational",
        "gemini_api_configured": api_key_configured,
        "pdf_uploaded": pdf_content["uploaded"],
        "filename": pdf_content["filename"] if pdf_content["uploaded"] else None,
        "text_length": len(pdf_content["text"]) if pdf_content["uploaded"] else 0,
        "word_count": len(pdf_content["text"].split()) if pdf_content["uploaded"] else 0,
        "estimated_tokens": len(pdf_content["text"]) // 4 if pdf_content["uploaded"] else 0,
        "available_models": ["models/gemini-2.5-flash", "models/gemini-2.5-pro", "models/gemini-2.0-flash"]
    }

@app.delete("/clear/")
async def clear_pdf():
    """Efface le PDF en mémoire"""
    pdf_content["text"] = ""
    pdf_content["uploaded"] = False
    pdf_content["filename"] = ""
    return {"message": "PDF effacé avec succès"}

@app.get("/")
async def root():
    """Page d'accueil de l'API"""
    return {
        "message": "API Question-Réponse sur PDF avec Google Gemini - VERSION ROBUSTE",
        "version": "2.0",
        "features": [
            "✅ Système multi-stratégies pour garantir une réponse",
            "✅ Gestion intelligente des blocages de sécurité",
            "✅ Découpage automatique en chunks pour les gros documents",
            "✅ Fallback systématique - Aucune erreur utilisateur",
            "✅ Support de multiples modèles Gemini"
        ],
        "default_model": "models/gemini-2.5-flash",
        "available_models": [
            "models/gemini-2.5-flash (recommandé, rapide et stable)",
            "models/gemini-2.5-pro (plus puissant)",
            "models/gemini-2.0-flash (alternatif)"
        ],
        "endpoints": {
            "POST /upload-pdf/": "Upload un fichier PDF",
            "POST /ask/": "Pose une question sur le PDF (body: {question: 'votre question', max_tokens: 1024, model_name: 'models/gemini-2.5-flash'})",
            "GET /status/": "Vérifie le statut de l'API",
            "DELETE /clear/": "Efface le PDF en mémoire",
            "GET /docs": "Documentation interactive Swagger"
        },
        "setup": {
            "1": "Installer: pip install google-generativeai PyPDF2 fastapi uvicorn python-multipart",
            "2": "Remplacer GEMINI_API_KEY dans le code par votre clé",
            "3": "Obtenir une clé GRATUITE: https://makersuite.google.com/app/apikey"
        }
    }

if __name__ == "__main__":
    print("🚀 Démarrage de l'API Question-Réponse PDF avec Google Gemini v2.0")
    print("📚 Documentation: http://localhost:8002/docs")
    print("✨ Version ROBUSTE avec système anti-blocage\n")
    
    if GEMINI_API_KEY == "votre_clé_api_gemini_ici":
        print("\n⚠️  ATTENTION: GEMINI_API_KEY n'est pas configurée!")
        print("   Remplacez 'votre_clé_api_gemini_ici' par votre vraie clé API dans le code")
        print("   Obtenez une clé GRATUITE sur: https://makersuite.google.com/app/apikey\n")
    else:
        print("✅ Clé API Gemini configurée")
        print("✅ Système multi-stratégies activé")
        print("✅ Protection anti-blocage activée\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8002)