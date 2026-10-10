"""In-memory event broadcaster for real-time Server-Sent Events (SSE) streaming (Phase D).
Provides thread-safe pub/sub queues for run events.
"""
import json
import queue
import logging
from typing import Dict, List, Any

logger = logging.getLogger("agentbreak.broadcaster")

class EventBroadcaster:
    """Thread-safe event broadcaster for live run streaming."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventBroadcaster, cls).__new__(cls)
            cls._instance._subscribers: Dict[str, List[queue.Queue]] = {}
        return cls._instance

    def subscribe(self, run_id: str) -> queue.Queue:
        """Register a new listener queue for a given run_id."""
        q = queue.Queue(maxsize=100)
        if run_id not in self._subscribers:
            self._subscribers[run_id] = []
        self._subscribers[run_id].append(q)
        return q

    def unsubscribe(self, run_id: str, q: queue.Queue):
        """Remove a listener queue."""
        if run_id in self._subscribers:
            try:
                self._subscribers[run_id].remove(q)
                if not self._subscribers[run_id]:
                    del self._subscribers[run_id]
            except ValueError:
                pass

    def broadcast(self, run_id: str, event_data: Dict[str, Any]):
        """Publish an event to all active listeners for the given run_id."""
        listeners = self._subscribers.get(run_id, [])
        for q in list(listeners):
            try:
                q.put_nowait(event_data)
            except queue.Full:
                logger.warning(f"Subscriber queue full for run {run_id}, dropping event.")

broadcaster = EventBroadcaster()
