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
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import time

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

class InterrogateRequest(BaseModel):
    file_id: str
    question: str

async def stream_response(text):
    for word in text.split():
        yield word + " "
        time.sleep(0.045)

@app.post("/interrogate/")
async def interrogate(data: InterrogateRequest):
    path = os.path.join(UPLOAD_FOLDER, data.file_id)

    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail="File does not exist - did you upload it first?")
    
    with open(path, "r") as file:
        text = file.read()

    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {'role': 'system', 'content': "You are a document querying system. The user will present you with a document and a question about the document; you should answer their question, citing portions of the original text as needed. Avoid framing, such as 'according to the document.'"},
            {'role': 'user', 'content': f"Document:\n===\n{text}\n===\nQuestion: {data.question}"}
        ]
    )

    output = response.choices[0].message.content
    return StreamingResponse(stream_response(output), media_type="text/plain")

sentiment_analyzer = pipeline("sentiment-analysis")

@app.post("/analyze-sentiment/")
async def analyze_sentiment(data: dict):
    try:
        text = data["text"]
        result = sentiment_analyzer(text)
        return {"sentiment": result[0]["label"], "score": result[0]["score"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")

@app.delete("/delete/{file_id}")
async def delete_file(file_id: str):
    file_path = os.path.join(UPLOAD_FOLDER, file_id)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="File does not exist")

    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")