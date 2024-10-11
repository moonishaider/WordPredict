from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import re
import nltk
from nltk.corpus import stopwords
import os
import pickle
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# Download the stopwords dataset
nltk.download('stopwords', quiet=True)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your Next.js app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store model and tokenizer
model = None
tokenizer = None
seq_length = 8

class TextGenerationRequest(BaseModel):
    seed_text: str
    next_words: int = 8

# Data Preprocessing
def preprocess_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read().lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    words = text.split()
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word not in stop_words]
    return ' '.join(words)

# Tokenization and Sequence Creation
def create_sequences(text, seq_length):
    tokenizer = Tokenizer()
    tokenizer.fit_on_texts([text])
    total_words = len(tokenizer.word_index) + 1
    input_sequences = []
    for i in range(len(text.split()) - seq_length):
        seq = text.split()[i:i + seq_length]
        input_sequences.append(seq)
    X = []
    y = []
    for seq in input_sequences:
        X.append(seq[:-1])
        y.append(seq[-1])
    X = tokenizer.texts_to_sequences(X)
    X = pad_sequences(X, maxlen=seq_length - 1, padding='pre')
    y = np.array(tokenizer.texts_to_sequences(y)).flatten()
    return np.array(X), np.array(y), tokenizer, total_words

# Build the LSTM Model
def build_model(total_words, seq_length, embedding_dim=200, lstm_units=256):
    model = Sequential([
        Embedding(total_words, embedding_dim, input_length=seq_length - 1),
        Bidirectional(LSTM(lstm_units, return_sequences=True)),
        Dropout(0.3),
        LSTM(lstm_units),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(total_words, activation='softmax')
    ])
    model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model

# Generate Text
def generate_text(seed_text, next_words, model, tokenizer, seq_length):
    for _ in range(next_words):
        token_list = tokenizer.texts_to_sequences([seed_text])[0]
        token_list = pad_sequences([token_list], maxlen=seq_length - 1, padding='pre')
        predicted_probs = model.predict(token_list, verbose=0)
        predicted_index = np.argmax(predicted_probs, axis=-1)[0]
        output_word = [word for word, index in tokenizer.word_index.items() if index == predicted_index]
        if output_word:
            seed_text += " " + output_word[0]
        else:
            break
    return seed_text

# Save and Load Model/Tokenizer
def save_model_and_tokenizer(model, tokenizer, model_path='model.h5', tokenizer_path='tokenizer.pkl'):
    model.save(model_path)
    with open(tokenizer_path, 'wb') as file:
        pickle.dump(tokenizer, file)

def load_model_and_tokenizer(model_path='model.h5', tokenizer_path='tokenizer.pkl'):
    model = load_model(model_path)
    with open(tokenizer_path, 'rb') as file:
        tokenizer = pickle.load(file)
    return model, tokenizer

def initialize_model(file_path, model_path, tokenizer_path, seq_length, embedding_dim, lstm_units, epochs, batch_size):
    if os.path.exists(model_path) and os.path.exists(tokenizer_path):
        print("Loading the trained model and tokenizer...")
        model, tokenizer = load_model_and_tokenizer(model_path, tokenizer_path)
    else:
        preprocessed_text = preprocess_text(file_path)
        X, y, tokenizer, total_words = create_sequences(preprocessed_text, seq_length)
        model = build_model(total_words, seq_length, embedding_dim, lstm_units)
        early_stopping = EarlyStopping(monitor='loss', patience=5, restore_best_weights=True)
        reduce_lr = ReduceLROnPlateau(monitor='loss', factor=0.5, patience=3, min_lr=0.0001)
        model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=1, callbacks=[early_stopping, reduce_lr])
        save_model_and_tokenizer(model, tokenizer, model_path, tokenizer_path)
    return model, tokenizer

@app.on_event("startup")
async def startup_event():
    global model, tokenizer
    file_path = 'Data.txt'
    model_path = 'model.h5'
    tokenizer_path = 'tokenizer.pkl'
    embedding_dim = 200
    lstm_units = 256
    epochs = 120
    batch_size = 64

    model, tokenizer = initialize_model(
        file_path, model_path, tokenizer_path, seq_length,
        embedding_dim, lstm_units, epochs, batch_size
    )

@app.post("/generate_text")
async def generate_text_api(request: TextGenerationRequest):
    if not model or not tokenizer:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    generated_text = generate_text(
        request.seed_text, request.next_words, model, tokenizer, seq_length
    )
    return {"generated_text": generated_text}

@app.get("/")
async def root():
    return {"message": "Welcome to the Text Generation API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)