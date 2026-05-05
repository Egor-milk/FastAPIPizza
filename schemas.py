from pydantic import BaseModel
from typing import List, Optional

class IngredientBase(BaseModel):
    name: str
    quantity: float = 0.0

class Ingredient(IngredientBase):
    id: int
    model_config = {
        "from_attributes": True
    }

class MenuItemBase(BaseModel):
    name: str
    price: float

class MenuItemCreate(MenuItemBase):
    pass

class MenuItem(MenuItemBase):
    id: int
    model_config = {
        "from_attributes": True
    }

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    customer_phone: Optional[str] = None
    items: List[OrderItemCreate]

class OrderItem(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    model_config = {
        "from_attributes": True
    }

class Order(BaseModel):
    id: int
    customer_id: Optional[int]
    status: str
    total: float
    model_config = {
        "from_attributes": True
    }

class CustomerCreate(BaseModel):
    name: str
    phone: str

class Customer(BaseModel):
    id: int
    name: str
    phone: str
    points: int
    model_config = {
        "from_attributes": True
    }
