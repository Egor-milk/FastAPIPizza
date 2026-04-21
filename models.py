from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, Table
from sqlalchemy.orm import relationship
from database import Base

# many-to-many: recipe items
class Ingredient(Base):
    __tablename__ = 'ingredients'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    quantity = Column(Float, default=0.0)  # in units (grams, pieces, etc.)

class MenuItem(Base):
    __tablename__ = 'menu_items'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float, default=0.0)

class Recipe(Base):
    __tablename__ = 'recipes'
    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey('menu_items.id'))
    ingredient_id = Column(Integer, ForeignKey('ingredients.id'))
    amount = Column(Float, default=0.0)  # amount of ingredient used

class Customer(Base):
    __tablename__ = 'customers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    points = Column(Integer, default=0)

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=True)
    status = Column(String, default='new')  # new, preparing, ready, delivered
    total = Column(Float, default=0.0)
    # simple relation not enforced here

class OrderItem(Base):
    __tablename__ = 'order_items'
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    menu_item_id = Column(Integer, ForeignKey('menu_items.id'))
    quantity = Column(Integer, default=1)

class Courier(Base):
    __tablename__ = 'couriers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    on_duty = Column(Boolean, default=False)
    lat = Column(Float, default=0.0)
    lon = Column(Float, default=0.0)
