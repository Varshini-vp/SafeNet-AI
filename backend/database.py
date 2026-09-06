import os
import copy
import uuid
import logging
from datetime import datetime
from config import Config

logger = logging.getLogger("safenet.database")

# In-memory mock collection that mirrors PyMongo interface
class FallbackCollection:
    def __init__(self, name):
        self.name = name
        self.documents = []

    def _matches(self, doc, query):
        if not query:
            return True
        for key, val in query.items():
            if key == "$or" and isinstance(val, list):
                if not any(self._matches(doc, cond) for cond in val):
                    return False
                continue
            if key not in doc:
                return False
            if isinstance(val, dict):
                if "$in" in val and doc[key] not in val["$in"]:
                    return False
                if "$gte" in val and doc[key] < val["$gte"]:
                    return False
                if "$lte" in val and doc[key] > val["$lte"]:
                    return False
                if "$gt" in val and doc[key] <= val["$gt"]:
                    return False
                if "$lt" in val and doc[key] >= val["$lt"]:
                    return False
                if "$ne" in val and doc[key] == val["$ne"]:
                    return False
            elif doc[key] != val:
                return False
        return True

    def find(self, query=None, projection=None, sort=None, limit=0, skip=0):
        query = query or {}
        results = [copy.deepcopy(d) for d in self.documents if self._matches(d, query)]
        if sort:
            for key, direction in reversed(sort):
                reverse = direction < 0
                results.sort(key=lambda x: str(x.get(key, "")), reverse=reverse)
        if skip:
            results = results[skip:]
        if limit:
            results = results[:limit]
        return results

    def find_one(self, query=None, projection=None):
        query = query or {}
        for d in self.documents:
            if self._matches(d, query):
                return copy.deepcopy(d)
        return None

    def insert_one(self, doc):
        d = copy.deepcopy(doc)
        if "_id" not in d:
            d["_id"] = str(uuid.uuid4())
        self.documents.append(d)
        class InsertResult:
            inserted_id = d["_id"]
        return InsertResult()

    def insert_many(self, docs):
        ids = []
        for doc in docs:
            res = self.insert_one(doc)
            ids.append(res.inserted_id)
        class InsertManyResult:
            inserted_ids = ids
        return InsertManyResult()

    def update_one(self, query, update):
        for d in self.documents:
            if self._matches(d, query):
                if "$set" in update:
                    d.update(update["$set"])
                class UpdateResult:
                    matched_count = 1
                    modified_count = 1
                return UpdateResult()
        class EmptyUpdateResult:
            matched_count = 0
            modified_count = 0
        return EmptyUpdateResult()

    def delete_one(self, query):
        for i, d in enumerate(self.documents):
            if self._matches(d, query):
                del self.documents[i]
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        class EmptyDeleteResult:
            deleted_count = 0
        return EmptyDeleteResult()

    def delete_many(self, query):
        initial = len(self.documents)
        self.documents = [d for d in self.documents if not self._matches(d, query)]
        class DeleteManyResult:
            deleted_count = initial - len(self.documents)
        return DeleteManyResult()

    def count_documents(self, query=None):
        query = query or {}
        return len([d for d in self.documents if self._matches(d, query)])

class FallbackDB:
    def __init__(self):
        self.users = FallbackCollection("users")
        self.cameras = FallbackCollection("cameras")
        self.vehicles = FallbackCollection("vehicles")
        self.alerts = FallbackCollection("alerts")
        self.traffic_records = FallbackCollection("traffic_records")
        self.risk_predictions = FallbackCollection("risk_predictions")
        self.system_config = FallbackCollection("system_config")

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_atlas = False
        self.status = "DISCONNECTED"

    def connect(self):
        mongo_uri = Config.MONGO_URI.strip()
        if mongo_uri:
            try:
                from pymongo import MongoClient
                self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2500)
                # Test connection ping
                self.client.admin.command('ping')
                self.db = self.client.get_database("safenet_db")
                self.is_atlas = True
                self.status = "CONNECTED_ATLAS"
                logger.info("Successfully connected to MongoDB Atlas!")
                return
            except Exception as e:
                logger.warning(f"MongoDB connection failed ({e}). Activating resilient local fallback store.")
        
        # Fallback to local in-memory store
        self.db = FallbackDB()
        self.is_atlas = False
        self.status = "CONNECTED_FALLBACK"
        logger.info("SafeNet Fallback Database active with PyMongo-compatible interface.")

db_manager = Database()

def get_db():
    if db_manager.db is None:
        db_manager.connect()
    return db_manager.db

def get_db_status():
    return {
        "status": db_manager.status,
        "is_atlas": db_manager.is_atlas,
        "database_type": "MongoDB Atlas" if db_manager.is_atlas else "Embedded Resilient Store (PyMongo Compatible)"
    }
