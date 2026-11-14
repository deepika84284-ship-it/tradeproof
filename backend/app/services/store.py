import logging
from typing import Dict, Any, List
from app.database import get_database, is_connected, connect_to_mongo
from app.services.seed_data import (
    INITIAL_COMPANIES,
    INITIAL_USER_SESSION,
    INITIAL_MEMBERS,
    INITIAL_CONNECTIONS,
    INITIAL_POS,
    INITIAL_DISPATCHES,
    INITIAL_INVOICES,
    INITIAL_DISPUTES,
    INITIAL_PAYMENTS,
    INITIAL_NOTIFICATIONS,
    INITIAL_AUDIT_TRAIL,
    INITIAL_TICKETS,
)

logger = logging.getLogger("tradeproof.store")

# In-memory storage fallback
memory_store = {
    "companies": list(INITIAL_COMPANIES),
    "user_session": dict(INITIAL_USER_SESSION),
    "members": list(INITIAL_MEMBERS),
    "connections": list(INITIAL_CONNECTIONS),
    "purchase_orders": list(INITIAL_POS),
    "dispatches": list(INITIAL_DISPATCHES),
    "invoices": list(INITIAL_INVOICES),
    "disputes": list(INITIAL_DISPUTES),
    "payments": list(INITIAL_PAYMENTS),
    "notifications": list(INITIAL_NOTIFICATIONS),
    "audit_trail": list(INITIAL_AUDIT_TRAIL),
    "tickets": list(INITIAL_TICKETS),
}

async def seed_mongo_if_empty():
    db = get_database()
    if db is None or not is_connected():
        return

    try:
        collections = {
            "companies": INITIAL_COMPANIES,
            "members": INITIAL_MEMBERS,
            "connections": INITIAL_CONNECTIONS,
            "purchase_orders": INITIAL_POS,
            "dispatches": INITIAL_DISPATCHES,
            "invoices": INITIAL_INVOICES,
            "disputes": INITIAL_DISPUTES,
            "payments": INITIAL_PAYMENTS,
            "notifications": INITIAL_NOTIFICATIONS,
            "audit_trail": INITIAL_AUDIT_TRAIL,
            "tickets": INITIAL_TICKETS,
        }

        for coll_name, data in collections.items():
            coll = db[coll_name]
            count = await coll.count_documents({})
            if count == 0 and data:
                # remove any mongodb _id conflicts
                clean_data = [{k: v for k, v in item.items() if k != '_id'} for item in data]
                await coll.insert_many(clean_data)
                logger.info(f"Seeded {len(clean_data)} documents into MongoDB collection '{coll_name}'")

        # user session
        user_coll = db["users"]
        if await user_coll.count_documents({}) == 0:
            clean_user = {k: v for k, v in INITIAL_USER_SESSION.items() if k != '_id'}
            await user_coll.insert_one(clean_user)
            logger.info("Seeded default user session into MongoDB")

    except Exception as e:
        logger.error(f"Error seeding MongoDB: {e}")

async def ensure_db():
    if not is_connected():
        await connect_to_mongo()
    return get_database()

async def get_all(collection_name: str) -> List[Dict[str, Any]]:
    db = await ensure_db()
    if db is not None and is_connected():
        try:
            cursor = db[collection_name].find({}, {"_id": 0})
            docs = await cursor.to_list(length=1000)
            return docs
        except Exception as e:
            logger.error(f"MongoDB read error for {collection_name}: {e}. Falling back to memory store.")
    return memory_store.get(collection_name, [])

async def get_by_id(collection_name: str, item_id: str) -> Dict[str, Any] | None:
    db = await ensure_db()
    if db is not None and is_connected():
        try:
            doc = await db[collection_name].find_one({"id": item_id}, {"_id": 0})
            return doc
        except Exception as e:
            logger.error(f"MongoDB read error: {e}")
    items = memory_store.get(collection_name, [])
    for it in items:
        if it.get("id") == item_id:
            return it
    return None

async def insert_one(collection_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
    db = await ensure_db()
    clean_item = {k: v for k, v in item.items() if k != '_id'}
    if db is not None and is_connected():
        try:
            await db[collection_name].insert_one(dict(clean_item))
        except Exception as e:
            logger.error(f"MongoDB insert error for {collection_name}: {e}")
    # Always keep in-memory store in sync
    if collection_name in memory_store:
        memory_store[collection_name].insert(0, clean_item)
    return clean_item

async def update_one(collection_name: str, item_id: str, updates: Dict[str, Any]) -> Dict[str, Any] | None:
    db = await ensure_db()
    clean_updates = {k: v for k, v in updates.items() if k != '_id'}
    if db is not None and is_connected():
        try:
            await db[collection_name].update_one({"id": item_id}, {"$set": clean_updates})
        except Exception as e:
            logger.error(f"MongoDB update error: {e}")

    items = memory_store.get(collection_name, [])
    for it in items:
        if it.get("id") == item_id:
            it.update(clean_updates)
            return it
    return clean_updates
