"""
Kategorisierungs- und Sortieralgorithmen für das Bürgerbeteiligungssystem

Dieses Modul implementiert spezialisierte Algorithmen für die Kategorisierung,
Sortierung und Priorisierung von Bürgervorschlägen, basierend auf dem
KI-Modell zur Vorschlagsverarbeitung.
"""

import os
import json
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Union, Any
from collections import defaultdict, Counter
import heapq
from datetime import datetime

# Import des KI-Modells
from proposal_processor import ProposalProcessor, TextPreprocessor, SimilarityAnalyzer

# Konstanten
DATA_PATH = os.path.join(os.path.dirname(__file__), "data")
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config")


class ProposalCategorizer:
    """Klasse für die erweiterte Kategorisierung von Bürgervorschlägen."""
    
    def __init__(self, processor: Optional[ProposalProcessor] = None):
        """
        Initialisiert den ProposalCategorizer.
        
        Args:
            processor: Optional vorhandene ProposalProcessor-Instanz
        """
        self.processor = processor or ProposalProcessor()
        
        # Laden der Kategoriekonfiguration
        self.categories = self._load_categories()
        self.category_hierarchy = self._load_category_hierarchy()
        self.ministry_categories = self._load_ministry_categories()
        
        # Schwellenwerte für die Kategorisierung
        self.primary_threshold = 0.6  # Schwellenwert für primäre Kategorie
        self.secondary_threshold = 0.4  # Schwellenwert für sekundäre Kategorien
        self.max_categories = 3  # Maximale Anzahl von Kategorien pro Vorschlag
    
    def _load_categories(self) -> Dict[str, Dict[str, Any]]:
        """Lädt die detaillierten Kategoriedefinitionen."""
        categories_file = os.path.join(CONFIG_PATH, "categories_extended.json")
        if os.path.exists(categories_file):
            with open(categories_file, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            # Fallback zu einfachen Kategorien
            return {cat: {"name": cat, "description": f"Kategorie für {cat}"} 
                   for cat in self.processor.categories}
    
    def _load_category_hierarchy(self) -> Dict[str, List[str]]:
        """Lädt die Kategoriehierarchie (Ober-/Unterkategorien)."""
        hierarchy_file = os.path.join(CONFIG_PATH, "category_hierarchy.json")
        if os.path.exists(hierarchy_file):
            with open(hierarchy_file, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            # Fallback zu flacher Hierarchie
            return {cat: [] for cat in self.processor.categories}
    
    def _load_ministry_categories(self) -> Dict[str, List[str]]:
        """Lädt die Zuordnung von Ministerien zu Kategorien."""
        return self.processor.ministries
    
    def categorize_proposal(self, text: str) -> Dict[str, Any]:
        """
        Kategorisiert einen Vorschlag mit erweiterten Informationen.
        
        Args:
            text: Vorschlagstext
            
        Returns:
            Dictionary mit Kategorisierungsergebnissen
        """
        # Grundlegende Kategorisierung durch das KI-Modell
        category_scores = self.processor.categorize(text)
        
        # Sortierung der Kategorien nach Konfidenz
        sorted_categories = sorted(
            category_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        # Bestimmung der primären und sekundären Kategorien
        primary_category = None
        secondary_categories = []
        
        if sorted_categories:
            # Primäre Kategorie ist die mit der höchsten Konfidenz über dem Schwellenwert
            if sorted_categories[0][1] >= self.primary_threshold:
                primary_category = sorted_categories[0][0]
            
            # Sekundäre Kategorien sind alle anderen über dem Schwellenwert
            secondary_categories = [
                cat for cat, score in sorted_categories[1:self.max_categories]
                if score >= self.secondary_threshold
            ]
        
        # Wenn keine primäre Kategorie gefunden wurde, nehmen wir die mit der höchsten Konfidenz
        if primary_category is None and sorted_categories:
            primary_category = sorted_categories[0][0]
        
        # Bestimmung der zuständigen Ministerien
        ministry_scores = self.processor.assign_ministries(category_scores)
        
        # Sortierung der Ministerien nach Konfidenz
        sorted_ministries = sorted(
            ministry_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Zusammenstellung der Ergebnisse
        results = {
            "primary_category": primary_category,
            "secondary_categories": secondary_categories,
            "all_categories": dict(sorted_categories),
            "primary_ministry": sorted_ministries[0][0] if sorted_ministries else None,
            "all_ministries": dict(sorted_ministries),
            "category_details": {
                cat: self.categories.get(cat, {"name": cat, "description": ""})
                for cat in [primary_category] + secondary_categories
                if cat is not None
            }
        }
        
        return results
    
    def batch_categorize(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Kategorisiert mehrere Vorschläge in einem Batch.
        
        Args:
            texts: Liste von Vorschlagstexten
            
        Returns:
            Liste von Kategorisierungsergebnissen
        """
        return [self.categorize_proposal(text) for text in texts]
    
    def get_related_categories(self, category: str) -> List[str]:
        """
        Gibt verwandte Kategorien für eine gegebene Kategorie zurück.
        
        Args:
            category: Kategoriename
            
        Returns:
            Liste verwandter Kategorien
        """
        related = []
        
        # Oberkategorien (falls vorhanden)
        for parent, children in self.category_hierarchy.items():
            if category in children:
                related.append(parent)
        
        # Unterkategorien
        if category in self.category_hierarchy:
            related.extend(self.category_hierarchy[category])
        
        # Kategorien im selben Ministerium
        for ministry, categories in self.ministry_categories.items():
            if category in categories:
                related.extend([cat for cat in categories if cat != category])
        
        return list(set(related))  # Entfernung von Duplikaten


class ProposalSorter:
    """Klasse für die Sortierung und Priorisierung von Bürgervorschlägen."""
    
    def __init__(self, processor: Optional[ProposalProcessor] = None):
        """
        Initialisiert den ProposalSorter.
        
        Args:
            processor: Optional vorhandene ProposalProcessor-Instanz
        """
        self.processor = processor or ProposalProcessor()
        
        # Gewichtungen für verschiedene Sortierkriterien
        self.weights = {
            "quality": 0.4,
            "relevance": 0.3,
            "feasibility": 0.2,
            "recency": 0.1
        }
    
    def calculate_priority_score(self, proposal_data: Dict[str, Any]) -> float:
        """
        Berechnet einen Prioritätsscore für einen Vorschlag.
        
        Args:
            proposal_data: Dictionary mit Vorschlagsdaten
                (muss 'quality', 'created_at' und optional 'votes' enthalten)
            
        Returns:
            Prioritätsscore zwischen 0 und 1
        """
        quality_score = proposal_data.get("quality", {}).get("overall_quality", 3.0) / 5.0
        relevance_score = proposal_data.get("quality", {}).get("relevance", 3.0) / 5.0
        feasibility_score = proposal_data.get("quality", {}).get("feasibility", 3.0) / 5.0
        
        # Zeitfaktor: Neuere Vorschläge erhalten einen höheren Score
        created_at = proposal_data.get("created_at", datetime.now().isoformat())
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        # Berechnung des Zeitfaktors (1.0 für aktuelle Vorschläge, abnehmend mit dem Alter)
        now = datetime.now()
        days_old = (now - created_at).days
        recency_score = max(0, 1.0 - (days_old / 30))  # Linear abnehmend über 30 Tage
        
        # Berücksichtigung von Stimmen/Unterstützung, falls vorhanden
        vote_factor = 1.0
        if "votes" in proposal_data:
            votes = proposal_data["votes"]
            # Logarithmische Skalierung, um Ausreißer zu dämpfen
            vote_factor = min(2.0, 1.0 + 0.2 * np.log1p(votes))
        
        # Gewichtete Summe der Faktoren
        priority_score = (
            self.weights["quality"] * quality_score +
            self.weights["relevance"] * relevance_score +
            self.weights["feasibility"] * feasibility_score +
            self.weights["recency"] * recency_score
        ) * vote_factor
        
        return min(1.0, priority_score)  # Begrenzung auf maximal 1.0
    
    def sort_proposals(self, proposals: List[Dict[str, Any]], 
                      criteria: str = "priority") -> List[Dict[str, Any]]:
        """
        Sortiert eine Liste von Vorschlägen nach verschiedenen Kriterien.
        
        Args:
            proposals: Liste von Vorschlagsdaten
            criteria: Sortierkriterium ('priority', 'quality', 'relevance', 'recency', 'votes')
            
        Returns:
            Sortierte Liste von Vorschlägen
        """
        if criteria == "priority":
            # Berechnung des Prioritätsscores für jeden Vorschlag
            for proposal in proposals:
                if "priority_score" not in proposal:
                    proposal["priority_score"] = self.calculate_priority_score(proposal)
            
            # Sortierung nach Prioritätsscore
            return sorted(proposals, key=lambda p: p.get("priority_score", 0), reverse=True)
        
        elif criteria == "quality":
            return sorted(
                proposals, 
                key=lambda p: p.get("quality", {}).get("overall_quality", 0), 
                reverse=True
            )
        
        elif criteria == "relevance":
            return sorted(
                proposals, 
                key=lambda p: p.get("quality", {}).get("relevance", 0), 
                reverse=True
            )
        
        elif criteria == "recency":
            return sorted(
                proposals, 
                key=lambda p: p.get("created_at", ""), 
                reverse=True
            )
        
        elif criteria == "votes":
            return sorted(
                proposals, 
                key=lambda p: p.get("votes", 0), 
                reverse=True
            )
        
        else:
            raise ValueError(f"Unbekanntes Sortierkriterium: {criteria}")
    
    def group_by_category(self, proposals: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Gruppiert Vorschläge nach ihrer primären Kategorie.
        
        Args:
            proposals: Liste von Vorschlagsdaten
            
        Returns:
            Dictionary mit Kategorien als Schlüssel und Listen von Vorschlägen als Werte
        """
        grouped = defaultdict(list)
        
        for proposal in proposals:
            category = proposal.get("primary_category", "Unkategorisiert")
            grouped[category].append(proposal)
        
        # Sortierung innerhalb jeder Kategorie nach Priorität
        for category in grouped:
            grouped[category] = self.sort_proposals(grouped[category], "priority")
        
        return dict(grouped)
    
    def group_by_ministry(self, proposals: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Gruppiert Vorschläge nach ihrem primären Ministerium.
        
        Args:
            proposals: Liste von Vorschlagsdaten
            
        Returns:
            Dictionary mit Ministerien als Schlüssel und Listen von Vorschlägen als Werte
        """
        grouped = defaultdict(list)
        
        for proposal in proposals:
            ministry = proposal.get("primary_ministry", "Nicht zugeordnet")
            grouped[ministry].append(proposal)
        
        # Sortierung innerhalb jedes Ministeriums nach Priorität
        for ministry in grouped:
            grouped[ministry] = self.sort_proposals(grouped[ministry], "priority")
        
        return dict(grouped)
    
    def get_top_proposals(self, proposals: List[Dict[str, Any]], n: int = 10) -> List[Dict[str, Any]]:
        """
        Gibt die Top-N-Vorschläge nach Priorität zurück.
        
        Args:
            proposals: Liste von Vorschlagsdaten
            n: Anzahl der zurückzugebenden Vorschläge
            
        Returns:
            Liste der Top-N-Vorschläge
        """
        sorted_proposals = self.sort_proposals(proposals, "priority")
        return sorted_proposals[:n]
    
    def get_trending_proposals(self, proposals: List[Dict[str, Any]], 
                              days: int = 7, n: int = 10) -> List[Dict[str, Any]]:
        """
        Gibt die trendenden Vorschläge der letzten Tage zurück.
        
        Args:
            proposals: Liste von Vorschlagsdaten
            days: Anzahl der zu berücksichtigenden Tage
            n: Anzahl der zurückzugebenden Vorschläge
            
        Returns:
            Liste der trendenden Vorschläge
        """
        now = datetime.now()
        
        # Filterung nach Datum
        recent_proposals = []
        for proposal in proposals:
            created_at = proposal.get("created_at", "")
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except ValueError:
                    continue
            
            if (now - created_at).days <= days:
                recent_proposals.append(proposal)
        
        # Anpassung der Gewichtungen für Trends
        original_weights = self.weights.copy()
        self.weights = {
            "quality": 0.2,
            "relevance": 0.2,
            "feasibility": 0.1,
            "recency": 0.5  # Höhere Gewichtung für Aktualität
        }
        
        # Sortierung nach angepasster Priorität
        trending = self.sort_proposals(recent_proposals, "priority")
        
        # Wiederherstellung der ursprünglichen Gewichtungen
        self.weights = original_weights
        
        return trending[:n]


class ProposalClusterer:
    """Klasse für das Clustering ähnlicher Vorschläge und die Erkennung von Trends."""
    
    def __init__(self, processor: Optional[ProposalProcessor] = None):
        """
        Initialisiert den ProposalClusterer.
        
        Args:
            processor: Optional vorhandene ProposalProcessor-Instanz
        """
        self.processor = processor or ProposalProcessor()
        self.similarity_analyzer = self.processor.similarity_analyzer
        
        # Schwellenwerte für das Clustering
        self.similarity_threshold = 0.75  # Schwellenwert für Ähnlichkeit
        self.min_cluster_size = 2  # Minimale Größe eines Clusters
    
    def compute_similarity_matrix(self, texts: List[str]) -> np.ndarray:
        """
        Berechnet eine Ähnlichkeitsmatrix für eine Liste von Texten.
        
        Args:
            texts: Liste von Texten
            
        Returns:
            Ähnlichkeitsmatrix als NumPy-Array
        """
        n = len(texts)
        similarity_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i, n):
                if i == j:
                    similarity_matrix[i, j] = 1.0
                else:
                    similarity = self.similarity_analyzer.compute_similarity(texts[i], texts[j])
                    similarity_matrix[i, j] = similarity
                    similarity_matrix[j, i] = similarity
        
        return similarity_matrix
    
    def cluster_proposals(self, proposals: List[Dict[str, Any]]) -> List[List[int]]:
        """
        Clustert ähnliche Vorschläge.
        
        Args:
            proposals: Liste von Vorschlagsdaten (muss 'text' oder 'content' enthalten)
            
        Returns:
            Liste von Clustern, wobei jeder Cluster eine Liste von Indizes in der ursprünglichen Liste ist
        """
        # Extraktion der Texte
        texts = []
        for proposal in proposals:
            if "text" in proposal:
                texts.append(proposal["text"])
            elif "content" in proposal:
                texts.append(proposal["content"])
            else:
                texts.append("")
        
        # Berechnung der Ähnlichkeitsmatrix
        similarity_matrix = self.compute_similarity_matrix(texts)
        
        # Hierarchisches Clustering (einfache Implementierung)
        n = len(texts)
        clusters = [{i} for i in range(n)]  # Jeder Vorschlag beginnt in seinem eigenen Cluster
        
        # Zusammenführen von Clustern basierend auf Ähnlichkeit
        while len(clusters) > 1:
            max_similarity = 0
            merge_i, merge_j = 0, 0
            
            # Finden der ähnlichsten Cluster
            for i in range(len(clusters)):
                for j in range(i + 1, len(clusters)):
                    # Berechnung der durchschnittlichen Ähnlichkeit zwischen Clustern
                    cluster_similarity = 0
                    count = 0
                    
                    for idx1 in clusters[i]:
                        for idx2 in clusters[j]:
                            cluster_similarity += similarity_matrix[idx1, idx2]
                            count += 1
                    
                    if count > 0:
                        avg_similarity = cluster_similarity / count
                        
                        if avg_similarity > max_similarity:
                            max_similarity = avg_similarity
                            merge_i, merge_j = i, j
            
            # Wenn keine Cluster mehr über dem Schwellenwert liegen, beenden
            if max_similarity < self.similarity_threshold:
                break
            
            # Zusammenführen der ähnlichsten Cluster
            clusters[merge_i].update(clusters[merge_j])
            clusters.pop(merge_j)
        
        # Konvertierung der Sets zu Listen und Filterung nach Mindestgröße
        result_clusters = [list(cluster) for cluster in clusters if len(cluster) >= self.min_cluster_size]
        
        return result_clusters
    
    def identify_trends(self, proposals: List[Dict[str, Any]], 
                       min_trend_size: int = 3) -> List[Dict[str, Any]]:
        """
        Identifiziert Trends in den Vorschlägen.
        
        Args:
            proposals: Liste von Vorschlagsdaten
            min_trend_size: Minimale Anzahl von Vorschlägen für einen Trend
            
        Returns:
            Liste von Trend-Informationen
        """
        # Clustering der Vorschläge
        clusters = self.cluster_proposals(proposals)
        
        # Filterung nach Mindestgröße für Trends
        trend_clusters = [cluster for cluster in clusters if len(cluster) >= min_trend_size]
        
        # Extraktion von Trendinformationen
        trends = []
        
        for cluster_indices in trend_clusters:
            cluster_proposals = [proposals[i] for i in cluster_indices]
            
            # Extraktion der häufigsten Kategorie im Cluster
            categories = []
            for proposal in cluster_proposals:
                if "primary_category" in proposal:
                    categories.append(proposal["primary_category"])
                elif "categories" in proposal and proposal["categories"]:
                    if isinstance(proposal["categories"], list):
                        categories.extend(proposal["categories"])
                    elif isinstance(proposal["categories"], dict):
                        categories.extend(proposal["categories"].keys())
            
            most_common_category = Counter(categories).most_common(1)[0][0] if categories else "Unkategorisiert"
            
            # Berechnung der durchschnittlichen Qualität
            avg_quality = np.mean([
                proposal.get("quality", {}).get("overall_quality", 3.0)
                for proposal in cluster_proposals
            ])
            
            # Extraktion eines repräsentativen Titels
            representative_title = cluster_proposals[0].get("title", "Unbenannter Trend")
            
            # Zusammenstellung der Trendinformationen
            trend_info = {
                "category": most_common_category,
                "size": len(cluster_indices),
                "avg_quality": float(avg_quality),
                "representative_title": representative_title,
                "proposal_indices": cluster_indices,
                "created_at": min([
                    proposal.get("created_at", datetime.now().isoformat())
                    for proposal in cluster_proposals
                ], key=lambda x: x if isinstance(x, datetime) else datetime.fromisoformat(x.replace("Z", "+00:00")))
            }
            
            trends.append(trend_info)
        
        # Sortierung der Trends nach Größe und Qualität
        sorted_trends = sorted(
            trends, 
            key=lambda t: (t["size"], t["avg_quality"]), 
            reverse=True
        )
        
        return sorted_trends


class ProposalRecommender:
    """Klasse für die Empfehlung ähnlicher oder relevanter Vorschläge."""
    
    def __init__(self, processor: Optional[ProposalProcessor] = None):
        """
        Initialisiert den ProposalRecommender.
        
        Args:
            processor: Optional vorhandene ProposalProcessor-Instanz
        """
        self.processor = processor or ProposalProcessor()
        self.similarity_analyzer = self.processor.similarity_analyzer
    
    def find_similar_proposals(self, text: str, proposals: List[Dict[str, Any]], 
                              n: int = 5, threshold: float = 0.6) -> List[Dict[str, Any]]:
        """
        Findet ähnliche Vorschläge zu einem gegebenen Text.
        
        Args:
            text: Referenztext
            proposals: Liste von Vorschlagsdaten
            n: Anzahl der zurückzugebenden ähnlichen Vorschläge
            threshold: Minimaler Ähnlichkeitsschwellenwert
            
        Returns:
            Liste ähnlicher Vorschläge mit Ähnlichkeitswerten
        """
        similarities = []
        
        for i, proposal in enumerate(proposals):
            proposal_text = proposal.get("text", proposal.get("content", ""))
            similarity = self.similarity_analyzer.compute_similarity(text, proposal_text)
            
            if similarity >= threshold:
                similarities.append((i, similarity))
        
        # Sortierung nach Ähnlichkeit
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Rückgabe der Top-N ähnlichen Vorschläge
        similar_proposals = []
        for i, similarity in similarities[:n]:
            proposal_copy = proposals[i].copy()
            proposal_copy["similarity"] = similarity
            similar_proposals.append(proposal_copy)
        
        return similar_proposals
    
    def recommend_for_user(self, user_interests: List[str], user_history: List[Dict[str, Any]],
                          all_proposals: List[Dict[str, Any]], n: int = 10) -> List[Dict[str, Any]]:
        """
        Empfiehlt Vorschläge für einen Benutzer basierend auf Interessen und Verlauf.
        
        Args:
            user_interests: Liste von Interessenskategorien des Benutzers
            user_history: Liste von Vorschlägen, mit denen der Benutzer interagiert hat
            all_proposals: Liste aller verfügbaren Vorschläge
            n: Anzahl der zu empfehlenden Vorschläge
            
        Returns:
            Liste empfohlener Vorschläge mit Relevanzwerten
        """
        # Berechnung von Relevanzscores für jeden Vorschlag
        proposal_scores = []
        
        for proposal in all_proposals:
            # Prüfung, ob der Vorschlag bereits im Verlauf des Benutzers ist
            if any(h.get("id", "") == proposal.get("id", "") for h in user_history):
                continue
            
            score = 0.0
            
            # Faktor 1: Übereinstimmung mit Interessen
            proposal_categories = []
            if "primary_category" in proposal:
                proposal_categories.append(proposal["primary_category"])
            if "secondary_categories" in proposal:
                proposal_categories.extend(proposal["secondary_categories"])
            elif "categories" in proposal:
                if isinstance(proposal["categories"], list):
                    proposal_categories.extend(proposal["categories"])
                elif isinstance(proposal["categories"], dict):
                    proposal_categories.extend(proposal["categories"].keys())
            
            interest_match = sum(1 for cat in proposal_categories if cat in user_interests)
            score += 0.5 * (interest_match / max(1, len(user_interests)))
            
            # Faktor 2: Ähnlichkeit zu früheren Interaktionen
            if user_history:
                history_similarities = []
                proposal_text = proposal.get("text", proposal.get("content", ""))
                
                for history_item in user_history:
                    history_text = history_item.get("text", history_item.get("content", ""))
                    similarity = self.similarity_analyzer.compute_similarity(proposal_text, history_text)
                    history_similarities.append(similarity)
                
                # Verwendung des Durchschnitts der Top-3-Ähnlichkeiten
                top_similarities = sorted(history_similarities, reverse=True)[:3]
                if top_similarities:
                    score += 0.3 * (sum(top_similarities) / len(top_similarities))
            
            # Faktor 3: Qualität und Aktualität
            quality = proposal.get("quality", {}).get("overall_quality", 3.0) / 5.0
            score += 0.2 * quality
            
            proposal_scores.append((proposal, score))
        
        # Sortierung nach Score
        proposal_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Rückgabe der Top-N Empfehlungen
        recommendations = []
        for proposal, score in proposal_scores[:n]:
            proposal_copy = proposal.copy()
            proposal_copy["relevance_score"] = score
            recommendations.append(proposal_copy)
        
        return recommendations
    
    def diversify_recommendations(self, recommendations: List[Dict[str, Any]], 
                                 diversity_factor: float = 0.3) -> List[Dict[str, Any]]:
        """
        Diversifiziert eine Liste von Empfehlungen, um Vielfalt zu gewährleisten.
        
        Args:
            recommendations: Liste von empfohlenen Vorschlägen
            diversity_factor: Faktor für die Diversifizierung (0-1)
            
        Returns:
            Diversifizierte Liste von Empfehlungen
        """
        if not recommendations or len(recommendations) <= 1:
            return recommendations
        
        n = len(recommendations)
        diversified = [recommendations[0]]  # Start mit dem relevantesten Vorschlag
        
        # Berechnung der Ähnlichkeitsmatrix zwischen allen Vorschlägen
        similarity_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i, n):
                if i == j:
                    similarity_matrix[i, j] = 1.0
                else:
                    text_i = recommendations[i].get("text", recommendations[i].get("content", ""))
                    text_j = recommendations[j].get("text", recommendations[j].get("content", ""))
                    similarity = self.similarity_analyzer.compute_similarity(text_i, text_j)
                    similarity_matrix[i, j] = similarity
                    similarity_matrix[j, i] = similarity
        
        # Auswahl der verbleibenden Vorschläge unter Berücksichtigung der Diversität
        remaining_indices = list(range(1, n))
        
        while len(diversified) < n and remaining_indices:
            best_index = -1
            best_score = -float("inf")
            
            for idx in remaining_indices:
                # Relevanz des Vorschlags
                relevance = recommendations[idx].get("relevance_score", 0.5)
                
                # Durchschnittliche Ähnlichkeit zu bereits ausgewählten Vorschlägen
                selected_indices = [recommendations.index(d) for d in diversified]
                avg_similarity = np.mean([similarity_matrix[idx, s] for s in selected_indices])
                
                # Kombinierter Score: Relevanz - Diversitätsfaktor * Ähnlichkeit
                score = relevance - diversity_factor * avg_similarity
                
                if score > best_score:
                    best_score = score
                    best_index = idx
            
            if best_index >= 0:
                diversified.append(recommendations[best_index])
                remaining_indices.remove(best_index)
            else:
                break
        
        return diversified


# Beispiel für die Verwendung
if __name__ == "__main__":
    # Initialisierung des Processors
    processor = ProposalProcessor(load_models=False)
    
    # Initialisierung der Algorithmen
    categorizer = ProposalCategorizer(processor)
    sorter = ProposalSorter(processor)
    clusterer = ProposalClusterer(processor)
    recommender = ProposalRecommender(processor)
    
    # Beispielvorschläge
    example_proposals = [
        {
            "id": "1",
            "title": "Mehr Fahrradwege in der Innenstadt",
            "content": "Ich schlage vor, mehr Fahrradwege in der Innenstadt zu bauen, um den Verkehr zu entlasten und die Umwelt zu schonen.",
            "created_at": "2025-03-01T10:00:00",
            "primary_category": "Verkehr",
            "secondary_categories": ["Umwelt"],
            "quality": {"overall_quality": 4.2, "relevance": 4.5, "feasibility": 3.8},
            "votes": 120
        },
        {
            "id": "2",
            "title": "Digitale Ausstattung für Schulen",
            "content": "Die Schulen sollten besser mit digitalen Geräten ausgestattet werden, damit die Schüler auf die digitale Zukunft vorbereitet sind.",
            "created_at": "2025-03-05T14:30:00",
            "primary_category": "Bildung",
            "secondary_categories": ["Digitalisierung"],
            "quality": {"overall_quality": 4.5, "relevance": 4.8, "feasibility": 3.5},
            "votes": 85
        },
        {
            "id": "3",
            "title": "Mehr Grünflächen in der Stadt",
            "content": "Es sollten mehr Grünflächen in der Stadt angelegt werden, um die Luftqualität zu verbessern und den Bürgern Erholungsmöglichkeiten zu bieten.",
            "created_at": "2025-03-10T09:15:00",
            "primary_category": "Umwelt",
            "secondary_categories": ["Gesundheit"],
            "quality": {"overall_quality": 4.0, "relevance": 4.2, "feasibility": 3.2},
            "votes": 95
        },
        {
            "id": "4",
            "title": "Ausbau des ÖPNV",
            "content": "Der öffentliche Nahverkehr sollte ausgebaut werden, um mehr Menschen eine Alternative zum Auto zu bieten und die Umweltbelastung zu reduzieren.",
            "created_at": "2025-03-12T16:45:00",
            "primary_category": "Verkehr",
            "secondary_categories": ["Umwelt"],
            "quality": {"overall_quality": 4.3, "relevance": 4.4, "feasibility": 3.6},
            "votes": 110
        },
        {
            "id": "5",
            "title": "Förderung erneuerbarer Energien",
            "content": "Die Stadt sollte stärker in erneuerbare Energien investieren und Bürger bei der Installation von Solaranlagen unterstützen.",
            "created_at": "2025-03-15T11:20:00",
            "primary_category": "Umwelt",
            "secondary_categories": ["Wirtschaft"],
            "quality": {"overall_quality": 4.1, "relevance": 4.3, "feasibility": 3.4},
            "votes": 75
        }
    ]
    
    # Beispiel für Kategorisierung
    new_proposal = "Wir sollten mehr öffentliche Verkehrsmittel einsetzen, um den CO2-Ausstoß zu reduzieren."
    categorization = categorizer.categorize_proposal(new_proposal)
    print("\nKategorisierungsergebnis:")
    print(f"Primäre Kategorie: {categorization['primary_category']}")
    print(f"Sekundäre Kategorien: {categorization['secondary_categories']}")
    print(f"Primäres Ministerium: {categorization['primary_ministry']}")
    
    # Beispiel für Sortierung
    sorted_proposals = sorter.sort_proposals(example_proposals, "priority")
    print("\nTop-3 Vorschläge nach Priorität:")
    for i, proposal in enumerate(sorted_proposals[:3]):
        print(f"{i+1}. {proposal['title']} (Qualität: {proposal['quality']['overall_quality']})")
    
    # Beispiel für Gruppierung
    grouped_by_category = sorter.group_by_category(example_proposals)
    print("\nAnzahl der Vorschläge pro Kategorie:")
    for category, proposals in grouped_by_category.items():
        print(f"{category}: {len(proposals)}")
    
    # Beispiel für Clustering
    clusters = clusterer.cluster_proposals(example_proposals)
    print("\nGefundene Cluster:")
    for i, cluster in enumerate(clusters):
        print(f"Cluster {i+1}: {[example_proposals[idx]['title'] for idx in cluster]}")
    
    # Beispiel für Empfehlungen
    user_interests = ["Umwelt", "Verkehr"]
    user_history = [example_proposals[0]]  # Angenommen, der Benutzer hat den ersten Vorschlag angesehen
    recommendations = recommender.recommend_for_user(user_interests, user_history, example_proposals, n=3)
    print("\nEmpfehlungen für Benutzer mit Interessen in Umwelt und Verkehr:")
    for i, rec in enumerate(recommendations):
        print(f"{i+1}. {rec['title']} (Relevanz: {rec.get('relevance_score', 0):.2f})")
