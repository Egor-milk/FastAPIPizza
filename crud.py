from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import models, schemas
from sqlalchemy import select

def get_customers(db: Session):
    return db.query(models.Customer).all()

def create_customer(db: Session, c: schemas.CustomerCreate):
    existing = db.query(models.Customer).filter(models.Customer.phone==c.phone).first()
    if existing:
        return existing
    customer = models.Customer(name=c.name, phone=c.phone)
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
        return customer
    except IntegrityError:
        db.rollback()
        return db.query(models.Customer).filter(models.Customer.phone==c.phone).first()


def create_menu_item(db: Session, m: schemas.MenuItemCreate):
    mi = models.MenuItem(name=m.name, price=m.price)
    db.add(mi)
    db.commit()
    db.refresh(mi)
    return mi

def get_menu_items(db: Session):
    return db.query(models.MenuItem).all()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):

    stmt2 = (
    ((select(
        models.OrderItem.id,
        models.OrderItem.quantity,
        models.MenuItem.name,
        models.MenuItem.price
    )
     .join(models.MenuItem, models.OrderItem.menu_item_id == models.MenuItem.id))
     .filter(models.OrderItem.order_id == order_id)))
    return db.execute(stmt2).mappings().all()

def create_order(db: Session, order: schemas.OrderCreate):
    # validate items exist
    for it in order.items:
        mi_check = db.query(models.MenuItem).filter(models.MenuItem.id==it.menu_item_id).first()
        if not mi_check:
            raise ValueError(f"Menu item {it.menu_item_id} not found")

    # find or create customer by phone
    customer = None
    if order.customer_phone:
        customer = db.query(models.Customer).filter(models.Customer.phone==order.customer_phone).first()
        if not customer:
            customer = models.Customer(name='Unknown', phone=order.customer_phone)
            db.add(customer)
            try:
                db.commit()
                db.refresh(customer)
            except IntegrityError:
                db.rollback()
                customer = db.query(models.Customer).filter(models.Customer.phone==order.customer_phone).first()

    total = 0.0
    new_order = models.Order(customer_id=(customer.id if customer else None), status='new', total=0.0)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    for it in order.items:
        mi = db.query(models.MenuItem).filter(models.MenuItem.id==it.menu_item_id).first()
        price = mi.price if mi else 0.0
        oi = models.OrderItem(order_id=new_order.id, menu_item_id=it.menu_item_id, quantity=it.quantity)
        db.add(oi)
        total += price * it.quantity
    new_order.total = total
    try:
        db.commit()
        db.refresh(new_order)
        return new_order
    except IntegrityError:
        db.rollback()
        raise

def get_active_orders(db: Session):
    return db.query(models.Order).filter(models.Order.status.in_(['new','preparing'])).all()
