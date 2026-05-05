from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import uvicorn
import models, schemas, crud, database

app = FastAPI(title="Simple Pizza POS")

# allow simple CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create DB tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

@app.post("/orders", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    try:
        return crud.create_order(db, order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        # generic DB error
        raise HTTPException(status_code=500, detail="Database integrity error")

@app.get("/orders")
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_orders(db, skip, limit)

@app.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(database.get_db)):
    return crud.get_order(db, order_id)

@app.get("/kds")
def kds_view(db: Session = Depends(database.get_db)):
    return crud.get_active_orders(db)

@app.post('/menu_items', response_model=schemas.MenuItem)
def create_menu_item(m: schemas.MenuItemCreate, db: Session = Depends(database.get_db)):
    return crud.create_menu_item(db, m)

@app.get('/menu_items', response_model=List[schemas.MenuItem])
def get_menu_items(db: Session = Depends(database.get_db)):
    return crud.get_menu_items(db)

@app.get("/crm/customers")
def list_customers(db: Session = Depends(database.get_db)):
    return crud.get_customers(db)

@app.post("/crm/customers", response_model=schemas.Customer)
def create_customer(c: schemas.CustomerCreate, db: Session = Depends(database.get_db)):
    return crud.create_customer(db, c)

if __name__ == "__main__":
    uvicorn.run("backend_app:app", host="0.0.0.0", port=8000, reload=True)
