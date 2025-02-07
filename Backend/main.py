from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from uuid import uuid4
import os
from dotenv import load_dotenv
import tempfile
from PIL import Image
import pytesseract
from PyPDF2 import PdfReader
import whisper
from openai import OpenAI
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
load_dotenv(override=True)
api_key = os.getenv('OPENAI_API_KEY') 
openai = OpenAI()

UPLOAD_FOLDER = "Uploads"
whisper_model = whisper.load_model("base")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file part in the request")
    
    name = file.filename
    if name == '':
        raise HTTPException(status_code=400, detail="No file selected")
    
    file_extension = os.path.splitext(name)[1].lower()
    
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf', '.mp3', '.wav', '.m4a', '.txt']
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type")

    uuid = uuid4()
    path = os.path.join(UPLOAD_FOLDER, f"{uuid}")
    text = ""

    with tempfile.NamedTemporaryFile(delete=False) as buffer:
        contents = await file.read()
        buffer.write(contents)
        buffer.flush()
        
        if file_extension in ['.jpg', '.jpeg', '.png']:
            image = Image.open(buffer.name)
            text = pytesseract.image_to_string(image)
        
        elif file_extension == '.pdf':
            pdf_reader = PdfReader(buffer.name)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        
        elif file_extension in ['.mp3', '.wav', '.m4a']:
            transcription = whisper_model.transcribe(buffer.name)
            text = transcription["text"]
            
        elif file_extension == '.txt':
            with open(buffer.name, 'r') as txt_file:
                text = txt_file.read()

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {'role': 'system', 'content': "You are a document summary generator. The user will present you with a document; you should generate a summary of the document without any framing (e.g. 'here is your summary'.)"},
                {'role': 'user', 'content': f"Summarize the following document.\n===\n{text}\n==="}
            ],
        )
        summary = response.choices[0].message.content

        with open(path, "w") as processed:
            processed.write(text)
        
    os.unlink(buffer.name)
        
    return JSONResponse({
        "message": "File uploaded successfully",
        "file_id": str(uuid),
        "text_preview": text[:200],
        "text_length": len(text),
        "summary": summary
    }, status_code=200)

@app.post("/interrogate")
async def interrogate(file_id: str, question: dict):
    path = os.path.join(UPLOAD_FOLDER, file_id)

    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail="File does not exist - did you upload it first?")
    
    if not question or 'question' not in question:
        raise HTTPException(status_code=400, detail="Expected JSON request body with 'question' field")
    
    query = question.get('question', '')
    
    with open(path, "r") as file:
        text = file.read()

    response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
            {'role': 'system', 'content': "You are a document querying system. The user will present you with a document and a question about the document; you should answer their question, citing portions of the original text as needed. Avoid framing, such as 'according to the document.'"},
            {'role': 'user', 'content': f"Document:\n===\n{text}\n===\nQuestion: {query}"}
        ],)
    
    output = response.choices[0].message.content

    return JSONResponse({"answer": output}, status_code=200)



sentiment_analyzer = pipeline("sentiment-analysis")

@app.post("/analyze-sentiment/")
async def analyze_sentiment(data: dict):
    text = data["text"]
    result = sentiment_analyzer(text)
    return {"sentiment": result[0]["label"], "score": result[0]["score"]}