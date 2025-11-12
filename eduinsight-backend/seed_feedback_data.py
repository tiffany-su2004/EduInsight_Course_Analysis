import random
from faker import Faker
import psycopg2
from datetime import datetime, timedelta

fake = Faker()

# connect to your PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    dbname="eduinsight",
    user="postgres",
    password="tiffany123"
)
cur = conn.cursor()

# parameters
num_students = 100
num_courses = 10
num_instructors = 8
num_questions = 5        # make sure these exist in feedback_questions
num_feedback = 300       # how many overall feedback records to create

# --- Generate base tables: users & courses ---
print("Seeding base tables...")

# USERS (students)
for student_id in range(1, num_students + 1):
    full_name = fake.name()
    email = fake.email()
    role = 'student'
    password = 'hashed_dummy_password'   # placeholder just to satisfy NOT NULL
    created_at = fake.date_time_between(start_date="-6M", end_date="now")

    cur.execute("""
        INSERT INTO users (user_id, full_name, email, password, role, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO NOTHING
    """, (student_id, full_name, email, password, role, created_at))


# COURSES
for course_id in range(1, num_courses + 1):
    course_name = fake.catch_phrase()
    instructor_name = fake.name()
    created_at = fake.date_time_between(start_date="-6M", end_date="now")

    cur.execute("""
        INSERT INTO courses (course_id, course_name, instructor_name, created_at)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (course_id) DO NOTHING
    """, (course_id, course_name, instructor_name, created_at))

conn.commit()
print("Inserted users and courses.")


# --- Generate feedback ---
for _ in range(num_feedback):
    student_id = random.randint(1, num_students)
    course_id = random.randint(1, num_courses)
    rating = random.randint(1, 5)
    comment = fake.sentence()
    submitted_at = fake.date_time_between(start_date="-3M", end_date="now")
    created_at = submitted_at

    cur.execute("""
        INSERT INTO feedback (course_id, student_id, rating, comment, submitted_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (course_id, student_id, rating, comment, submitted_at, created_at))

conn.commit()
print("Inserted feedback records.")

# --- Generate responses ---
cur.execute("SELECT question_id, section FROM feedback_questions;")
questions = cur.fetchall()

cur.execute("SELECT feedback_id, course_id, student_id FROM feedback;")
all_feedback = cur.fetchall()

for fb_id, course_id, student_id in all_feedback:
    instructor_name = fake.name()
    for q_id, _ in questions:
        rating = random.randint(1, 5)
        created_at = fake.date_time_between(start_date="-3M", end_date="now")
        cur.execute("""
            INSERT INTO feedback_responses (student_id, course_id, instructor_name, question_id, rating, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (student_id, course_id, instructor_name, q_id, rating, created_at))

conn.commit()
print("Inserted response records.")

# --- Generate comments ---
for _ in range(200):
    student_id = random.randint(1, num_students)
    course_id = random.randint(1, num_courses)
    instructor_name = fake.name()
    course_comment = fake.paragraph(nb_sentences=2)
    instructor_comment = fake.paragraph(nb_sentences=2)
    created_at = fake.date_time_between(start_date="-3M", end_date="now")

    cur.execute("""
        INSERT INTO feedback_comments (student_id, course_id, instructor_name, course_comment, instructor_comment, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (student_id, course_id, instructor_name, course_comment, instructor_comment, created_at))

conn.commit()
cur.close()
conn.close()
print("Inserted comments.")
