from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database
from pydantic import BaseModel
from rapidfuzz import fuzz

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class MessageCreate(BaseModel):
    username: str
    content: str

class SearchQuery(BaseModel):
    query: str

@app.post("/messages/")
def add_message(msg: MessageCreate, db: Session = Depends(get_db)):
    new_msg = models.Message(username=msg.username, content=msg.content)
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return {"id": new_msg.id, "username": new_msg.username, "content": new_msg.content}

@app.get("/messages/")
def get_messages(db: Session = Depends(get_db)):
    return db.query(models.Message).all()

@app.post("/search/")
def deep_search(query: SearchQuery, db: Session = Depends(get_db)):
    messages = db.query(models.Message).all()
    results = []
    for msg in messages:
        score = fuzz.token_sort_ratio(query.query, msg.content)
        if score > 60:  # Fuzzy threshold
            results.append({
                "id": msg.id,
                "username": msg.username,
                "content": msg.content,
                "score": score
            })
    return sorted(results, key=lambda x: -x["score"])
