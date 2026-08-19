"""
Semantic Matcher Service
========================
Provides local, offline semantic similarity using sentence-transformers
(all-MiniLM-L6-v2). Designed for skill matching and responsibility-level
similarity without hitting any external API.

The model is loaded lazily on first use and cached in-process.
Download size: ~80 MB (one-time, stored in ~/.cache/huggingface).
"""
from __future__ import annotations

import logging
import threading
import os
from typing import List, Tuple, Optional

os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy singleton model loader — thread-safe
# ---------------------------------------------------------------------------
_model = None
_model_lock = threading.Lock()
_MODEL_NAME = "all-MiniLM-L6-v2"
_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity as _cosine_similarity
    _AVAILABLE = True
except ImportError:
    logger.warning(
        "[SEMANTIC MATCHER] sentence-transformers or scikit-learn not installed. "
        "Semantic matching will be disabled. Run: pip install sentence-transformers scikit-learn"
    )


def _get_model() -> Optional[object]:
    """Return the loaded SentenceTransformer model (thread-safe lazy init)."""
    global _model
    if not _AVAILABLE:
        return None
    if _model is None:
        with _model_lock:
            if _model is None:
                try:
                    logger.info(f"[SEMANTIC MATCHER] Loading model '{_MODEL_NAME}' (first call)...")
                    _model = SentenceTransformer(_MODEL_NAME)
                    logger.info(f"[SEMANTIC MATCHER] Model '{_MODEL_NAME}' loaded successfully.")
                except Exception as exc:
                    logger.error(f"[SEMANTIC MATCHER] Failed to load model: {exc}")
                    return None
    return _model


def is_available() -> bool:
    """Return True if semantic matching dependencies are installed."""
    return _AVAILABLE


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_skill_similarity(skill_a: str, skill_b: str) -> float:
    """
    Compute cosine similarity between two skill strings.

    Returns:
        float in [0.0, 1.0]. Returns 0.0 if the model is unavailable.
    """
    model = _get_model()
    if model is None:
        return 0.0
    try:
        embeddings = model.encode([skill_a, skill_b], convert_to_numpy=True)
        sim = float(_cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
        return round(max(0.0, min(1.0, sim)), 4)
    except Exception as exc:
        logger.warning(f"[SEMANTIC MATCHER] compute_skill_similarity error: {exc}")
        return 0.0


def find_best_semantic_match(
    query: str,
    candidates: List[str],
    threshold: float = 0.75,
) -> Tuple[Optional[str], float]:
    """
    Find the best semantic match for `query` within `candidates`.

    Returns:
        (best_match, similarity_score) — or (None, 0.0) if no match >= threshold
        or if the model is unavailable.
    """
    if not candidates:
        return None, 0.0

    model = _get_model()
    if model is None:
        return None, 0.0

    try:
        all_texts = [query] + candidates
        embeddings = model.encode(all_texts, convert_to_numpy=True)
        query_emb = embeddings[0:1]
        cand_embs = embeddings[1:]

        sims = _cosine_similarity(query_emb, cand_embs)[0]
        best_idx = int(sims.argmax())
        best_score = float(sims[best_idx])

        if best_score >= threshold:
            return candidates[best_idx], round(best_score, 4)
        return None, round(best_score, 4)
    except Exception as exc:
        logger.warning(f"[SEMANTIC MATCHER] find_best_semantic_match error: {exc}")
        return None, 0.0


def compute_text_similarity(text_a: str, text_b: str) -> float:
    """
    Compute semantic similarity between two potentially long text blocks.
    Truncated internally by the model's max sequence length (256 tokens for MiniLM).

    Returns:
        float in [0.0, 1.0]. Returns 0.0 if the model is unavailable or texts are empty.
    """
    if not text_a or not text_b:
        return 0.0

    model = _get_model()
    if model is None:
        return 0.0

    try:
        # Truncate to avoid OOM on very long texts (MiniLM handles up to 256 tokens)
        max_chars = 1000
        text_a_trunc = text_a[:max_chars]
        text_b_trunc = text_b[:max_chars]

        embeddings = model.encode([text_a_trunc, text_b_trunc], convert_to_numpy=True)
        sim = float(_cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
        return round(max(0.0, min(1.0, sim)), 4)
    except Exception as exc:
        logger.warning(f"[SEMANTIC MATCHER] compute_text_similarity error: {exc}")
        return 0.0


def batch_compute_similarity(
    queries: List[str],
    candidates: List[str],
) -> List[Tuple[Optional[str], float]]:
    """
    Batch version of find_best_semantic_match. More efficient than calling
    find_best_semantic_match in a loop because it encodes all texts at once.

    Args:
        queries:    Required skill strings to find matches for.
        candidates: Extracted resume skill strings to search in.

    Returns:
        List of (best_match_or_None, score) for each query, same order as `queries`.
        Uses threshold=0.75.
    """
    if not queries or not candidates:
        return [(None, 0.0)] * len(queries)

    model = _get_model()
    if model is None:
        return [(None, 0.0)] * len(queries)

    THRESHOLD = 0.75

    try:
        all_texts = queries + candidates
        embeddings = model.encode(all_texts, convert_to_numpy=True)
        q_embs = embeddings[:len(queries)]
        c_embs = embeddings[len(queries):]

        sims_matrix = _cosine_similarity(q_embs, c_embs)  # shape: (queries, candidates)
        results: List[Tuple[Optional[str], float]] = []

        for i, sim_row in enumerate(sims_matrix):
            best_idx = int(sim_row.argmax())
            best_score = float(sim_row[best_idx])
            if best_score >= THRESHOLD:
                results.append((candidates[best_idx], round(best_score, 4)))
            else:
                results.append((None, round(best_score, 4)))

        return results
    except Exception as exc:
        logger.warning(f"[SEMANTIC MATCHER] batch_compute_similarity error: {exc}")
        return [(None, 0.0)] * len(queries)
