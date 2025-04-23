import unittest
import sys
import os
import json
import numpy as np
from unittest.mock import patch, MagicMock

# Pfad zum Hauptverzeichnis hinzufügen
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import der zu testenden Module
from proposal_processor import ProposalProcessor, analyze_proposal
from categorization_algorithms import (
    categorize_proposal, 
    calculate_similarity, 
    assign_ministry, 
    evaluate_quality
)

class TestProposalProcessor(unittest.TestCase):
    """Tests für die ProposalProcessor-Klasse"""
    
    def setUp(self):
        """Test-Setup: Erstellt eine Instanz des ProposalProcessors"""
        self.processor = ProposalProcessor()
        
        # Beispielvorschlag für Tests
        self.sample_proposal = {
            "title": "Ausbau von Fahrradwegen in der Innenstadt",
            "content": """
            Ich schlage vor, das Fahrradwegenetz in der Innenstadt auszubauen, 
            um den Verkehr umweltfreundlicher zu gestalten und die Luftqualität zu verbessern. 
            Konkret sollten auf allen Hauptstraßen separate Fahrradspuren eingerichtet werden, 
            die durch physische Barrieren vom Autoverkehr getrennt sind. 
            Dies würde die Sicherheit für Radfahrer erhöhen und mehr Menschen zum Umstieg 
            auf das Fahrrad bewegen. Zusätzlich sollten mehr Fahrradstellplätze an wichtigen 
            Knotenpunkten wie Bahnhöfen und Einkaufszentren geschaffen werden.
            """
        }
    
    def test_preprocess_text(self):
        """Testet die Textvorverarbeitung"""
        processed_text = self.processor.preprocess_text(self.sample_proposal["content"])
        
        # Überprüfen, ob die Vorverarbeitung grundlegende Transformationen durchführt
        self.assertIsInstance(processed_text, str)
        self.assertTrue(len(processed_text) > 0)
        self.assertNotEqual(processed_text, self.sample_proposal["content"])
        
        # Überprüfen, ob Leerzeichen normalisiert wurden
        self.assertFalse("  " in processed_text)  # Keine doppelten Leerzeichen
        
        # Überprüfen, ob Text in Kleinbuchstaben umgewandelt wurde
        self.assertEqual(processed_text, processed_text.lower())
    
    def test_extract_keywords(self):
        """Testet die Extraktion von Schlüsselwörtern"""
        keywords = self.processor.extract_keywords(self.sample_proposal["content"])
        
        # Überprüfen, ob Schlüsselwörter extrahiert wurden
        self.assertIsInstance(keywords, list)
        self.assertTrue(len(keywords) > 0)
        
        # Überprüfen, ob relevante Schlüsselwörter enthalten sind
        expected_keywords = ["fahrrad", "verkehr", "innenstadt", "umweltfreundlich"]
        for keyword in expected_keywords:
            self.assertTrue(any(keyword in kw.lower() for kw in keywords), 
                           f"Erwartetes Schlüsselwort '{keyword}' nicht gefunden")
    
    @patch('proposal_processor.ProposalProcessor.get_category_embeddings')
    def test_categorize_proposal(self, mock_get_embeddings):
        """Testet die Kategorisierung von Vorschlägen"""
        # Mock für Kategorie-Embeddings
        mock_categories = {
            "Umwelt": np.array([0.8, 0.1, 0.1]),
            "Verkehr": np.array([0.2, 0.7, 0.1]),
            "Stadtplanung": np.array([0.3, 0.3, 0.4]),
            "Bildung": np.array([0.1, 0.1, 0.8])
        }
        mock_get_embeddings.return_value = mock_categories
        
        # Mock für Text-Embedding
        with patch.object(self.processor, 'get_text_embedding', return_value=np.array([0.5, 0.4, 0.1])):
            categories = self.processor.categorize_proposal(self.sample_proposal["content"])
        
        # Überprüfen der Kategorisierungsergebnisse
        self.assertIsInstance(categories, dict)
        self.assertIn("primary", categories)
        self.assertIn("secondary", categories)
        self.assertIn("scores", categories)
        
        # Überprüfen, ob die primäre Kategorie eine der erwarteten ist
        expected_primary = ["Umwelt", "Verkehr", "Stadtplanung"]
        self.assertIn(categories["primary"], expected_primary)
        
        # Überprüfen, ob die Scores für alle Kategorien vorhanden sind
        for category in mock_categories.keys():
            self.assertIn(category, categories["scores"])
    
    @patch('proposal_processor.ProposalProcessor.get_ministry_embeddings')
    def test_assign_ministry(self, mock_get_embeddings):
        """Testet die Zuordnung zu Ministerien"""
        # Mock für Ministerien-Embeddings
        mock_ministries = {
            "Umweltministerium": np.array([0.8, 0.1, 0.1]),
            "Verkehrsministerium": np.array([0.2, 0.7, 0.1]),
            "Bildungsministerium": np.array([0.1, 0.1, 0.8])
        }
        mock_get_embeddings.return_value = mock_ministries
        
        # Mock für Text-Embedding
        with patch.object(self.processor, 'get_text_embedding', return_value=np.array([0.3, 0.6, 0.1])):
            ministry_assignment = self.processor.assign_ministry(self.sample_proposal["content"])
        
        # Überprüfen der Ministeriumszuordnung
        self.assertIsInstance(ministry_assignment, dict)
        self.assertIn("primary", ministry_assignment)
        self.assertIn("scores", ministry_assignment)
        
        # Überprüfen, ob das primäre Ministerium eines der erwarteten ist
        expected_ministry = ["Umweltministerium", "Verkehrsministerium"]
        self.assertIn(ministry_assignment["primary"], expected_ministry)
        
        # Überprüfen, ob die Scores für alle Ministerien vorhanden sind
        for ministry in mock_ministries.keys():
            self.assertIn(ministry, ministry_assignment["scores"])
    
    def test_evaluate_quality(self):
        """Testet die Qualitätsbewertung von Vorschlägen"""
        quality = self.processor.evaluate_quality(self.sample_proposal["content"])
        
        # Überprüfen der Qualitätsbewertung
        self.assertIsInstance(quality, dict)
        self.assertIn("overall_quality", quality)
        self.assertIn("relevance", quality)
        self.assertIn("feasibility", quality)
        
        # Überprüfen, ob die Bewertungen im gültigen Bereich liegen
        for score_name, score_value in quality.items():
            self.assertIsInstance(score_value, float)
            self.assertGreaterEqual(score_value, 0.0)
            self.assertLessEqual(score_value, 1.0)
    
    def test_generate_summary(self):
        """Testet die Zusammenfassung von Vorschlägen"""
        summary = self.processor.generate_summary(self.sample_proposal["content"])
        
        # Überprüfen der Zusammenfassung
        self.assertIsInstance(summary, str)
        self.assertTrue(len(summary) > 0)
        self.assertLess(len(summary), len(self.sample_proposal["content"]))
        
        # Überprüfen, ob wichtige Begriffe in der Zusammenfassung enthalten sind
        important_terms = ["fahrrad", "verkehr", "innenstadt"]
        for term in important_terms:
            self.assertTrue(term.lower() in summary.lower(), 
                           f"Wichtiger Begriff '{term}' nicht in der Zusammenfassung enthalten")
    
    @patch('proposal_processor.ProposalProcessor.categorize_proposal')
    @patch('proposal_processor.ProposalProcessor.assign_ministry')
    @patch('proposal_processor.ProposalProcessor.evaluate_quality')
    @patch('proposal_processor.ProposalProcessor.extract_keywords')
    @patch('proposal_processor.ProposalProcessor.generate_summary')
    def test_analyze_proposal(self, mock_summary, mock_keywords, mock_quality, 
                             mock_ministry, mock_categorize):
        """Testet die vollständige Analyse eines Vorschlags"""
        # Mocks für die einzelnen Analyseschritte
        mock_categorize.return_value = {
            "primary": "Verkehr",
            "secondary": ["Umwelt", "Stadtplanung"],
            "scores": {"Verkehr": 0.8, "Umwelt": 0.6, "Stadtplanung": 0.5}
        }
        mock_ministry.return_value = {
            "primary": "Verkehrsministerium",
            "scores": {"Verkehrsministerium": 0.8, "Umweltministerium": 0.6}
        }
        mock_quality.return_value = {
            "overall_quality": 0.75,
            "relevance": 0.8,
            "feasibility": 0.7
        }
        mock_keywords.return_value = ["Fahrrad", "Verkehr", "Innenstadt", "Umwelt"]
        mock_summary.return_value = "Ausbau des Fahrradwegenetzes in der Innenstadt für umweltfreundlicheren Verkehr."
        
        # Analyse durchführen
        analysis = self.processor.analyze_proposal(self.sample_proposal)
        
        # Überprüfen der Analyseergebnisse
        self.assertIsInstance(analysis, dict)
        self.assertIn("categories", analysis)
        self.assertIn("ministries", analysis)
        self.assertIn("quality", analysis)
        self.assertIn("keywords", analysis)
        self.assertIn("summary", analysis)
        
        # Überprüfen, ob die Mocks korrekt aufgerufen wurden
        mock_categorize.assert_called_once()
        mock_ministry.assert_called_once()
        mock_quality.assert_called_once()
        mock_keywords.assert_called_once()
        mock_summary.assert_called_once()
        
        # Überprüfen der Analyseergebnisse im Detail
        self.assertEqual(analysis["categories"], mock_categorize.return_value)
        self.assertEqual(analysis["ministries"], mock_ministry.return_value)
        self.assertEqual(analysis["quality"], mock_quality.return_value)
        self.assertEqual(analysis["keywords"], mock_keywords.return_value)
        self.assertEqual(analysis["summary"], mock_summary.return_value)


class TestCategorizationAlgorithms(unittest.TestCase):
    """Tests für die Kategorisierungsalgorithmen"""
    
    def setUp(self):
        """Test-Setup"""
        # Beispielvorschlag für Tests
        self.sample_proposal = {
            "title": "Ausbau von Fahrradwegen in der Innenstadt",
            "content": """
            Ich schlage vor, das Fahrradwegenetz in der Innenstadt auszubauen, 
            um den Verkehr umweltfreundlicher zu gestalten und die Luftqualität zu verbessern. 
            Konkret sollten auf allen Hauptstraßen separate Fahrradspuren eingerichtet werden, 
            die durch physische Barrieren vom Autoverkehr getrennt sind. 
            Dies würde die Sicherheit für Radfahrer erhöhen und mehr Menschen zum Umstieg 
            auf das Fahrrad bewegen. Zusätzlich sollten mehr Fahrradstellplätze an wichtigen 
            Knotenpunkten wie Bahnhöfen und Einkaufszentren geschaffen werden.
            """
        }
        
        # Beispielkategorien und -ministerien
        self.categories = ["Umwelt", "Verkehr", "Stadtplanung", "Bildung", "Gesundheit"]
        self.ministries = ["Umweltministerium", "Verkehrsministerium", "Bildungsministerium", 
                          "Gesundheitsministerium", "Innenministerium"]
    
    @patch('categorization_algorithms.get_embedding')
    def test_categorize_proposal(self, mock_get_embedding):
        """Testet die Kategorisierungsfunktion"""
        # Mock für Embeddings
        def mock_embedding_side_effect(text, categories=None):
            if categories:
                return {
                    "Umwelt": np.array([0.8, 0.1, 0.1]),
                    "Verkehr": np.array([0.2, 0.7, 0.1]),
                    "Stadtplanung": np.array([0.3, 0.3, 0.4]),
                    "Bildung": np.array([0.1, 0.1, 0.8]),
                    "Gesundheit": np.array([0.4, 0.1, 0.5])
                }
            else:
                return np.array([0.4, 0.5, 0.1])
        
        mock_get_embedding.side_effect = mock_embedding_side_effect
        
        # Kategorisierung durchführen
        result = categorize_proposal(self.sample_proposal["content"], self.categories)
        
        # Überprüfen der Ergebnisse
        self.assertIsInstance(result, dict)
        self.assertIn("primary", result)
        self.assertIn("secondary", result)
        self.assertIn("scores", result)
        
        # Überprüfen, ob die primäre Kategorie eine der erwarteten ist
        self.assertIn(result["primary"], self.categories)
        
        # Überprüfen, ob die sekundären Kategorien eine Teilmenge der Kategorien sind
        for category in result["secondary"]:
            self.assertIn(category, self.categories)
        
        # Überprüfen, ob die Scores für alle Kategorien vorhanden sind
        for category in self.categories:
            self.assertIn(category, result["scores"])
    
    def test_calculate_similarity(self):
        """Testet die Ähnlichkeitsberechnung"""
        # Beispiel-Embeddings
        embedding1 = np.array([0.5, 0.3, 0.2])
        embedding2 = np.array([0.6, 0.3, 0.1])
        embedding3 = np.array([0.1, 0.2, 0.7])
        
        # Ähnlichkeiten berechnen
        similarity12 = calculate_similarity(embedding1, embedding2)
        similarity13 = calculate_similarity(embedding1, embedding3)
        
        # Überprüfen der Ähnlichkeitswerte
        self.assertIsInstance(similarity12, float)
        self.assertIsInstance(similarity13, float)
        self.assertGreaterEqual(similarity12, 0.0)
        self.assertGreaterEqual(similarity13, 0.0)
        self.assertLessEqual(similarity12, 1.0)
        self.assertLessEqual(similarity13, 1.0)
        
        # Ähnliche Embeddings sollten einen höheren Wert haben
        self.assertGreater(similarity12, similarity13)
    
    @patch('categorization_algorithms.get_embedding')
    def test_assign_ministry(self, mock_get_embedding):
        """Testet die Ministeriumszuordnung"""
        # Mock für Embeddings
        def mock_embedding_side_effect(text, categories=None):
            if categories:
                return {
                    "Umweltministerium": np.array([0.8, 0.1, 0.1]),
                    "Verkehrsministerium": np.array([0.2, 0.7, 0.1]),
                    "Bildungsministerium": np.array([0.1, 0.1, 0.8]),
                    "Gesundheitsministerium": np.array([0.4, 0.1, 0.5]),
                    "Innenministerium": np.array([0.3, 0.3, 0.4])
                }
            else:
                return np.array([0.3, 0.6, 0.1])
        
        mock_get_embedding.side_effect = mock_embedding_side_effect
        
        # Ministeriumszuordnung durchführen
        result = assign_ministry(self.sample_proposal["content"], self.ministries)
        
        # Überprüfen der Ergebnisse
        self.assertIsInstance(result, dict)
        self.assertIn("primary", result)
        self.assertIn("scores", result)
        
        # Überprüfen, ob das primäre Ministerium eines der erwarteten ist
        self.assertIn(result["primary"], self.ministries)
        
        # Überprüfen, ob die Scores für alle Ministerien vorhanden sind
        for ministry in self.ministries:
            self.assertIn(ministry, result["scores"])
    
    def test_evaluate_quality(self):
        """Testet die Qualitätsbewertung"""
        # Qualitätsbewertung durchführen
        result = evaluate_quality(self.sample_proposal["content"])
        
        # Überprüfen der Ergebnisse
        self.assertIsInstance(result, dict)
        self.assertIn("overall_quality", result)
        self.assertIn("relevance", result)
        self.assertIn("feasibility", result)
        
        # Überprüfen, ob die Bewertungen im gültigen Bereich liegen
        for score_name, score_value in result.items():
            self.assertIsInstance(score_value, float)
            self.assertGreaterEqual(score_value, 0.0)
            self.assertLessEqual(score_value, 1.0)


class TestIntegration(unittest.TestCase):
    """Integrationstests für das KI-Modell"""
    
    def setUp(self):
        """Test-Setup"""
        # Beispielvorschläge für Tests
        self.proposals = [
            {
                "title": "Ausbau von Fahrradwegen in der Innenstadt",
                "content": """
                Ich schlage vor, das Fahrradwegenetz in der Innenstadt auszubauen, 
                um den Verkehr umweltfreundlicher zu gestalten und die Luftqualität zu verbessern. 
                Konkret sollten auf allen Hauptstraßen separate Fahrradspuren eingerichtet werden, 
                die durch physische Barrieren vom Autoverkehr getrennt sind. 
                Dies würde die Sicherheit für Radfahrer erhöhen und mehr Menschen zum Umstieg 
                auf das Fahrrad bewegen. Zusätzlich sollten mehr Fahrradstellplätze an wichtigen 
                Knotenpunkten wie Bahnhöfen und Einkaufszentren geschaffen werden.
                """
            },
            {
                "title": "Verbesserung der Schulbildung durch digitale Medien",
                "content": """
                Um die Bildungsqualität an Schulen zu verbessern, schlage ich vor, 
                digitale Medien stärker in den Unterricht zu integrieren. 
                Jede Schule sollte mit modernen Computern, Tablets und interaktiven Whiteboards 
                ausgestattet werden. Lehrer sollten regelmäßige Fortbildungen erhalten, 
                um diese Technologien effektiv einsetzen zu können. 
                Zudem sollte ein digitales Lernmanagementsystem eingeführt werden, 
                das Schülern auch außerhalb des Unterrichts Zugang zu Lernmaterialien bietet.
                """
            },
            {
                "title": "Förderung erneuerbarer Energien in Privathaushalten",
                "content": """
                Ich schlage vor, die Installation von Solaranlagen und anderen erneuerbaren 
                Energiequellen in Privathaushalten stärker zu fördern. 
                Dies könnte durch direkte finanzielle Zuschüsse, Steuererleichterungen 
                und vereinfachte Genehmigungsverfahren geschehen. 
                Zusätzlich sollte ein Beratungsprogramm eingerichtet werden, 
                das Hausbesitzer über die Möglichkeiten und Vorteile erneuerbarer Energien informiert. 
                Dies würde nicht nur zum Klimaschutz beitragen, sondern auch die Energiekosten 
                für Privathaushalte langfristig senken.
                """
            }
        ]
    
    @patch('proposal_processor.analyze_proposal')
    def test_end_to_end_analysis(self, mock_analyze):
        """Testet die End-to-End-Analyse mehrerer Vorschläge"""
        # Mock für die Analyse-Funktion
        mock_analyze.side_effect = [
            {
                "categories": {
                    "primary": "Verkehr",
                    "secondary": ["Umwelt", "Stadtplanung"],
                    "scores": {"Verkehr": 0.8, "Umwelt": 0.6, "Stadtplanung": 0.5}
                },
                "ministries": {
                    "primary": "Verkehrsministerium",
                    "scores": {"Verkehrsministerium": 0.8, "Umweltministerium": 0.6}
                },
                "quality": {
                    "overall_quality": 0.75,
                    "relevance": 0.8,
                    "feasibility": 0.7
                },
                "keywords": ["Fahrrad", "Verkehr", "Innenstadt", "Umwelt"],
                "summary": "Ausbau des Fahrradwegenetzes in der Innenstadt für umweltfreundlicheren Verkehr."
            },
            {
                "categories": {
                    "primary": "Bildung",
                    "secondary": ["Digitalisierung"],
                    "scores": {"Bildung": 0.9, "Digitalisierung": 0.7}
                },
                "ministries": {
                    "primary": "Bildungsministerium",
                    "scores": {"Bildungsministerium": 0.9, "Digitalministerium": 0.6}
                },
                "quality": {
                    "overall_quality": 0.8,
                    "relevance": 0.85,
                    "feasibility": 0.75
                },
                "keywords": ["Bildung", "Digital", "Schule", "Unterricht"],
                "summary": "Integration digitaler Medien in Schulen zur Verbesserung der Bildungsqualität."
            },
            {
                "categories": {
                    "primary": "Umwelt",
                    "secondary": ["Energie", "Wirtschaft"],
                    "scores": {"Umwelt": 0.85, "Energie": 0.8, "Wirtschaft": 0.5}
                },
                "ministries": {
                    "primary": "Umweltministerium",
                    "scores": {"Umweltministerium": 0.85, "Wirtschaftsministerium": 0.6}
                },
                "quality": {
                    "overall_quality": 0.8,
                    "relevance": 0.85,
                    "feasibility": 0.75
                },
                "keywords": ["Erneuerbare Energie", "Solar", "Klimaschutz", "Förderung"],
                "summary": "Förderung erneuerbarer Energien in Privathaushalten durch finanzielle Anreize und Beratung."
            }
        ]
        
        # Analyse für jeden Vorschlag durchführen
        results = []
        for proposal in self.proposals:
            result = analyze_proposal(proposal)
            results.append(result)
        
        # Überprüfen, ob die Analyse-Funktion für jeden Vorschlag aufgerufen wurde
        self.assertEqual(mock_analyze.call_count, len(self.proposals))
        
        # Überprüfen der Analyseergebnisse
        self.assertEqual(len(results), len(self.proposals))
        
        # Überprüfen, ob die Ergebnisse die erwartete Struktur haben
        for result in results:
            self.assertIsInstance(result, dict)
            self.assertIn("categories", result)
            self.assertIn("ministries", result)
            self.assertIn("quality", result)
            self.assertIn("keywords", result)
            self.assertIn("summary", result)
        
        # Überprüfen, ob die Kategorisierung konsistent ist
        self.assertEqual(results[0]["categories"]["primary"], "Verkehr")
        self.assertEqual(results[1]["categories"]["primary"], "Bildung")
        self.assertEqual(results[2]["categories"]["primary"], "Umwelt")
        
        # Überprüfen, ob die Ministeriumszuordnung konsistent ist
        self.assertEqual(results[0]["ministries"]["primary"], "Verkehrsministerium")
        self.assertEqual(results[1]["ministries"]["primary"], "Bildungsministerium")
        self.assertEqual(results[2]["ministries"]["primary"], "Umweltministerium")
    
    def test_similar_proposals_detection(self):
        """Testet die Erkennung ähnlicher Vorschläge"""
        # Ähnliche Vorschläge
        similar_proposals = [
            {
                "title": "Ausbau von Fahrradwegen in der Innenstadt",
                "content": """
                Ich schlage vor, das Fahrradwegenetz in der Innenstadt auszubauen, 
                um den Verkehr umweltfreundlicher zu gestalten und die Luftqualität zu verbessern.
                """
            },
            {
                "title": "Mehr Fahrradwege für die Stadt",
                "content": """
                Wir brauchen mehr Fahrradwege in der Stadt, um den Verkehr zu entlasten 
                und die Umwelt zu schonen. Besonders in der Innenstadt sollten separate 
                Fahrradspuren eingerichtet werden.
                """
            }
        ]
        
        # Unähnlicher Vorschlag
        different_proposal = {
            "title": "Verbesserung des öffentlichen Nahverkehrs",
            "content": """
            Der öffentliche Nahverkehr sollte durch häufigere Verbindungen und 
            modernere Fahrzeuge verbessert werden. Dies würde die Attraktivität 
            steigern und mehr Menschen zum Umstieg vom Auto bewegen.
            """
        }
        
        # Mock für die Ähnlichkeitsberechnung
        with patch('categorization_algorithms.calculate_similarity') as mock_similarity:
            # Ähnliche Vorschläge sollten hohe Ähnlichkeit haben
            mock_similarity.return_value = 0.85
            
            # Ähnlichkeit zwischen ähnlichen Vorschlägen berechnen
            processor = ProposalProcessor()
            similarity_score = processor.calculate_proposal_similarity(
                similar_proposals[0], similar_proposals[1]
            )
            
            # Überprüfen, ob die Ähnlichkeit hoch ist
            self.assertGreaterEqual(similarity_score, 0.7)
            
            # Unähnliche Vorschläge sollten niedrige Ähnlichkeit haben
            mock_similarity.return_value = 0.3
            
            # Ähnlichkeit zwischen unähnlichen Vorschlägen berechnen
            similarity_score = processor.calculate_proposal_similarity(
                similar_proposals[0], different_proposal
            )
            
            # Überprüfen, ob die Ähnlichkeit niedrig ist
            self.assertLessEqual(similarity_score, 0.5)


if __name__ == '__main__':
    unittest.main()
