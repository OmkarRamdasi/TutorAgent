from database import engine, Base
from models import User, Course, Document, LearningProgress

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")