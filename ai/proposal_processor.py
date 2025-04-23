"""
KI-Modell für die Verarbeitung von Bürgervorschlägen

Dieses Modul implementiert die KI-Komponenten für die Analyse, Kategorisierung
und Priorisierung von Bürgervorschlägen im Rahmen des Bürgerbeteiligungssystems.

Die Implementierung basiert auf den definierten Anforderungen und ausgewählten
KI-Technologien, insbesondere BERT für die deutsche Sprache, spaCy für NLP-Aufgaben
und PyTorch für die Modellimplementierung.
"""

import os
import json
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Union, Any

# NLP und Deep Learning Bibliotheken
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModel, BertForSequenceClassification
import spacy

# Scikit-learn für klassische ML-Algorithmen und Evaluation
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.metrics.pairwise import cosine_similarity

# Konstanten
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models")
DATA_PATH = os.path.join(os.path.dirname(__file__), "data")
BERT_MODEL_NAME = "deepset/gbert-base"
MAX_LENGTH = 512
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Laden der Kategorien aus Konfigurationsdatei
def load_categories() -> List[str]:
    """Lädt die vordefinierten Kategorien aus der Konfigurationsdatei."""
    categories_file = os.path.join(DATA_PATH, "categories.json")
    if os.path.exists(categories_file):
        with open(categories_file, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        # Fallback zu Standardkategorien
        return [
            "Bildung", "Umwelt", "Verkehr", "Gesundheit", "Wirtschaft",
            "Digitalisierung", "Soziales", "Kultur", "Sicherheit", "Finanzen"
        ]

# Laden der Ministerien aus Konfigurationsdatei
def load_ministries() -> Dict[str, List[str]]:
    """Lädt die Ministerien und ihre zugeordneten Kategorien."""
    ministries_file = os.path.join(DATA_PATH, "ministries.json")
    if os.path.exists(ministries_file):
        with open(ministries_file, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        # Fallback zu Standardministerien
        return {
            "Bundesministerium für Bildung und Forschung": ["Bildung"],
            "Bundesministerium für Umwelt, Naturschutz und nukleare Sicherheit": ["Umwelt"],
            "Bundesministerium für Verkehr und digitale Infrastruktur": ["Verkehr", "Digitalisierung"],
            "Bundesministerium für Gesundheit": ["Gesundheit"],
            "Bundesministerium für Wirtschaft und Energie": ["Wirtschaft"]
        }

# Vorverarbeitungsklasse
class TextPreprocessor:
    """Klasse für die Vorverarbeitung von Texten."""
    
    def __init__(self):
        """Initialisiert den TextPreprocessor mit spaCy und BERT-Tokenizer."""
        # Laden des spaCy-Modells für Deutsch
        try:
            self.nlp = spacy.load("de_core_news_lg")
        except OSError:
            # Fallback zu kleinerem Modell, falls das große nicht verfügbar ist
            try:
                self.nlp = spacy.load("de_core_news_md")
            except OSError:
                # Installieren und Laden des Modells, falls nicht vorhanden
                os.system("python -m spacy download de_core_news_md")
                self.nlp = spacy.load("de_core_news_md")
        
        # Laden des BERT-Tokenizers
        self.tokenizer = AutoTokenizer.from_pretrained(BERT_MODEL_NAME)
    
    def clean_text(self, text: str) -> str:
        """Bereinigt den Text von unerwünschten Zeichen und normalisiert ihn."""
        # Grundlegende Textbereinigung
        text = text.strip()
        # Entfernung von mehrfachen Leerzeichen
        text = " ".join(text.split())
        return text
    
    def extract_features(self, text: str) -> Dict[str, Any]:
        """Extrahiert linguistische Merkmale aus dem Text."""
        doc = self.nlp(text)
        
        # Grundlegende Textstatistiken
        features = {
            "num_tokens": len(doc),
            "num_sentences": len(list(doc.sents)),
            "avg_token_length": np.mean([len(token.text) for token in doc]) if len(doc) > 0 else 0,
            "avg_sentence_length": np.mean([len(sent) for sent in doc.sents]) if len(list(doc.sents)) > 0 else 0,
        }
        
        # POS-Tag-Verteilung
        pos_counts = {}
        for token in doc:
            pos = token.pos_
            pos_counts[pos] = pos_counts.get(pos, 0) + 1
        
        for pos, count in pos_counts.items():
            features[f"pos_{pos}"] = count / len(doc) if len(doc) > 0 else 0
        
        # Entitäten
        entities = {}
        for ent in doc.ents:
            ent_type = ent.label_
            entities[ent_type] = entities.get(ent_type, 0) + 1
        
        for ent_type, count in entities.items():
            features[f"ent_{ent_type}"] = count
        
        # Sentiment-Analyse (einfache Heuristik basierend auf spaCy)
        sentiment_score = 0
        for token in doc:
            if token.pos_ in ["ADJ", "ADV"]:
                # Einfache Heuristik: Positiv/Negativ basierend auf Lexikon
                # In einer vollständigen Implementierung würde hier ein Sentiment-Lexikon verwendet
                pass
        
        features["sentiment_score"] = sentiment_score
        
        return features
    
    def tokenize_for_bert(self, text: str) -> Dict[str, torch.Tensor]:
        """Tokenisiert den Text für die Verwendung mit BERT."""
        return self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=MAX_LENGTH,
            return_tensors="pt"
        )
    
    def process_text(self, text: str) -> Dict[str, Any]:
        """Führt die vollständige Textverarbeitung durch."""
        cleaned_text = self.clean_text(text)
        features = self.extract_features(cleaned_text)
        tokenized = self.tokenize_for_bert(cleaned_text)
        
        return {
            "cleaned_text": cleaned_text,
            "features": features,
            "tokenized": tokenized
        }

# Dataset-Klasse für BERT-Finetuning
class ProposalDataset(Dataset):
    """Dataset-Klasse für Vorschläge mit Kategorien."""
    
    def __init__(self, texts: List[str], labels: List[List[int]], preprocessor: TextPreprocessor):
        """
        Initialisiert das Dataset.
        
        Args:
            texts: Liste von Vorschlagstexten
            labels: Liste von One-Hot-Encoded Kategorielabels
            preprocessor: TextPreprocessor-Instanz
        """
        self.texts = texts
        self.labels = labels
        self.preprocessor = preprocessor
    
    def __len__(self) -> int:
        return len(self.texts)
    
    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        text = self.texts[idx]
        label = self.labels[idx]
        
        # Tokenisierung für BERT
        tokenized = self.preprocessor.tokenize_for_bert(text)
        
        # Konvertierung der Labels zu Tensor
        label_tensor = torch.tensor(label, dtype=torch.float)
        
        return {
            "input_ids": tokenized["input_ids"].squeeze(),
            "attention_mask": tokenized["attention_mask"].squeeze(),
            "labels": label_tensor
        }

# Modellklasse für Multi-Label-Kategorisierung
class ProposalCategorizer(nn.Module):
    """Modell für die Multi-Label-Kategorisierung von Vorschlägen."""
    
    def __init__(self, num_categories: int, dropout_rate: float = 0.3):
        """
        Initialisiert das Kategorisierungsmodell.
        
        Args:
            num_categories: Anzahl der Kategorien
            dropout_rate: Dropout-Rate für Regularisierung
        """
        super(ProposalCategorizer, self).__init__()
        
        # Laden des vortrainierten BERT-Modells
        self.bert = AutoModel.from_pretrained(BERT_MODEL_NAME)
        
        # Ausgabedimension des BERT-Modells
        hidden_size = self.bert.config.hidden_size
        
        # Klassifikationsschichten
        self.dropout = nn.Dropout(dropout_rate)
        self.classifier = nn.Linear(hidden_size, num_categories)
    
    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """
        Forward-Pass durch das Modell.
        
        Args:
            input_ids: Token-IDs
            attention_mask: Attention-Mask
            
        Returns:
            Logits für jede Kategorie
        """
        # BERT-Ausgabe
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        
        # Verwenden des [CLS]-Token für die Klassifikation
        pooled_output = outputs.last_hidden_state[:, 0, :]
        
        # Dropout und Klassifikation
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        
        return logits

# Modellklasse für Qualitätsbewertung
class ProposalQualityEvaluator(nn.Module):
    """Modell für die Bewertung der Qualität von Vorschlägen."""
    
    def __init__(self, num_dimensions: int = 4, dropout_rate: float = 0.3):
        """
        Initialisiert das Qualitätsbewertungsmodell.
        
        Args:
            num_dimensions: Anzahl der Qualitätsdimensionen (z.B. Relevanz, Umsetzbarkeit)
            dropout_rate: Dropout-Rate für Regularisierung
        """
        super(ProposalQualityEvaluator, self).__init__()
        
        # Laden des vortrainierten BERT-Modells
        self.bert = AutoModel.from_pretrained(BERT_MODEL_NAME)
        
        # Ausgabedimension des BERT-Modells
        hidden_size = self.bert.config.hidden_size
        
        # Regressionsschichten für jede Qualitätsdimension
        self.dropout = nn.Dropout(dropout_rate)
        self.regressor = nn.Linear(hidden_size, num_dimensions)
    
    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """
        Forward-Pass durch das Modell.
        
        Args:
            input_ids: Token-IDs
            attention_mask: Attention-Mask
            
        Returns:
            Scores für jede Qualitätsdimension
        """
        # BERT-Ausgabe
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        
        # Verwenden des [CLS]-Token für die Regression
        pooled_output = outputs.last_hidden_state[:, 0, :]
        
        # Dropout und Regression
        pooled_output = self.dropout(pooled_output)
        scores = self.regressor(pooled_output)
        
        # Sigmoid-Aktivierung für Scores im Bereich [0, 1]
        # (wird später auf den Bereich [1, 5] skaliert)
        scores = torch.sigmoid(scores)
        
        return scores

# Klasse für Ähnlichkeitsberechnung und Duplikaterkennung
class SimilarityAnalyzer:
    """Klasse für die Berechnung von Textähnlichkeiten und Duplikaterkennung."""
    
    def __init__(self, model_name: str = BERT_MODEL_NAME):
        """
        Initialisiert den SimilarityAnalyzer.
        
        Args:
            model_name: Name des zu verwendenden Sprachmodells
        """
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.to(DEVICE)
        self.model.eval()
    
    def get_embedding(self, text: str) -> np.ndarray:
        """
        Erzeugt eine Einbettung für den gegebenen Text.
        
        Args:
            text: Einzubettender Text
            
        Returns:
            Einbettungsvektor
        """
        # Tokenisierung
        inputs = self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=MAX_LENGTH,
            return_tensors="pt"
        )
        
        # Verschieben der Tensoren auf das Gerät
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
        
        # Berechnung der Einbettung
        with torch.no_grad():
            outputs = self.model(**inputs)
            # Verwenden des [CLS]-Token als Satzeinbettung
            embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()
        
        return embedding[0]
    
    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Berechnet die Ähnlichkeit zwischen zwei Texten.
        
        Args:
            text1: Erster Text
            text2: Zweiter Text
            
        Returns:
            Ähnlichkeitswert zwischen 0 und 1
        """
        # Berechnung der Einbettungen
        embedding1 = self.get_embedding(text1)
        embedding2 = self.get_embedding(text2)
        
        # Berechnung der Kosinus-Ähnlichkeit
        similarity = cosine_similarity([embedding1], [embedding2])[0][0]
        
        return float(similarity)
    
    def is_duplicate(self, text: str, reference_texts: List[str], threshold: float = 0.85) -> Tuple[bool, int, float]:
        """
        Prüft, ob ein Text ein Duplikat eines der Referenztexte ist.
        
        Args:
            text: Zu prüfender Text
            reference_texts: Liste von Referenztexten
            threshold: Schwellenwert für die Duplikaterkennung
            
        Returns:
            Tuple aus (ist_duplikat, index_des_duplikats, ähnlichkeitswert)
            Wenn kein Duplikat gefunden wurde, ist index_des_duplikats -1
        """
        if not reference_texts:
            return False, -1, 0.0
        
        # Berechnung der Einbettung für den zu prüfenden Text
        embedding = self.get_embedding(text)
        
        # Berechnung der Einbettungen für die Referenztexte
        reference_embeddings = np.array([self.get_embedding(ref_text) for ref_text in reference_texts])
        
        # Berechnung der Ähnlichkeiten
        similarities = cosine_similarity([embedding], reference_embeddings)[0]
        
        # Finden des ähnlichsten Texts
        max_similarity = np.max(similarities)
        max_index = np.argmax(similarities)
        
        # Prüfung, ob der ähnlichste Text ein Duplikat ist
        is_duplicate = max_similarity >= threshold
        
        return is_duplicate, int(max_index) if is_duplicate else -1, float(max_similarity)

# Hauptklasse für die Vorschlagsverarbeitung
class ProposalProcessor:
    """Hauptklasse für die Verarbeitung von Bürgervorschlägen."""
    
    def __init__(self, load_models: bool = True):
        """
        Initialisiert den ProposalProcessor.
        
        Args:
            load_models: Ob die Modelle geladen werden sollen
        """
        # Laden der Kategorien und Ministerien
        self.categories = load_categories()
        self.ministries = load_ministries()
        self.num_categories = len(self.categories)
        
        # Initialisierung der Komponenten
        self.preprocessor = TextPreprocessor()
        self.similarity_analyzer = SimilarityAnalyzer()
        
        # Initialisierung der Modelle
        if load_models:
            self.categorizer = self._load_categorizer()
            self.quality_evaluator = self._load_quality_evaluator()
        else:
            self.categorizer = None
            self.quality_evaluator = None
        
        # MultiLabelBinarizer für Kategorien
        self.mlb = MultiLabelBinarizer(classes=self.categories)
        self.mlb.fit([self.categories])
    
    def _load_categorizer(self) -> ProposalCategorizer:
        """Lädt das Kategorisierungsmodell."""
        model = ProposalCategorizer(self.num_categories)
        model_path = os.path.join(MODEL_PATH, "categorizer.pt")
        
        if os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location=DEVICE))
        
        model.to(DEVICE)
        model.eval()
        return model
    
    def _load_quality_evaluator(self) -> ProposalQualityEvaluator:
        """Lädt das Qualitätsbewertungsmodell."""
        model = ProposalQualityEvaluator()
        model_path = os.path.join(MODEL_PATH, "quality_evaluator.pt")
        
        if os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location=DEVICE))
        
        model.to(DEVICE)
        model.eval()
        return model
    
    def categorize(self, text: str, threshold: float = 0.5) -> Dict[str, float]:
        """
        Kategorisiert einen Vorschlag.
        
        Args:
            text: Vorschlagstext
            threshold: Schwellenwert für die Kategorienzuordnung
            
        Returns:
            Dictionary mit Kategorien und Konfidenzwerten
        """
        if self.categorizer is None:
            raise ValueError("Kategorisierungsmodell nicht geladen")
        
        # Vorverarbeitung des Texts
        processed = self.preprocessor.process_text(text)
        
        # Verschieben der Tensoren auf das Gerät
        input_ids = processed["tokenized"]["input_ids"].to(DEVICE)
        attention_mask = processed["tokenized"]["attention_mask"].to(DEVICE)
        
        # Vorhersage
        with torch.no_grad():
            logits = self.categorizer(input_ids, attention_mask)
            probabilities = torch.sigmoid(logits).cpu().numpy()[0]
        
        # Zuordnung der Kategorien mit Konfidenzwerten
        category_scores = {
            self.categories[i]: float(probabilities[i])
            for i in range(self.num_categories)
            if probabilities[i] >= threshold
        }
        
        # Wenn keine Kategorie über dem Schwellenwert liegt, nehmen wir die mit der höchsten Wahrscheinlichkeit
        if not category_scores:
            max_index = np.argmax(probabilities)
            category_scores = {self.categories[max_index]: float(probabilities[max_index])}
        
        return category_scores
    
    def evaluate_quality(self, text: str) -> Dict[str, float]:
        """
        Bewertet die Qualität eines Vorschlags.
        
        Args:
            text: Vorschlagstext
            
        Returns:
            Dictionary mit Qualitätsdimensionen und Scores
        """
        if self.quality_evaluator is None:
            raise ValueError("Qualitätsbewertungsmodell nicht geladen")
        
        # Vorverarbeitung des Texts
        processed = self.preprocessor.process_text(text)
        
        # Verschieben der Tensoren auf das Gerät
        input_ids = processed["tokenized"]["input_ids"].to(DEVICE)
        attention_mask = processed["tokenized"]["attention_mask"].to(DEVICE)
        
        # Vorhersage
        with torch.no_grad():
            scores = self.quality_evaluator(input_ids, attention_mask).cpu().numpy()[0]
        
        # Skalierung der Scores auf den Bereich [1, 5]
        scores = 1 + 4 * scores
        
        # Zuordnung der Qualitätsdimensionen
        quality_scores = {
            "relevance": float(scores[0]),
            "feasibility": float(scores[1]),
            "clarity": float(scores[2]),
            "constructiveness": float(scores[3]),
            "overall_quality": float(np.mean(scores))
        }
        
        return quality_scores
    
    def assign_ministries(self, categories: Dict[str, float]) -> Dict[str, float]:
        """
        Weist Ministerien basierend auf den Kategorien zu.
        
        Args:
            categories: Dictionary mit Kategorien und Konfidenzwerten
            
        Returns:
            Dictionary mit Ministerien und Konfidenzwerten
        """
        ministry_scores = {}
        
        for ministry, ministry_categories in self.ministries.items():
            # Berechnung des Konfidenzwerts für das Ministerium
            confidence = 0.0
            matches = 0
            
            for category in ministry_categories:
                if category in categories:
                    confidence += categories[category]
                    matches += 1
            
            # Normalisierung des Konfidenzwerts
            if matches > 0:
                confidence /= matches
                ministry_scores[ministry] = float(confidence)
        
        return ministry_scores
    
    def calculate_priority(self, quality_scores: Dict[str, float], category_scores: Dict[str, float]) -> int:
        """
        Berechnet die Priorität eines Vorschlags.
        
        Args:
            quality_scores: Dictionary mit Qualitätsdimensionen und Scores
            category_scores: Dictionary mit Kategorien und Konfidenzwerten
            
        Returns:
            Prioritätswert zwischen 1 (niedrig) und 5 (hoch)
        """
        # Gewichtete Summe aus Qualitätsscores und Kategorienkonfidenz
        overall_quality = quality_scores["overall_quality"]
        relevance = quality_scores["relevance"]
        feasibility = quality_scores["feasibility"]
        
        # Durchschnittliche Kategorienkonfidenz
        avg_category_confidence = np.mean(list(category_scores.values()))
        
        # Gewichtete Berechnung der Priorität
        priority_score = (
            0.4 * relevance +
            0.3 * overall_quality +
            0.2 * feasibility +
            0.1 * avg_category_confidence
        )
        
        # Skalierung auf den Bereich [1, 5] und Rundung
        priority = int(round(1 + 4 * (priority_score - 1) / 4))
        
        return max(1, min(5, priority))
    
    def process_proposal(self, text: str) -> Dict[str, Any]:
        """
        Verarbeitet einen Vorschlag vollständig.
        
        Args:
            text: Vorschlagstext
            
        Returns:
            Dictionary mit allen Analyseergebnissen
        """
        # Kategorisierung
        category_scores = self.categorize(text)
        
        # Qualitätsbewertung
        quality_scores = self.evaluate_quality(text)
        
        # Ministeriumszuordnung
        ministry_scores = self.assign_ministries(category_scores)
        
        # Prioritätsberechnung
        priority = self.calculate_priority(quality_scores, category_scores)
        
        # Extraktion linguistischer Merkmale
        processed = self.preprocessor.process_text(text)
        features = processed["features"]
        
        # Zusammenstellung der Ergebnisse
        results = {
            "categories": category_scores,
            "ministries": ministry_scores,
            "quality": quality_scores,
            "priority": priority,
            "features": features,
            "processed_text": processed["cleaned_text"]
        }
        
        return results
    
    def check_similarity(self, text: str, reference_texts: List[str]) -> Dict[str, Any]:
        """
        Prüft die Ähnlichkeit eines Vorschlags zu Referenzvorschlägen.
        
        Args:
            text: Vorschlagstext
            reference_texts: Liste von Referenzvorschlägen
            
        Returns:
            Dictionary mit Ähnlichkeitsinformationen
        """
        is_duplicate, duplicate_index, similarity = self.similarity_analyzer.is_duplicate(
            text, reference_texts
        )
        
        result = {
            "is_duplicate": is_duplicate,
            "duplicate_index": duplicate_index,
            "similarity": similarity
        }
        
        if is_duplicate and duplicate_index >= 0:
            result["duplicate_text"] = reference_texts[duplicate_index]
        
        return result
    
    def train_categorizer(self, texts: List[str], labels: List[List[str]], 
                          batch_size: int = 16, num_epochs: int = 3, 
                          learning_rate: float = 2e-5) -> Dict[str, Any]:
        """
        Trainiert das Kategorisierungsmodell.
        
        Args:
            texts: Liste von Vorschlagstexten
            labels: Liste von Kategorielisten für jeden Vorschlag
            batch_size: Batch-Größe für das Training
            num_epochs: Anzahl der Trainingsepochen
            learning_rate: Lernrate
            
        Returns:
            Dictionary mit Trainingsergebnissen
        """
        # Konvertierung der Labels zu One-Hot-Encoding
        y = self.mlb.transform(labels)
        
        # Erstellung des Datasets und DataLoaders
        dataset = ProposalDataset(texts, y, self.preprocessor)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        # Initialisierung des Modells
        model = ProposalCategorizer(self.num_categories)
        model.to(DEVICE)
        
        # Optimierer und Verlustfunktion
        optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
        criterion = nn.BCEWithLogitsLoss()
        
        # Training
        model.train()
        training_stats = []
        
        for epoch in range(num_epochs):
            epoch_loss = 0.0
            
            for batch in dataloader:
                # Verschieben der Tensoren auf das Gerät
                input_ids = batch["input_ids"].to(DEVICE)
                attention_mask = batch["attention_mask"].to(DEVICE)
                labels = batch["labels"].to(DEVICE)
                
                # Forward-Pass
                optimizer.zero_grad()
                logits = model(input_ids, attention_mask)
                
                # Berechnung des Verlusts
                loss = criterion(logits, labels)
                
                # Backward-Pass und Optimierung
                loss.backward()
                optimizer.step()
                
                epoch_loss += loss.item()
            
            # Speichern der Trainingsstatistik
            avg_epoch_loss = epoch_loss / len(dataloader)
            training_stats.append({
                "epoch": epoch + 1,
                "avg_loss": avg_epoch_loss
            })
            
            print(f"Epoch {epoch + 1}/{num_epochs}, Loss: {avg_epoch_loss:.4f}")
        
        # Speichern des Modells
        os.makedirs(MODEL_PATH, exist_ok=True)
        torch.save(model.state_dict(), os.path.join(MODEL_PATH, "categorizer.pt"))
        
        # Aktualisierung des Modells im Processor
        self.categorizer = model
        
        return {
            "training_stats": training_stats,
            "model_path": os.path.join(MODEL_PATH, "categorizer.pt")
        }
    
    def train_quality_evaluator(self, texts: List[str], quality_scores: List[List[float]],
                               batch_size: int = 16, num_epochs: int = 3,
                               learning_rate: float = 2e-5) -> Dict[str, Any]:
        """
        Trainiert das Qualitätsbewertungsmodell.
        
        Args:
            texts: Liste von Vorschlagstexten
            quality_scores: Liste von Qualitätsscores für jeden Vorschlag
                           (Relevanz, Umsetzbarkeit, Klarheit, Konstruktivität)
            batch_size: Batch-Größe für das Training
            num_epochs: Anzahl der Trainingsepochen
            learning_rate: Lernrate
            
        Returns:
            Dictionary mit Trainingsergebnissen
        """
        # Konvertierung der Scores zu Numpy-Array und Skalierung auf [0, 1]
        y = np.array(quality_scores) / 5.0
        
        # Erstellung eines eigenen Datasets und DataLoaders
        class QualityDataset(Dataset):
            def __init__(self, texts, scores, preprocessor):
                self.texts = texts
                self.scores = scores
                self.preprocessor = preprocessor
            
            def __len__(self):
                return len(self.texts)
            
            def __getitem__(self, idx):
                text = self.texts[idx]
                score = self.scores[idx]
                
                tokenized = self.preprocessor.tokenize_for_bert(text)
                score_tensor = torch.tensor(score, dtype=torch.float)
                
                return {
                    "input_ids": tokenized["input_ids"].squeeze(),
                    "attention_mask": tokenized["attention_mask"].squeeze(),
                    "scores": score_tensor
                }
        
        dataset = QualityDataset(texts, y, self.preprocessor)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        # Initialisierung des Modells
        model = ProposalQualityEvaluator()
        model.to(DEVICE)
        
        # Optimierer und Verlustfunktion
        optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
        criterion = nn.MSELoss()
        
        # Training
        model.train()
        training_stats = []
        
        for epoch in range(num_epochs):
            epoch_loss = 0.0
            
            for batch in dataloader:
                # Verschieben der Tensoren auf das Gerät
                input_ids = batch["input_ids"].to(DEVICE)
                attention_mask = batch["attention_mask"].to(DEVICE)
                scores = batch["scores"].to(DEVICE)
                
                # Forward-Pass
                optimizer.zero_grad()
                predicted_scores = model(input_ids, attention_mask)
                
                # Berechnung des Verlusts
                loss = criterion(predicted_scores, scores)
                
                # Backward-Pass und Optimierung
                loss.backward()
                optimizer.step()
                
                epoch_loss += loss.item()
            
            # Speichern der Trainingsstatistik
            avg_epoch_loss = epoch_loss / len(dataloader)
            training_stats.append({
                "epoch": epoch + 1,
                "avg_loss": avg_epoch_loss
            })
            
            print(f"Epoch {epoch + 1}/{num_epochs}, Loss: {avg_epoch_loss:.4f}")
        
        # Speichern des Modells
        os.makedirs(MODEL_PATH, exist_ok=True)
        torch.save(model.state_dict(), os.path.join(MODEL_PATH, "quality_evaluator.pt"))
        
        # Aktualisierung des Modells im Processor
        self.quality_evaluator = model
        
        return {
            "training_stats": training_stats,
            "model_path": os.path.join(MODEL_PATH, "quality_evaluator.pt")
        }

# Beispiel für die Verwendung
if __name__ == "__main__":
    # Initialisierung des Processors
    processor = ProposalProcessor(load_models=False)
    
    # Beispielvorschläge
    example_proposals = [
        "Ich schlage vor, mehr Fahrradwege in der Innenstadt zu bauen, um den Verkehr zu entlasten und die Umwelt zu schonen.",
        "Die Schulen sollten besser mit digitalen Geräten ausgestattet werden, damit die Schüler auf die digitale Zukunft vorbereitet sind.",
        "Es sollten mehr Grünflächen in der Stadt angelegt werden, um die Luftqualität zu verbessern und den Bürgern Erholungsmöglichkeiten zu bieten."
    ]
    
    # Beispielkategorien
    example_categories = [
        ["Verkehr", "Umwelt"],
        ["Bildung", "Digitalisierung"],
        ["Umwelt", "Gesundheit"]
    ]
    
    # Beispielqualitätsscores (Relevanz, Umsetzbarkeit, Klarheit, Konstruktivität)
    example_quality_scores = [
        [4.2, 3.8, 4.5, 4.0],
        [4.5, 3.5, 4.0, 4.2],
        [3.8, 3.2, 4.3, 3.9]
    ]
    
    # Training des Kategorisierungsmodells
    categorizer_results = processor.train_categorizer(
        example_proposals, example_categories, batch_size=2, num_epochs=2
    )
    
    # Training des Qualitätsbewertungsmodells
    quality_results = processor.train_quality_evaluator(
        example_proposals, example_quality_scores, batch_size=2, num_epochs=2
    )
    
    # Verarbeitung eines neuen Vorschlags
    new_proposal = "Wir sollten mehr öffentliche Verkehrsmittel einsetzen, um den CO2-Ausstoß zu reduzieren."
    results = processor.process_proposal(new_proposal)
    
    print("\nVerarbeitungsergebnisse:")
    print(f"Kategorien: {results['categories']}")
    print(f"Ministerien: {results['ministries']}")
    print(f"Qualität: {results['quality']}")
    print(f"Priorität: {results['priority']}")
    
    # Ähnlichkeitsprüfung
    similarity_results = processor.check_similarity(new_proposal, example_proposals)
    print(f"\nÄhnlichkeitsergebnisse: {similarity_results}")
